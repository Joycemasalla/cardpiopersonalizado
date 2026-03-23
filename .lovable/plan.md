
## Cardápio Digital White Label — Plano Completo

### Visão Geral
Criar uma plataforma de cardápio digital multi-tenant onde cada restaurante tem seu próprio cardápio personalizado com marca, cores, logo e produtos — tudo gerenciado por um único sistema. Cada restaurante acessa via slug na URL (ex: `/r/restaurante1`), com possibilidade futura de domínio próprio.

---

### Estrutura Multi-Tenant

**Identificação por slug na URL**: `seusite.com/r/nome-do-restaurante`
- Simples de implementar, sem configuração de DNS
- Fácil de escalar para domínios próprios no futuro

---

### Backend (Supabase / Lovable Cloud)

**Tabelas principais:**

1. **`stores`** — Dados de cada restaurante/loja
   - Nome, slug, logo, cores (primária, secundária, fundo), WhatsApp, endereço, PIX, horários, taxas, status (aberto/fechado), mensagem de fechado

2. **`categories`** — Categorias por loja
   - Vinculada a `store_id`, com nome, imagem, ordem, ativo/inativo

3. **`products`** — Produtos por loja
   - Vinculado a `store_id` e `category_id`, com nome, descrição, preço, imagem, destaque, ordem

4. **`product_variations`** — Variações (tamanhos, sabores)
   - Vinculada a `product_id`

5. **`category_addons`** — Adicionais por categoria
   - Vinculada a `category_id`

6. **`promotions`** — Promoções por produto

7. **`orders`** — Pedidos por loja
   - Com nome do cliente, telefone, tipo (entrega/retirada/mesa), itens, total, status

8. **`user_roles`** — Controle de acesso (admin da plataforma vs admin da loja)

9. **`store_admins`** — Relaciona usuários com suas lojas

**Autenticação:** Email/senha para admins de loja

---

### Páginas Públicas (Cardápio do Cliente)

1. **Landing Page** (`/`) — Página institucional da plataforma white label
   - Apresentação do serviço, CTA para criar cardápio

2. **Cardápio da Loja** (`/r/:slug`) — Cardápio completo personalizado
   - Header com logo e cores da loja
   - Banner hero personalizável
   - Banner de promoção do dia (rodízio, almoço especial)
   - Dropdown/navegação de categorias
   - Lista de produtos (grid no desktop, lista no mobile)
   - Modal de detalhes do produto com variações e adicionais
   - Botão flutuante do WhatsApp
   - Overlay de loja fechada

3. **Carrinho** (`/r/:slug/cart`) — Carrinho de compras
   - Resumo dos itens, observações, tipo de pedido
   - Envio do pedido via WhatsApp

4. **Políticas** (`/r/:slug/termos`, `/r/:slug/privacidade`)

---

### Painel Admin da Loja (`/admin`)

1. **Configurações da Loja**
   - Nome, logo, cores da marca, WhatsApp, endereço, PIX
   - Horários de funcionamento, dias de operação
   - Taxa de entrega, prazos estimados
   - Mensagem de loja fechada, modo manutenção

2. **Gerenciar Categorias**
   - CRUD de categorias com imagem e ordenação drag-and-drop

3. **Gerenciar Produtos**
   - CRUD de produtos com imagem, variações e adicionais
   - Marcar como destaque, ativar/desativar

4. **Gerenciar Pedidos**
   - Listagem de pedidos com status (pendente → confirmado → preparando → pronto → entregue)
   - Relatório diário

5. **Promoções**
   - Criar promoções com desconto percentual e período

---

### Personalização Visual por Loja

Cada loja configura no painel:
- **Logo** (upload de imagem)
- **Cor primária** (botões, destaques)
- **Cor de fundo**
- **Cor do texto**
- **Banner hero** (imagem + texto)

As cores são aplicadas dinamicamente via CSS variables quando o cardápio é carregado.

---

### Funcionalidades Especiais
- **Tempo real**: Atualização automática dos produtos (Supabase Realtime)
- **Responsivo**: Layout de lista no mobile, grid no desktop
- **Scroll to top** e **botão do WhatsApp** flutuantes
- **Consent de cookies**
- **Onboarding** do primeiro admin da loja

---

### Ordem de Implementação

1. Setup do banco de dados multi-tenant (stores, categories, products, etc.)
2. Autenticação e controle de acesso por loja
3. Painel admin com gestão de loja, categorias e produtos
4. Cardápio público com personalização visual dinâmica
5. Carrinho e envio de pedido via WhatsApp
6. Gestão de pedidos no admin
7. Landing page da plataforma
