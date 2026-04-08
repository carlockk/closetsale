# ClosetSale

Tienda en Next.js con panel admin, catalogo, menus, paginas, slider, chat y gestion de pedidos.

## Variables de entorno

Copia [`.env.example`](C:\Users\enriq\Desktop\closetsale\.env.example) a `.env` y completa los valores:

```env
DATABASE_URL=""
AUTH_SECRET=""
NEXT_PUBLIC_SITE_URL=""
NEXT_PUBLIC_CHAT_TITLE=""
NEXT_PUBLIC_CHAT_TEAM_NAME=""
NEXT_PUBLIC_CHAT_PLACEHOLDER=""
NEXT_PUBLIC_CHAT_NAME_PLACEHOLDER=""
NEXT_PUBLIC_CHAT_HINT_PRIMARY=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
SEED_ADMIN_EMAIL=""
SEED_ADMIN_PASSWORD=""
```

Notas:
- `DATABASE_URL`: conexion PostgreSQL, por ejemplo Neon.
- `AUTH_SECRET`: secreto largo para autenticacion.
- `NEXT_PUBLIC_SITE_URL`: URL publica del sitio.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: necesarios para subir imagenes desde el admin.
- `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`: usados por el seed inicial.

## Desarrollo

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Build

```bash
npm run build
```
