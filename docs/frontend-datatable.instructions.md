# Frontend DataTable System - Technical Instructions

## Overview

Sistema completo para implementação de tabelas com paginação, ordenação e filtros server-side, otimizado para performance e reutilização.

---

## Component Architecture

### Core Components

```
frontend/src/components/data-table/
├── custom-table.tsx       # Tabela principal com TanStack Table
├── filter-controls.tsx    # Botão de filtros e contador
├── filter-fields.tsx      # Container de campos de filtro
└── index.tsx             # Exports centralizados
```

### Hook

```
frontend/src/hooks/
└── use-table-data.ts     # Gerenciamento de estado e fetch
```

---

## Implementation Pattern

### 1. Filter State Type

Define the shape of your filters:

```typescript
// src/pages/YourPage/types.ts
export interface YourFilterState {
    search: string;
    status: "ALL" | "ACTIVE" | "INACTIVE";
    dateFrom: string;
}
```

### 2. Filter Fields Component

Create a component that renders filter inputs using `FormField`:

```typescript
// src/pages/YourPage/components/your-list-filter-fields.tsx
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface YourListFilterFieldsProps {
    isLoading?: boolean;
}

export const YourListFilterFields = ({ isLoading }: YourListFilterFieldsProps) => (
    <>
        <FormField
            disabled={isLoading}
            name="search"
            render={({ field }) => (
                <FormItem>
                    <Label>Buscar</Label>
                    <FormControl>
                        <Input placeholder="Digite..." {...field} />
                    </FormControl>
                </FormItem>
            )}
        />
        {/* More fields... */}
    </>
);
```

**Important:** 
- Use `name` prop matching your `FilterState` keys
- Pass `isLoading` to disable fields during fetch
- Use `FormField` from shadcn/ui for consistency

### 3. Main Page Component

#### 3.1 Setup Filters

```typescript
// Define default filters (outside component or as const)
const defaultFilters: YourFilterState = {
    search: "",
    status: "ALL",
    dateFrom: ""
};

// Inside component
const [filters, setFilters] = useState<YourFilterState>(defaultFilters);
const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
```

#### 3.2 Create FilterConfig with useMemo

**Critical:** Use `useMemo` to prevent infinite loops and unnecessary re-renders.

```typescript
const filterConfig = useMemo<FilterConfig>(() => {
    const config: FilterConfig = {};

    // Add filters only if they have values
    if (filters.search?.trim()) {
        if (!config.filter) config.filter = {};
        config.filter.name = { ilike: filters.search.trim() };
    }

    if (filters.status !== "ALL") {
        if (!config.filter) config.filter = {};
        config.filter.status = { eq: filters.status };
    }

    return config;
}, [filters.search, filters.status]); // Only dependencies that affect filters
```

**Filter Operators:**
- `ilike`: Case-insensitive LIKE (for text search)
- `eq`: Equals
- `gte`: Greater than or equal
- `lte`: Less than or equal
- `in`: In array

#### 3.3 Use useTableData Hook

```typescript
const {
    data,
    isLoading,
    pagination,
    metadata,
    sorting,
    handlePaginationChange,
    handleSortingChange,
    refetch
} = useTableData<YourDataType>({
    fetchFn: async (config) => {
        const response = await yourApi.list(config);
        return {
            data: response.data ?? [],
            metadata: response.metadata!
        };
    },
    initialFilters: filterConfig, // Pass filterConfig here
    onError: (error) => {
        toast.error("Erro ao carregar dados", {
            description: error.message
        });
    }
});
```

