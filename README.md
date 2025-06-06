# AI-Scribe (Home-Health OASIS G & GG)

A home‑health documentation tool.  
Record/upload audio → AI transcribes → automatically fills OASIS‑E Section  G & GG → nurse reviews/edits forms in UI.

## 1  . Tech  Stack
| Layer              | Tech                                      |
|--------------------|-------------------------------------------|
| **Frontend**       | React  +  Vite  +  TypeScript • shadcn/ui |
| **Backend**        | Node  20 • Express • Zod                  |
| **Database / ORM** | PostgreSQL  15 • Prisma                   |
| **Jobs**           | pg‑boss                                   |
| **AI**             | OpenAI                                    |

## 2  . Prerequisites
* Node ≥ 20
* npm ≥ 9
* PostgreSQL 15 

## 3  . Clone  & Install
```bash
cd ai-scribe
npm install
```

## 4  . Database Setup
```bash
cd backend
cp .env.example .env # Set DATABASE_URL and OPENAI_API_KEY in .env
npx prisma migrate dev --name init
npm run seed
```

`DATABASE_URL` example  
`postgresql://postgres:postgres@localhost:5432/ai_scribe`

## 5  . Run Backend
```bash
npm run dev
```

## 6  . Run Frontend
```bash
cd ../frontend
cp .env.example .env # Set VITE_API_URL if needed
npm run dev
```

## 7  . Directory Overview
```
shared/
backend/
  ├─ src/
  ├─ prisma/
frontend/
  └─ src/
```
## 8  . Environment  Variables
| File            | Variable               | Default Value |
|-----------------|------------------------|---------------|
| `backend/.env`  | **PORT**               | 4000          |
| `backend/.env`  | **DATABASE_URL**       | —             |
| `backend/.env`  | **OPENAI_API_KEY**     | —             |
| `backend/.env`  | **AUDIO_STORAGE_PATH** | `./uploads`   |
| `frontend/.env` | **VITE_API_URL**       | —             |
