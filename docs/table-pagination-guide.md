# 📖 Guia de Implementação: Paginação Server-Side

## 🎯 **Visão Geral**

Este guia mostra como implementar paginação, ordenação e filtros **server-side** usando o hook `useTableData` com a `DataTable`.

---

## 🔧 **Hook `useTableData`**

Já criado em: `frontend/src/hooks/use-table-data.ts`

### **Features:**

- ✅ Gerencia estado de paginação (page, limit)
- ✅ Gerencia estado de ordenação (sortBy, sortOrder)
- ✅ Gerencia filtros (FilterConfig)
- ✅ Faz fetch automático quando estado muda
- ✅ Retorna dados, metadata, loading state e callbacks

---

## 📝 **Exemplo de Uso Completo**

### **1. Modificar a API (já feito em users-api.ts)**

```typescript
// frontend/src/controllers/users-api.ts
class UsersApi {
    list(filters?: FilterConfig) {
        return new Promise<ApiResponse<BaseUser[]>>((resolve, reject) => {
            const url = buildApiUrl('v1/users', filters);

            this.axiosInstance.get(url)
                .then(response => {
                    const { data, metadata } = response.data;
                    resolve({ data, metadata }); // ✅ Retorna data e metadata
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }
}
```

### **2. Usar o Hook na Página**

```typescript
// frontend/src/pages/UsersPage/components/users-list.tsx
import { useTableData } from "@/hooks/use-table-data";
import { usersApi } from "@/controllers/users-api";

export default function UsersPage() {
    // ✅ Estados de filtros específicos da página
    const [filters, setFilters] = useState<UsersFilterState>({
        name: "",
        role: "ALL",
        active: "ALL"
    });

    // ✅ Hook que gerencia paginação + dados
    const {
        data: users,
        isLoading,
        pagination,
        totalRecords,
        pageCount,
        handlePaginationChange,
        handleFiltersChange,
        refetch
    } = useTableData<BaseUser>({
        fetchFn: (filterConfig) => usersApi.list(filterConfig),
        initialPage: 1,
        initialLimit: 10,
        autoFetch: true
    });

    // ✅ Aplicar filtros e resetar página
    const handleApplyFilters = () => {
        const apiFilters: FilterConfig = {
            filter: {}
        };

        // Converter filtros da UI para FilterConfig
        if (filters.name) {
            apiFilters.filter!.name = { ilike: filters.name };
        }

        if (filters.role !== "ALL") {
            apiFilters.filter!.role = { eq: filters.role };
        }

        if (filters.active !== "ALL") {
            apiFilters.filter!.active = { eq: filters.active === "true" };
        }

        // Atualiza filtros (volta pra página 1 automaticamente)
        handleFiltersChange(apiFilters);
    };

    return (
        <PageContainer>
            <PageCard>
                {/* Componentes de filtro */}
                <UsersActiveFilters
                    filters={filters}
                    onFilterChange={(key, value) => setFilters({...filters, [key]: value})}
                    onApplyFilters={handleApplyFilters}
                    isLoading={isLoading}
                />

                {/* ✅ DataTable com paginação server-side */}
                <DataTable
                    columns={tableColumns}
                    data={users}
                    isLoading={isLoading}

                    {/* Props de paginação server-side */}
                    showPagination={true}
                    manualPagination={true}
                    pageCount={pageCount}
                    totalRecords={totalRecords}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                />
            </PageCard>

            {/* Modais... */}
        </PageContainer>
    );
}
```

---

## 🔄 **Modificações Necessárias na DataTable**

### **Adicionar Props:**

```typescript
// frontend/src/components/data-table/index.tsx

interface DataTableProps<TData, TValue> {
    // ... props existentes

    // ✅ Props para paginação server-side
    manualPagination?: boolean
    pageCount?: number
    totalRecords?: number
    pagination?: { page: number; limit: number }
    onPaginationChange?: (pagination: { page: number; limit: number }) => void
}

export function DataTable<TData, TValue>({
    // ... props existentes
    manualPagination = false,
    pageCount: controlledPageCount,
    totalRecords: controlledTotalRecords,
    pagination: controlledPagination,
    onPaginationChange,
    ...props
}: DataTableProps<TData, TValue>) {

    // ✅ Estado interno (fallback quando não é manual)
    const [internalPagination, setInternalPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });

    // ✅ Usar paginação controlada ou interna
    const pagination = manualPagination && controlledPagination
        ? {
            pageIndex: controlledPagination.page - 1, // Converter: page 1 = index 0
            pageSize: controlledPagination.limit
          }
        : internalPagination;

    // ✅ Calcular pageCount baseado no modo
    const pageCount = manualPagination && controlledPageCount !== undefined
        ? controlledPageCount
        : Math.ceil(safeData.length / pagination.pageSize);

    // ✅ Total de registros
    const totalRecords = manualPagination && controlledTotalRecords !== undefined
        ? controlledTotalRecords
        : safeData.length;

    const table = useReactTable({
        data: safeData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

        // ✅ Configurar paginação manual
        manualPagination,
        pageCount,

        // ✅ Estado controlado
        state: {
            pagination
        },

        // ✅ Callback de mudança
        onPaginationChange: (updater) => {
            if (manualPagination && onPaginationChange) {
                const newPagination = typeof updater === 'function'
                    ? updater(pagination)
                    : updater;

                // Converter de volta: index 0 = page 1
                onPaginationChange({
                    page: newPagination.pageIndex + 1,
                    limit: newPagination.pageSize
                });
            } else {
                setInternalPagination(updater);
            }
        }
    });

    // ... resto do componente
}
```

