# Development

## Install

- Node 18+
- npm workspaces: `npm install`
- Backend env: `backend/.env`
- Frontend env: `frontend/.env.local`

## Run

- `npm run dev:backend`
- `npm run dev:frontend`

## Test

- `npm run test --workspace=backend`

## Database

- `npm run db:migrate --workspace=backend`
- Prisma Studio: `npx prisma studio --schema=backend/prisma/schema.prisma`
