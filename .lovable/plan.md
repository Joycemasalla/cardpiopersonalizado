

## Refatoração MVC — Arquitetura Organizada

### Problema Atual
Todo o código está concentrado em arquivos monolíticos: `AdminDashboard.tsx` tem 989 linhas com lógica de dados, estado e UI misturados. Não há separação de responsabilidades.

### Arquitetura MVC Proposta

```text
src/
├── models/            ← (M) Acesso a dados e lógica de negócio
│   ├── storeModel.ts         (CRUD stores no Supabase)
│   ├── categoryModel.ts      (CRUD categories + addons)
│   ├── productModel.ts       (CRUD products + variations)
│   ├── orderModel.ts         (queries + realtime orders)
│   └── authModel.ts          (auth + role check)
│
├── controllers/       ← (C) Hooks que orquestram Model ↔ View
│   ├── useAuthController.ts
│   ├── useStoreController.ts
│   ├── useCategoryController.ts
│   ├── useProductController.ts
│   ├── useOrderController.ts
│   ├── useCartController.ts
│   └── useImageUploadController.ts
│
├── views/             ← (V) Componentes visuais puros
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── StoreList.tsx
│   │   ├── StoreForm.tsx
│   │   ├── StoreConfigTab.tsx
│   │   ├── CategoriesTab.tsx
│   │   ├── ProductsTab.tsx
│   │   └── OrdersTab.tsx
│   ├── menu/                  (componentes públicos existentes)
│   └── ui/                    (shadcn, sem mudança)
│
├── lib/               ← Utilitários
│   ├── utils.ts
│   ├── colors.ts              (hexToHsl)
│   └── constants.ts           (labels de status, fluxo)
│
├── types/
│   └── store.ts               (mantém)
│
├── pages/             ← Orquestradores leves (~50-80 linhas)
│   ├── AdminDashboard.tsx
│   ├── StoreMenu.tsx
│   ├── StoreCart.tsx
│   └── ...
```

### O que cada camada faz

**Models** — Funções puras que encapsulam todas as chamadas ao Supabase. Não sabem nada sobre React. Exemplo:
- `storeModel.fetchBySlug(slug)` → retorna Store
- `productModel.create(data)` → insere produto
- `orderModel.subscribe(storeId, callback)` → realtime

**Controllers** — Custom hooks React que usam os Models via `useQuery`/`useMutation`. Gerenciam estado e lógica de fluxo. Exemplo:
- `useStoreController(storeId)` → retorna `{ store, updateStore, isLoading }`
- `useCartController(slug)` → retorna `{ cart, addItem, removeItem, total }`

**Views** — Componentes que recebem dados e callbacks via props. Zero lógica de negócio.

### Etapas de Implementação

1. **Criar `src/lib/colors.ts` e `src/lib/constants.ts`** — Mover `hexToHsl`, labels de status, fluxo de pedidos

2. **Criar Models** — Extrair todas as chamadas Supabase dos pages para `src/models/`

3. **Criar Controllers** — Extrair hooks com `useQuery`/`useMutation` para `src/controllers/`

4. **Criar Views do Admin** — Quebrar o AdminDashboard em 7 componentes visuais em `src/views/admin/`

5. **Mover componentes de menu** — De `src/components/menu/` para `src/views/menu/`

6. **Refatorar Pages** — Reduzir cada page para ~50-80 linhas, apenas conectando controller → view

7. **Migração DB** — Dropar tabelas `master_*` e `tenant_*` não utilizadas

### Resultado
- AdminDashboard: de 989 → ~60 linhas
- StoreMenu: de 290 → ~50 linhas
- Cada Model: 30-80 linhas, testável isoladamente
- Cada Controller: 40-100 linhas
- Cada View: 80-200 linhas, componente focado

