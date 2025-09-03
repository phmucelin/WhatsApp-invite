# WhatsApp Invite

Aplicação web para envio e gerenciamento de convites para eventos via WhatsApp.

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Prisma
- NextAuth.js
- Tailwind CSS
- Shadcn/UI
- Vercel Postgres
- Vercel Blob

## Funcionalidades

- Autenticação de usuários
- Criação e gerenciamento de eventos
- Upload de imagens para convites
- Importação de contatos via CSV
- Envio de convites via WhatsApp Web
- Página de RSVP para confirmação de presença
- Dashboard com estatísticas

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Vercel Postgres
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Execute as migrações do banco de dados:

```bash
npx prisma migrate dev
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Deploy

O projeto está configurado para deploy na Vercel. Você precisará:

1. Criar um projeto no Vercel
2. Conectar com o repositório do GitHub
3. Configurar as variáveis de ambiente na Vercel
4. Criar um banco de dados Postgres na Vercel
5. Configurar o Vercel Blob

## Licença

MIT
