# WhatsApp Invite

Aplicação web para envio e gerenciamento de convites para eventos via WhatsApp.

## Tecnologias

* Next.js 14 (App Router)
* TypeScript
* Prisma
* NextAuth.js
* Tailwind CSS
* Shadcn/UI
* Vercel Postgres
* Vercel Blob

## Funcionalidades

* Autenticação de usuários
* Criação e gerenciamento de eventos
* Upload de imagens para convites
* Importação de contatos via CSV
* Envio de convites via WhatsApp Web
* Página de RSVP para confirmação de presença
* Dashboard com estatísticas

## Configuração Local

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o banco de dados PostgreSQL local
4. Execute as migrações:

```bash
npx prisma migrate dev
```

5. Execute o seed para criar usuário de teste:

```bash
npx tsx prisma/seed.ts
```

6. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Deploy na Vercel

### Configuração Necessária

1. **Banco de Dados**: Crie um banco PostgreSQL na Vercel
2. **Variáveis de Ambiente**: Configure na dashboard da Vercel:
   - `DATABASE_URL`: URL do banco PostgreSQL da Vercel
   - `NEXTAUTH_URL`: URL da sua aplicação (ex: https://seu-app.vercel.app)
   - `NEXTAUTH_SECRET`: Chave secreta para NextAuth
   - `BLOB_READ_WRITE_TOKEN`: Token do Vercel Blob (opcional)

3. **Migrações**: Execute as migrações após o deploy:

```bash
npx prisma migrate deploy
```

### Usuário de Teste

Após o deploy, execute o seed para criar o usuário de teste:

- **Email**: `teste@chaischool.com`
- **Senha**: `123456`

## Licença

MIT