**Key Points:**
- `fetchFn`: Must be stable (don't recreate on every render)
- `initialFilters`: Pass memoized `filterConfig`
- `onError`: Handle errors gracefully

#### 3.4 Create Handlers

**All handlers must use `useCallback` to prevent re-renders:**

```typescript
const handleApplyFilters = useCallback((newFilters: YourFilterState) => {
    setFilters(newFilters);
}, []);

const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
}, []);
```

#### 3.5 Define Table Columns

**Use `useMemo` for columns:**

```typescript
const tableColumns = useMemo(() => [
    {
        id: 'name',
        header: 'Nome',
        accessorKey: 'name',
        enableSorting: true,
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableSorting: true,
        cell: ({ row }) => (
            <Badge variant={row.original.active ? "success" : "destructive"}>
                {row.original.active ? "Ativo" : "Inativo"}
            </Badge>
        )
    },
    {
        id: 'actions',
        header: 'Ações',
        enableSorting: false,
        cell: ({ row }) => (
            <ActionButtons item={row.original} />
        )
    }
], [/* dependencies if using functions/variables */]);
```

**Column Properties:**
- `id`: Unique identifier (required)
- `header`: Column header text
- `accessorKey`: Key from data object
- `enableSorting`: Enable/disable sorting for this column
- `cell`: Custom cell renderer (optional)

#### 3.6 Render Components

```typescript
return (
    <PageCard
        cardTitle="Lista"
        cardExtra={(
            <FilterControls
                currentFilters={[filters]}
                defaultFilters={[defaultFilters]}
                onClearFilters={handleClearFilters}
                onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
            />
        )}
    >
        <FilterFields
            filters={filters}
            onFilterChange={handleApplyFilters}
            isExpanded={isFiltersExpanded}
            filterFields={<YourListFilterFields isLoading={isLoading} />}
            isLoading={isLoading}
        />

        <DataTable
            columns={tableColumns}
            data={data}
            isLoading={isLoading}
            showPagination={true}
            manualPagination={true}
            pageCount={metadata ? Math.ceil(metadata.total / pagination.limit) : 0}
            totalRecords={metadata?.total ?? 0}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            manualSorting={true}
            sorting={sorting}
            onSortingChange={handleSortingChange}
        />
    </PageCard>
);
```

---

## How useTableData Works

### Internal Flow

```
1. Component mounts
   ↓
2. initialFilters is set to filters state
   ↓
3. useEffect #1 detects initialFilters change
   → Updates internal filters state
   → Resets to page 1
   ↓
4. useEffect #2 detects filters change
   → Calls fetchData()
   ↓
5. fetchData combines filters + pagination + sorting
   → Calls fetchFn with complete FilterConfig
   ↓
6. API returns data + metadata
   ↓
7. States are updated
   ↓
8. Components re-render with new data
```

### When Data is Fetched

Data is fetched when:
- Component mounts (if `autoFetch: true`)
- `initialFilters` changes (when user applies filters)
- `pagination.page` changes
- `pagination.limit` changes
- `sorting` changes
- `refetch()` is called manually

### Performance Optimizations

1. **Memoization:**
   - `filterConfig` is memoized to prevent unnecessary re-creation
   - `tableColumns` is memoized to prevent table re-renders
   - All handlers use `useCallback`

2. **Single Fetch:**
   - Only 1 fetch per action (no duplicate requests)
   - `initialFilters` pattern prevents fetchFn re-creation

3. **Lazy Updates:**
   - Filters are only applied when user clicks "Apply"
   - Not on every keystroke

---

## API Contract

### Request Format

The hook sends a `FilterConfig` object to your API:

```typescript
{
    page: 1,
    limit: 10,
    filter: {
        name: { ilike: "john" },
        role: { eq: "ADMIN" }
    },
    orderBy: {
        createdAt: "desc"
    }
}
```

### Response Format

Your API must return:

```typescript
{
    data: T[],              // Array of items
    metadata: {
        total: number,      // Total records (all pages)
        limit: number,      // Items per page
        offset: number      // Current offset
    }
}
```

---

## Common Patterns

### Pattern 1: Search Multiple Fields

```typescript
const filterConfig = useMemo<FilterConfig>(() => {
    const config: FilterConfig = {};

    if (filters.search?.trim()) {
        config.filter = {
            OR: [
                { name: { ilike: filters.search } },
                { email: { ilike: filters.search } },
                { phone: { ilike: filters.search } }
            ]
        };
    }

    return config;
}, [filters.search]);
```

### Pattern 2: Date Range Filter

```typescript
if (filters.dateFrom) {
    if (!config.filter) config.filter = {};
    config.filter.createdAt = { gte: filters.dateFrom };
}

if (filters.dateTo) {
    if (!config.filter) config.filter = {};
    config.filter.createdAt = { 
        ...config.filter.createdAt,
        lte: filters.dateTo 
    };
}
```

### Pattern 3: Multi-Select Filter

```typescript
if (filters.categories.length > 0) {
    if (!config.filter) config.filter = {};
    config.filter.categoryId = { in: filters.categories };
}
```

### Pattern 4: Custom Cell with Actions

```typescript
const getActionButtons = useCallback((item: YourType) => (
    <>
        <Button onClick={() => handleEdit(item)}>Edit</Button>
        <Button onClick={() => handleDelete(item)}>Delete</Button>
    </>
), [handleEdit, handleDelete]);

const tableColumns = useMemo(() => [
    // ... other columns
    {
        id: 'actions',
        header: 'Ações',
        enableSorting: false,
        cell: ({ row }) => getActionButtons(row.original)
    }
], [getActionButtons]);
```

---

## Troubleshooting Guide

### Issue: Infinite Loop / Too Many Renders

**Cause:** Dependencies not memoized or `fetchFn` recreated on every render.

**Solution:**
1. Ensure `filterConfig` uses `useMemo`
2. Ensure handlers use `useCallback`
3. Ensure `tableColumns` uses `useMemo`
4. Don't recreate `fetchFn` - use inline or stable reference

### Issue: Filters Not Applied

**Cause:** `initialFilters` not updating or `filterConfig` not changing.

**Solution:**
1. Check `filterConfig` dependencies in `useMemo`
2. Verify `setFilters` is called in `handleApplyFilters`
3. Confirm `initialFilters` is passed to `useTableData`

### Issue: Double Fetch on Filter Apply

**Cause:** Wrong implementation pattern causing two state updates.

**Solution:**
- Use the `initialFilters` pattern (current implementation)
- Don't manually call `refetch()` after setting filters

### Issue: Filter Badge Not Showing

**Cause:** Filter comparison failing or animation issue.

**Solution:**
1. Ensure `currentFilters` and `defaultFilters` are arrays
2. Check if default values match initial state
3. Verify `FilterControls` is receiving correct props

---

## Best Practices

### DO ✅

- Use `useMemo` for `filterConfig` and `tableColumns`
- Use `useCallback` for all event handlers
- Define `defaultFilters` as const outside component or at top
- Pass `filterConfig` as `initialFilters` to `useTableData`
- Validate and sanitize filter values before building config
- Handle loading states in all components
- Show meaningful error messages to users

### DON'T ❌

- Don't recreate `fetchFn` on every render
- Don't use inline objects for `defaultFilters`
- Don't forget dependencies in `useMemo`/`useCallback`
- Don't mutate state directly
- Don't call `refetch()` after every state change
- Don't pass unstable functions as props

---

## Performance Checklist

- [ ] `filterConfig` uses `useMemo` with correct dependencies
- [ ] `tableColumns` uses `useMemo`
- [ ] All handlers use `useCallback`
- [ ] `fetchFn` is stable (not recreated)
- [ ] No inline object creation in props
- [ ] Loading states prevent duplicate actions
- [ ] API returns only necessary data
- [ ] Pagination limits are reasonable (10-100)

---

## Migration from Old Pattern

If migrating from a pattern where `fetchFn` had dependencies:

**Old (❌):**
```typescript
const fetchUsers = useCallback(async (filterConfig: FilterConfig) => {
    // Uses filters.name, filters.role, etc.
    const response = await usersApi.list(filterConfig);
    return response;
}, [filters.name, filters.role]); // Dependencies cause re-creation

const { data } = useTableData({ fetchFn: fetchUsers });
```

**New (✅):**
```typescript
const filterConfig = useMemo<FilterConfig>(() => {
    const config: FilterConfig = {};
    if (filters.name) config.filter = { name: { ilike: filters.name } };
    return config;
}, [filters.name]);

const { data } = useTableData({
    fetchFn: async (config) => {
        const response = await usersApi.list(config);
        return { data: response.data, metadata: response.metadata };
    },
    initialFilters: filterConfig
});
```

---

## Reference Example

See complete working example:
- **Page:** `frontend/src/pages/UsersPage/components/users-list.tsx`
- **Filter Fields:** `frontend/src/pages/UsersPage/components/users-list-filter-fields.tsx`
- **Types:** `frontend/src/pages/UsersPage/types.ts`

---

## Support

For questions or issues:
1. Check [Troubleshooting Guide](#troubleshooting-guide)
2. Review reference example in UsersPage
3. Consult detailed documentation in `docs/data-table-usage-guide.md`
