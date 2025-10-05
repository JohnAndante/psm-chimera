# Guia Completo: DataTable e useTableData

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Componentes do DataTable](#componentes-do-datatable)
4. [Hook useTableData](#hook-usetabledata)
5. [Implementação Passo a Passo](#implementação-passo-a-passo)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema de DataTable foi projetado para fornecer uma solução completa e performática para tabelas com:

- ✅ **Paginação server-side**
- ✅ **Ordenação server-side**
- ✅ **Filtros personalizáveis**
- ✅ **Loading states**
- ✅ **Animações suaves**
- ✅ **Responsividade**

### Componentes Principais

```plaintxt
📦 Sistema DataTable
├── 🎨 Componentes UI
│   ├── DataTable (custom-table.tsx)
│   ├── FilterControls (filter-controls.tsx)
│   └── FilterFields (filter-fields.tsx)
├── 🔧 Hook de Gerenciamento
│   └── useTableData (use-table-data.ts)
└── 📄 Componentes de Página
    ├── FilterFieldsComponent (ex: users-list-filter-fields.tsx)
    └── PageComponent (ex: users-list.tsx)
```

---

## Arquitetura do Sistema

### Fluxo de Dados

```plaintxt
┌─────────────────────────────────────────────────────────────┐
│                      Componente de Página                   │
│  (ex: UsersPage)                                            │
│                                                             │
│  1. Define defaultFilters                                   │
│  2. Gerencia estado de filtros (filters)                    │
│  3. Cria filterConfig com useMemo                           │
│  4. Usa useTableData hook                                   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Hook useTableData                       │
│                                                             │
│  • Gerencia paginação                                       │
│  • Gerencia ordenação                                       │
│  • Monitora mudanças de filtros                             │
│  • Faz fetch dos dados                                      │
│  • Retorna dados + metadata + handlers                      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Componentes de UI                        │
│                                                             │
│  FilterControls  →  Mostra botão de filtros + contador      │
│  FilterFields    →  Renderiza campos de filtro              │
│  DataTable       →  Renderiza tabela com dados              │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes do DataTable

### 1. DataTable (custom-table.tsx)

**Responsabilidade:** Renderizar a tabela com paginação, ordenação e animações.

#### Props

```typescript
interface DataTableProps<TData, TValue> {
    // Definição das colunas (obrigatório)
    columns: ColumnDef<TData, TValue>[]

    // Dados a serem exibidos (obrigatório)
    data: TData[]

    // Estado de loading
    isLoading?: boolean

    // Mostrar paginação
    showPagination?: boolean

    // Classes CSS customizadas
    className?: string

    // ========== Paginação Server-Side ==========
    manualPagination?: boolean
    pageCount?: number
    totalRecords?: number
    pagination?: { page: number; limit: number }
    onPaginationChange?: (pagination: { page: number; limit: number }) => void

    // ========== Ordenação Server-Side ==========
    manualSorting?: boolean
    sorting?: SortingState
    onSortingChange?: (sorting: SortingState) => void
}
```

#### Exemplo de Uso

```tsx
<DataTable
    columns={tableColumns}
    data={users}
    isLoading={isLoading}
    showPagination={true}

    // Paginação server-side
    manualPagination={true}
    pageCount={metadata ? Math.ceil(metadata.total / pagination.limit) : 0}
    totalRecords={metadata?.total ?? 0}
    pagination={pagination}
    onPaginationChange={handlePaginationChange}

    // Ordenação server-side
    manualSorting={true}
    sorting={sorting}
    onSortingChange={handleSortingChange}
/>
```

### 2. FilterControls (filter-controls.tsx)

**Responsabilidade:** Mostrar botão de filtros com contador de filtros ativos e botão de limpar.

#### Props

```typescript
interface FilterControlsProps {
    // Filtros atuais (array para suportar múltiplos objetos de filtro)
    currentFilters: Record<string, any>[]

    // Filtros padrão para comparação
    defaultFilters: Record<string, any>[]

    // Toggle de expansão dos campos de filtro
    onToggleExpanded: () => void

    // Callback para limpar filtros
    onClearFilters: () => void
}
```

#### Exemplo de Uso

```tsx
<FilterControls
    currentFilters={[filters]}
    defaultFilters={[defaultFilters]}
    onClearFilters={handleClearFilters}
    onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
/>
```

**Como funciona o contador:**

- Compara `currentFilters` com `defaultFilters` usando JSON.stringify
- Conta quantos filtros são diferentes dos valores padrão
- Exibe badge animado com o número de filtros ativos

### 3. FilterFields (filter-fields.tsx)

**Responsabilidade:** Container para campos de filtro com animação de expansão/colapso.

#### Props

```typescript
interface FilterFieldsProps<T> {
    // Valores atuais dos filtros
    filters: Partial<T>

    // Callback quando filtros são aplicados
    onFilterChange: (values: T) => void

    // Controle de expansão
    isExpanded: boolean

    // Estado de loading
    isLoading?: boolean

    // Campos de filtro a serem renderizados
    filterFields: React.ReactNode
}
```

#### Exemplo de Uso

```tsx
<FilterFields
    filters={filters}
    onFilterChange={handleApplyFilters}
    isExpanded={isFiltersExpanded}
    filterFields={<UserListFilterFields isLoading={isLoading} />}
    isLoading={isLoading}
/>
```

---

## Hook useTableData

### Visão Geral

Hook para gerenciar dados de tabelas com paginação, ordenação e filtros server-side de forma performática.

### Interface

```typescript
interface UseTableDataOptions<T> {
    // Função que busca dados da API (obrigatório)
    fetchFn: (filters: FilterConfig) => Promise<{
        data: T[];
        metadata?: TableMetadata;
    }>;

    // Filtros iniciais
    initialFilters?: FilterConfig;

    // Paginação inicial
    initialPage?: number;
    initialLimit?: number;

    // Ordenação inicial
    initialSorting?: SortingState[];

    // Auto-fetch ao montar
    autoFetch?: boolean;

    // Callback de erro
    onError?: (error: Error) => void;
}
```

### Retorno

```typescript
interface UseTableDataReturn<T> {
    data: T[];                          // Dados da página atual
    metadata: TableMetadata | null;     // Metadados da API
    isLoading: boolean;                 // Estado de carregamento
    pagination: PaginationState;        // Estado de paginação
    sorting: SortingState[];            // Estado de ordenação
    filters: FilterConfig;              // Filtros ativos
    pageCount: number;                  // Total de páginas
    totalRecords: number;               // Total de registros

    // Handlers
    handlePaginationChange: (updater: Partial<PaginationState>) => void;
    handleSortingChange: (sorting: SortingState[]) => void;
    handleFiltersChange: (filters: FilterConfig) => void;
    refetch: () => void;
}
```

### Como Funciona

1. **Inicialização:** Define estados internos de paginação, ordenação e filtros
2. **Monitoramento:** Usa `useEffect` para reagir a mudanças
3. **Fetch:** Combina paginação + ordenação + filtros e chama `fetchFn`
4. **Otimização:** Evita re-renders desnecessários com `useCallback` e `useMemo`

### Ciclo de Vida

```plaintxt
┌──────────────────────────────────────────────────────────┐
│ 1. initialFilters muda                                   │
│    ↓                                                     │
│ 2. useEffect atualiza filters internos                   │
│    ↓                                                     │
│ 3. Volta para página 1                                   │
│    ↓                                                     │
│ 4. Outro useEffect detecta mudança em filters            │
│    ↓                                                     │
│ 5. fetchData() é chamado                                 │
│    ↓                                                     │
│ 6. API retorna dados + metadata                          │
│    ↓                                                     │
│ 7. Estados são atualizados                               │
│    ↓                                                     │
│ 8. Componentes re-renderizam com novos dados             │
└──────────────────────────────────────────────────────────┘
```

---

## Implementação Passo a Passo

### Passo 1: Definir Tipos de Filtro

```typescript
// src/pages/YourPage/types.ts
export interface YourFilterState {
    name: string;
    status: "ALL" | "ACTIVE" | "INACTIVE";
    category: string;
}
```

### Passo 2: Criar Componente de Campos de Filtro

```typescript
// src/pages/YourPage/components/your-list-filter-fields.tsx
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YourListFilterFieldsProps {
    isLoading?: boolean;
}

export const YourListFilterFields = ({ isLoading }: YourListFilterFieldsProps) => (
    <>
        <FormField
            disabled={isLoading}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <Label>Nome</Label>
                    <FormControl>
                        <Input placeholder="Buscar..." {...field} />
                    </FormControl>
                </FormItem>
            )}
        />

        <FormField
            disabled={isLoading}
            name="status"
            render={({ field }) => (
                <FormItem>
                    <Label>Status</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                            <SelectItem value="INACTIVE">Inativo</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    </>
);
```

### Passo 3: Criar Página Principal

```typescript
// src/pages/YourPage/components/your-list.tsx
import { useState, useCallback, useMemo } from "react";
import { useTableData } from "@/hooks/use-table-data";
import { DataTable, FilterControls, FilterFields } from "@/components/data-table";
import type { YourFilterState } from "@/pages/YourPage/types";
import type { FilterConfig } from "@/types/filter-api";

export default function YourPage() {
    // ========== 1. Definir Filtros Padrão ==========
    const defaultFilters: YourFilterState = {
        name: "",
        status: "ALL",
        category: ""
    };

    // ========== 2. Estados Locais ==========
    const [filters, setFilters] = useState<YourFilterState>(defaultFilters);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    // ========== 3. Construir FilterConfig ==========
    const filterConfig = useMemo<FilterConfig>(() => {
        const config: FilterConfig = {};

        // Adicionar filtro de name (se não vazio)
        if (filters.name && filters.name.trim()) {
            if (!config.filter) config.filter = {};
            config.filter.name = { ilike: filters.name.trim() };
        }

        // Adicionar filtro de status (se não for "ALL")
        if (filters.status !== "ALL") {
            if (!config.filter) config.filter = {};
            config.filter.status = { eq: filters.status };
        }

        return config;
    }, [filters.name, filters.status]);

    // ========== 4. Usar Hook useTableData ==========
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
        initialFilters: filterConfig,
        onError: (error) => {
            toast.error("Erro ao carregar dados", {
                description: error.message
            });
        }
    });

    // ========== 5. Handlers ==========
    const handleApplyFilters = useCallback((newFilters: YourFilterState) => {
        setFilters(newFilters);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    // ========== 6. Definir Colunas ==========
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
        }
    ], []);

    // ========== 7. Renderizar ==========
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
}
```

---

## Exemplos Práticos

### Exemplo 1: Filtro Simples (Apenas Nome)

```typescript
const defaultFilters = { name: "" };
const [filters, setFilters] = useState(defaultFilters);

