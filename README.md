# Instituto LUCIDEN — Sistema Web

Sistema web para el Instituto LUCIDEN: sitio público, panel de administración de estudiantes y panel de gestión de contenido.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (base de datos PostgreSQL + autenticación)
- Deploy: Vercel (automático al hacer push a `main`)

## Desarrollo local

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env.local` y completa las variables de Supabase antes de iniciar.

## Estructura

- `/` — Página pública del instituto
- `/registro`, `/login`, `/verificar-correo` — Autenticación de clientes
- `/cliente` — Panel del cliente
- `/admin-db` — Panel de administración de base de datos (estudiantes, historial)
- `/admin-contenido` — Panel de gestión visual del contenido público
