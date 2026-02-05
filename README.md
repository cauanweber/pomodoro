<div align="center">
  <!--
  Se você quiser uma logo, adicione em: public/assets/logo.png
  e descomente a linha abaixo:
  <img src="public/assets/logo.png" width="110" alt="Logo Pomodoro" />
  -->
  <h1>Pomodoro Fullstack App</h1>
  <p>Aplicação Pomodoro fullstack para portfólio, com autenticação, persistência de sessões e UI moderna.</p>
  <p>
    <img src="https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+" />
    <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
    <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
    <img src="https://img.shields.io/badge/License-Attribution%20Required-0f766e" alt="Attribution Required License" />
  </p>
</div>

<div align="center">
  <img src="public/assets/dashboard-desktop.png" alt="Dashboard desktop" width="900" />
  <br />
  <img src="public/assets/dashboard-mobile.png" alt="Dashboard mobile" width="320" />
</div>

## Funcionalidades
- Autenticação (login/cadastro) com JWT
- Pomodoro com foco/pausa e presets
- Configurações de duração e auto‑start
- Histórico de sessões com data e hora
- UI responsiva com animações sutis
- Som ao iniciar/terminar ciclos

## Stack
**Frontend**
- React + Vite + TypeScript
- Motion (animações)

**Backend**
- Node.js + Express
- PostgreSQL + Prisma
- JWT Authentication

## Arquitetura
Frontend (React/Vite) → Backend (Express) → Banco (PostgreSQL via Prisma)

## Estrutura
- `public/` — frontend (Vite)
- `server/` — backend (Express + Prisma)

## Dependências

### Requisitos
- Node.js 18+ (recomendado 20+)
- npm 9+
- PostgreSQL 13+

### Pacotes (principais)
**Frontend**
- `react`, `react-dom`, `react-router-dom`
- `motion`
- `axios`

**Backend**
- `express`
- `prisma`, `@prisma/client`, `pg`, `@prisma/adapter-pg`
- `bcrypt`
- `jsonwebtoken`

## Como rodar localmente

### 1) Backend
```bash
cd server
npm install
```

Crie o banco de dados no PostgreSQL (exemplo):
```bash
createdb pomodoro
```

Crie o arquivo `.env`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=sua_chave_segura
CORS_ORIGIN=http://localhost:5173
```

Rode as migrações e o servidor:
```bash
npx prisma migrate deploy
npm run dev
```

Endpoint de saúde:
```
GET http://localhost:3333/health
```

### 2) Frontend
```bash
cd public
npm install
```

Crie o arquivo `.env`:
```
VITE_API_URL=http://localhost:3333
```

Inicie o app:
```bash
npm run dev
```

Abra:
```
http://localhost:5173
```

## (Opcional) Rodar com Docker

Se preferir subir tudo com Docker, use o `docker-compose.yml` já existente no backend.

```bash
cd server
docker compose up -d
```

Depois rode as migrações:
```bash
npx prisma migrate deploy
```

## Scripts úteis

**Frontend**
- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — lint

**Backend**
- `npm run dev` — ambiente de desenvolvimento

## API
**Auth**
- `POST /auth/register`
- `POST /auth/login`

**Pomodoro**
- `POST /pomodoro/session`
- `GET /pomodoro/sessions`

**Health**
- `GET /health`

## Observações
- Projeto focado em portfólio: pronto para demonstração local e deploy simples.
- Para produção real, recomenda‑se adicionar rate‑limit, validação com schema e headers de segurança.

## Licença
Este projeto é distribuído sob a licença “Attribution Required” (créditos obrigatórios ao autor).
