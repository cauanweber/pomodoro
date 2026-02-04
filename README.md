# Pomodoro Fullstack App

Aplicação Pomodoro fullstack feita para portfólio, com autenticação, persistência de sessões e UI inspirada em design moderno.

## Funcionalidades
- Autenticação (login/cadastro) com JWT
- Pomodoro com foco/pausa e presets
- Configurações de duração e auto‑start
- Histórico de sessões com data e hora
- UI responsiva com animações sutis
- Som ao iniciar/terminar ciclos

## Screenshots
**Desktop**
![Dashboard desktop](public/assets/screenshots/dashboard-desktop.png)

**Mobile**
![Dashboard mobile](public/assets/screenshots/dashboard-mobile.png)

## Stack
**Frontend**
- React + Vite + TypeScript
- Motion (animações)

**Backend**
- Node.js + Express
- PostgreSQL + Prisma
- JWT Authentication

## Estrutura
- `public/` — frontend (Vite)
- `server/` — backend (Express + Prisma)

## Como rodar localmente

### 1) Backend
```bash
cd server
npm install
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
npm run dev
```

Abra:
```
http://localhost:5173
```

## Variáveis de ambiente

### Backend (`server/.env`)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=sua_chave_segura
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`public/.env`)
```
VITE_API_URL=http://localhost:3333
```

## Observações
- Projeto focado em portfólio: pronto para demonstração local e deploy simples.
- Para produção real, recomenda‑se adicionar rate‑limit, validação com schema e headers de segurança.