### **Atualizar UI de Paginação:**

```typescript
// No final da DataTable, modificar a seção de paginação:

{showPagination && (
    <div className="flex items-center justify-between mt-4">
        {/* ✅ Total de registros (usa totalRecords do servidor) */}
        <div className="text-sm text-muted-foreground">
            {isLoading ? (
                <Skeleton className="h-4 w-32" />
            ) : (
                `Total de ${totalRecords} registro${totalRecords !== 1 ? 's' : ''}`
            )}
        </div>

        {/* ✅ Navegação de páginas */}
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <ChevronRightIcon className="w-4 h-4" />
            </Button>
        </div>

        {/* ✅ Seletor de limite */}
        <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">
                Registros por página
            </Label>
            <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                }}
            >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
)}
```

---

## 📊 **Fluxo Completo**

```
┌──────────────┐
│   UsersPage  │
└──────┬───────┘
       │
       │ 1. Usa useTableData()
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐              ┌──────────────────┐
│ handleFilter │              │ handlePagination │
│   Change     │              │     Change       │
└──────┬───────┘              └─────────┬────────┘
       │                                 │
       │ 2. Chama                       │
       │ handleFiltersChange()          │ onPaginationChange()
       │                                 │
       ▼                                 ▼
┌───────────────────────────────────────────────┐
│           useTableData Hook                   │
│  ├─ Atualiza state (filters/pagination)      │
│  ├─ Trigger fetchData()                       │
│  └─ Chama fetchFn(filterConfig)               │
└────────────────────┬──────────────────────────┘
                     │
                     │ 3. API Request
                     ▼
┌────────────────────────────────────────────┐
│  usersApi.list(filterConfig)              │
│  GET /api/v1/users?                        │
│    filter[name][ilike]=john&               │
│    pagination[page]=2&                     │
│    pagination[limit]=20                    │
└────────────────┬───────────────────────────┘
                 │
                 │ 4. Response
                 ▼
┌────────────────────────────────────────────┐
│  {                                          │
│    data: [...],                            │
│    metadata: {                              │
│      limit: 20,                            │
│      offset: 20,                           │
│      total: 156                            │
│    }                                        │
│  }                                          │
└────────────────┬───────────────────────────┘
                 │
                 │ 5. Update State
                 ▼
┌────────────────────────────────────────────┐
│  useTableData retorna:                     │
│  ├─ data: [...] (20 registros)             │
│  ├─ totalRecords: 156                      │
│  ├─ pageCount: 8 (156/20)                  │
│  └─ isLoading: false                       │
└────────────────┬───────────────────────────┘
                 │
                 │ 6. Render
                 ▼
┌────────────────────────────────────────────┐
│  DataTable                                  │
│  ├─ Mostra 20 registros                    │
│  ├─ "Total de 156 registros"               │
│  ├─ "Página 2 de 8"                        │
│  └─ Seletor: "20 registros por página"     │
└────────────────────────────────────────────┘
```

---

## ✅ **Checklist de Implementação**

### **Backend:**

- [x] API retorna `metadata: { limit, offset, total }`
- [x] API aceita `pagination[page]` e `pagination[limit]`
- [x] API aceita `filter[campo][operador]=valor`
- [x] API aceita `sort[0][field]=name&sort[0][order]=asc`

### **Frontend:**

- [x] Hook `useTableData` criado
- [ ] DataTable modificada com props de paginação server-side
- [ ] UsersPage usando o hook
- [ ] StoresPage usando o hook
- [ ] Remover filtros específicos da UsersPage que não fazem sentido

---

## 🎯 **Próximos Passos**

1. ✅ **Hook criado** - `use-table-data.ts` pronto
2. ⏳ **Modificar DataTable** - Adicionar props e lógica
3. ⏳ **Atualizar UsersPage** - Usar o hook
4. ⏳ **Atualizar StoresPage** - Usar o hook
5. ⏳ **Testar** - Validar paginação, filtros e ordenação

---

## 💡 **Vantagens dessa Abordagem**

- ✅ **Reutilizável:** Mesmo hook para Users, Stores, etc.
- ✅ **Performático:** Só busca os dados necessários
- ✅ **Escalável:** Suporta milhares de registros
- ✅ **Type-safe:** TypeScript em tudo
- ✅ **Testável:** Lógica separada da apresentação
- ✅ **Limpo:** Código organizado e manutenível

---

Quer que eu implemente as modificações na DataTable e UsersPage agora?