const filterConfig = useMemo<FilterConfig>(() => {
    const config: FilterConfig = {};

    if (filters.name?.trim()) {
        config.filter = { name: { ilike: filters.name.trim() } };
    }

    return config;
}, [filters.name]);
```

### Exemplo 2: Múltiplos Filtros

```typescript
const filterConfig = useMemo<FilterConfig>(() => {
    const config: FilterConfig = {};

    if (filters.search?.trim()) {
        config.filter = {
            OR: [
                { name: { ilike: filters.search } },
                { email: { ilike: filters.search } }
            ]
        };
    }

    if (filters.role !== "ALL") {
        if (!config.filter) config.filter = {};
        config.filter.role = { eq: filters.role };
    }

    if (filters.dateFrom) {
        if (!config.filter) config.filter = {};
        config.filter.createdAt = { gte: filters.dateFrom };
    }

    return config;
}, [filters.search, filters.role, filters.dateFrom]);
```

### Exemplo 3: Colunas com Formatação Customizada

```typescript
const tableColumns = useMemo(() => [
    {
        id: 'name',
        header: 'Nome',
        accessorKey: 'name',
        enableSorting: true,
    },
    {
        id: 'createdAt',
        header: 'Data de Criação',
        accessorKey: 'createdAt',
        enableSorting: true,
        cell: ({ row }) => (
            new Date(row.original.createdAt).toLocaleDateString('pt-BR')
        )
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
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
            <Button onClick={() => handleEdit(row.original)}>
                Editar
            </Button>
        )
    }
], [handleEdit]);
```

---

## Troubleshooting

### Problema: Filtros não são aplicados ao clicar em "Aplicar"

**Causa:** `filterConfig` não está sendo atualizado ou `initialFilters` não está mudando.

**Solução:** Certifique-se de que:

1. `filterConfig` usa `useMemo` com dependências corretas
2. `filters` está sendo atualizado no `handleApplyFilters`
3. `useTableData` recebe `initialFilters: filterConfig`

### Problema: Tabela re-fetcha múltiplas vezes ao aplicar filtros

**Causa:** Dependências incorretas causando re-renders em cascata.

**Solução:**

1. Use `useCallback` em todos os handlers
2. Use `useMemo` em `filterConfig` e `tableColumns`
3. Certifique-se que `fetchFn` é estável (não muda a cada render)

### Problema: Contador de filtros não aparece

**Causa:** Animação do `FilterControls` ou comparação de filtros falhando.

**Solução:** Verifique se:

1. `currentFilters` e `defaultFilters` são arrays
2. Valores padrão correspondem aos valores iniciais
3. Badge está sendo renderizado condicionalmente

### Problema: Paginação não volta para página 1 ao filtrar

**Causa:** `useTableData` não está resetando a página.

**Solução:** O hook já faz isso automaticamente quando `initialFilters` muda. Certifique-se de passar `filterConfig` como `initialFilters`.

### Problema: Loading state não funciona

**Causa:** `isLoading` do `useTableData` não está sendo passado corretamente.

**Solução:**

```typescript
const { isLoading } = useTableData(...);

