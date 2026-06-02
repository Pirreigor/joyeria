Backend MVP - Joyeria

Requisitos
- Node.js 20+

Instalacion
1) Copiar .env.example a .env
2) npm install
3) npm run prisma:migrate -- --name init
4) npm run prisma:generate
5) npm run seed
6) npm run dev

Credenciales admin seed
- email: admin@joyeria.local
- password: Admin12345

Endpoints principales
- GET /health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/products
- GET /api/products/:slug
- POST /api/orders
- GET /api/orders/mine
- POST /api/admin/products
- PATCH /api/admin/products/:id
- GET /api/admin/orders
- PATCH /api/admin/orders/:id/status
