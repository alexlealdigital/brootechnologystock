# 📦 Sistema de Controle de Estoque com Supabase

Um sistema completo de controle de estoque construído com **React**, **TypeScript**, **Tailwind CSS** e **Supabase**, pronto para fazer deploy no Netlify.

## ✨ Funcionalidades

- ✅ **Autenticação de Usuários** - Login/Signup com Supabase Auth
- ✅ **Gerenciamento de Produtos** - Criar, editar e deletar produtos
- ✅ **Movimentações de Estoque** - Registrar entradas e saídas
- ✅ **Relatórios** - Produtos com estoque baixo e acima do máximo
- ✅ **Dashboard** - Estatísticas em tempo real
- ✅ **Sincronização em Tempo Real** - Dados sincronizados entre dispositivos
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile

## 🚀 Início Rápido

### 1. Clonar o Repositório

```bash
git clone <seu-repositorio>
cd stock-control-complete
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://vmadrbcnwsjzpegcfcoi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtYWRyYmNud3NqenBlZ2NmY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODI2MzgsImV4cCI6MjA5MTI1ODYzOH0.getUUvxdxmApfoNEapbFO-jfEtNB1EhxUyUDsQKhCMg
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### 5. Build para Produção

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
stock-control-complete/
├── src/
│   ├── components/
│   │   └── ui/              # Componentes UI reutilizáveis
│   ├── contexts/            # Contextos React
│   │   ├── InventoryContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   └── useInventory.ts  # Hook para gerenciar inventário
│   ├── lib/
│   │   ├── supabase.ts      # Configuração do Supabase
│   │   └── utils.ts         # Utilitários
│   ├── pages/               # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── Movements.tsx
│   │   └── Reports.tsx
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── netlify.toml             # Configuração para Netlify
└── .env.example             # Exemplo de variáveis de ambiente
```

## 🗄️ Banco de Dados

O projeto usa **Supabase** com as seguintes tabelas:

### `users`
- Dados dos usuários autenticados

### `products`
- Produtos do inventário
- Campos: name, sku, category, quantity, min_quantity, max_quantity, unit_price

### `movements`
- Movimentações de estoque
- Campos: product_id, type (entrada/saida), quantity, reason, date

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Autenticação com Supabase Auth
- ✅ Cada usuário só vê seus dados
- ✅ Variáveis de ambiente protegidas

## 🌐 Deploy no Netlify

### 1. Conectar Repositório

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Selecione seu repositório GitHub

### 2. Configurar Build

- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3. Adicionar Variáveis de Ambiente

No painel do Netlify, vá para **Settings → Environment** e adicione:

```
VITE_SUPABASE_URL=https://vmadrbcnwsjzpegcfcoi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Deploy

Clique em "Deploy" e aguarde a conclusão.

## 📊 Páginas da Aplicação

### Login
- Formulário de login/signup
- Integrado com Supabase Auth

### Home (Dashboard)
- Estatísticas gerais
- Atalhos para outras páginas

### Produtos
- Tabela com todos os produtos
- CRUD completo (Criar, Ler, Atualizar, Deletar)
- Modal para adicionar/editar

### Movimentações
- Histórico de entradas e saídas
- Registrar novas movimentações
- Filtro por tipo

### Relatórios
- Produtos com estoque baixo
- Produtos com estoque acima do máximo
- Análises em tempo real

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Supabase** - Backend e banco de dados
- **Wouter** - Roteamento
- **Lucide React** - Ícones

## 📝 Scripts Disponíveis

```bash
npm run dev          # Executar em desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis estão corretas

### Erro: "RLS policy violation"
- Certifique-se de que você está autenticado
- Verifique as políticas de segurança no Supabase

### Erro: "CORS error"
- Adicione seu domínio em Supabase → Settings → API → Allowed Origins

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Docs](https://vitejs.dev)

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do Supabase ou abra uma issue no repositório.

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando React + Supabase**