// Passe para os componentes
<FilterFields isLoading={isLoading} />
<DataTable isLoading={isLoading} />
```

---

## Checklist de Implementação

- [ ] Criar tipos de filtro (`YourFilterState`)
- [ ] Criar componente de campos de filtro (`YourListFilterFields`)
- [ ] Definir `defaultFilters`
- [ ] Criar estado de `filters` com `useState`
- [ ] Criar `filterConfig` com `useMemo`
- [ ] Configurar `useTableData` com `initialFilters`
- [ ] Criar `handleApplyFilters` com `useCallback`
- [ ] Criar `handleClearFilters` com `useCallback`
- [ ] Definir `tableColumns` com `useMemo`
- [ ] Renderizar `FilterControls`
- [ ] Renderizar `FilterFields`
- [ ] Renderizar `DataTable`
- [ ] Testar filtros, paginação e ordenação
- [ ] Verificar performance (sem re-renders excessivos)

---

## Boas Práticas

### ✅ Faça

- Use `useMemo` para `filterConfig` e `tableColumns`
- Use `useCallback` para todos os handlers
- Defina `defaultFilters` como constante fora do estado
- Passe `filterConfig` como `initialFilters` para `useTableData`
- Use loading states em todos os componentes
- Valide dados antes de enviar para a API

### ❌ Não Faça

- Não recrie `fetchFn` a cada render
- Não use valores inline para `defaultFilters`
- Não esqueça de adicionar dependências corretas nos hooks
- Não mutate estados diretamente
- Não passe funções não memoizadas como props

---

## Conclusão

Este sistema de DataTable oferece uma solução completa, performática e reutilizável para tabelas com paginação, ordenação e filtros server-side. Seguindo este guia, você conseguirá implementar tabelas complexas de forma consistente e eficiente em todo o projeto.

Para dúvidas ou problemas, consulte a seção de [Troubleshooting](#troubleshooting) ou os exemplos em `src/pages/UsersPage/components/users-list.tsx`.
