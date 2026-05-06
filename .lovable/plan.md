
# Pacote de profissionalização do cardápio

Quatro melhorias de alto impacto, sem excesso de emojis. Toda iconografia usa ícones do `lucide-react` (já instalado), mantendo o visual limpo e consistente com o tema Aureum Noir / branding dinâmico da loja.

---

## 1. Badges nos produtos (Novo, Destaque, Mais Pedido)

**O que muda no admin (`ProductsTab.tsx`)**
- Novo seletor "Selo" no formulário de produto, com opções: *Nenhum*, *Novo*, *Destaque do Chef*, *Mais Pedido*, *Promoção*.
- Aproveita a coluna `is_featured` que já existe + adiciona uma nova coluna `badge` (text, nullable) na tabela `products`.

**O que muda no cardápio (`ProductCard.tsx` e `ProductListItem.tsx`)**
- Badge discreta no canto superior esquerdo da imagem do produto.
- Estilo: pill pequena com fundo translúcido, ícone Lucide (`Sparkles`, `Flame`, `Star`, `Tag`) + label curta.
- Usa cor primária da loja para se integrar ao branding dinâmico.

**Migração de banco**
```sql
ALTER TABLE products ADD COLUMN badge text;
```

---

## 2. Header com status, tempo e taxa de entrega

**O que muda (`StoreHeader.tsx` e `HeroBanner.tsx`)**
- Nova faixa de informações logo abaixo do nome da loja, com três itens separados por divisores verticais:
  - **Status**: ponto colorido (verde/vermelho) + "Aberto" ou "Fechado" — calculado a partir de `is_open` e `operating_hours`.
  - **Tempo estimado**: ícone `Clock` + valor de `stores.estimated_delivery_time` (ex: "30-45 min").
  - **Entrega**: ícone `Bike` + valor formatado de `stores.delivery_fee` (ex: "R$ 5,00" ou "Grátis" se 0).
- Quando algum campo está vazio no admin, o item simplesmente não aparece (sem placeholder feio).

**Sem migração** — todos os campos já existem na tabela `stores`.

---

## 3. Busca no cardápio

**Novo componente `MenuSearch.tsx`**
- Campo de busca fixo no topo do `StoreMenu`, logo acima do `CategoryNav`.
- Ícone `Search` à esquerda, botão `X` para limpar à direita quando há texto.
- Debounce de 200ms para não travar em listas grandes.

**Integração no `useMenuController.ts`**
- Novo estado `searchQuery`.
- Filtro aplicado sobre produtos (nome + descrição, case-insensitive, sem acentos).
- Quando há busca ativa: `CategoryNav` é ocultado e os produtos são exibidos numa lista única ordenada por relevância.
- Mensagem amigável quando nenhum resultado é encontrado.

---

## 4. Ícones nas categorias

**O que muda no admin (`CategoriesTab.tsx`)**
- Novo campo "Ícone" no formulário da categoria — seletor visual com ~24 ícones Lucide pré-curados (Pizza, Beef, Coffee, IceCream, Salad, Wine, Sandwich, Cake, Soup, Cookie, etc.) + opção *Sem ícone*.
- Salvo como string com o nome do ícone na nova coluna `icon` da tabela `categories`.

**O que muda no cardápio (`CategoryNav.tsx`)**
- Cada pill horizontal renderiza o ícone à esquerda do nome da categoria.
- Mantém compatibilidade: categoria sem ícone exibe só o texto.

**Migração de banco**
```sql
ALTER TABLE categories ADD COLUMN icon text;
```

---

## Detalhes técnicos

**Arquivos novos**
- `src/components/menu/MenuSearch.tsx`
- `src/components/menu/StoreInfoBar.tsx` (faixa de status/tempo/taxa)
- `src/components/menu/ProductBadge.tsx` (renderiza a badge no card)
- `src/components/admin/IconPicker.tsx` (seletor visual de ícones Lucide)
- `src/lib/categoryIcons.ts` (mapa nome → componente Lucide)
- `src/lib/productBadges.ts` (mapa badge → label + ícone + cor)

**Arquivos editados**
- `src/types/store.ts` — adicionar `badge?: string` em `MenuProduct` e `icon?: string` em `MenuCategory`.
- `src/views/admin/ProductsTab.tsx` — campo de badge.
- `src/views/admin/CategoriesTab.tsx` — campo de ícone.
- `src/components/menu/ProductCard.tsx` e `ProductListItem.tsx` — renderizar badge.
- `src/components/menu/CategoryNav.tsx` — renderizar ícone.
- `src/components/menu/StoreHeader.tsx` ou `HeroBanner.tsx` — incluir `StoreInfoBar`.
- `src/pages/StoreMenu.tsx` — incluir `MenuSearch` e usar resultado filtrado.
- `src/controllers/useMenuController.ts` — estado e lógica de busca.
- `src/models/productModel.ts` e `categoryModel.ts` — incluir os novos campos no select/insert/update.

**Migrações Supabase (uma única)**
```sql
ALTER TABLE products ADD COLUMN badge text;
ALTER TABLE categories ADD COLUMN icon text;
```

**Sem dependências novas** — `lucide-react` já está instalado e o seletor de ícones será montado com ele.

---

## Fora do escopo deste plano (para ciclos futuros)

- Cálculo de taxa por bairro/CEP
- Sistema de cupons
- Tela de acompanhamento de pedido
- PWA / Open Graph dinâmico

Aprove para eu seguir para a implementação.
