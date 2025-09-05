# Database Package (@repo/database)

Este paquete contiene la configuración de Prisma para todo el monorepo, incluyendo el schema de base de datos, el cliente y las utilidades relacionadas.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Configura las siguientes variables en tu archivo `.env.local`:

```env
# Base de datos PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 2. Generar el Cliente

```bash
# Desde la raíz del monorepo
yarn db:generate
```

### 3. Aplicar las Políticas de Row Level Security (RLS)

**⚠️ IMPORTANTE:** Después de crear el schema con Prisma, debes aplicar manualmente las políticas de seguridad:

```bash
# Conéctate a tu base de datos Supabase y ejecuta:
psql $DATABASE_URL -f packages/database/sql/rls_policies.sql
```

O desde el panel de Supabase SQL Editor, copia y pega el contenido de:
`packages/database/sql/rls_policies.sql`

Las políticas incluyen:

- ✅ Habilitación de RLS en todas las tablas
- ✅ Políticas multi-tenant para `tenants`, `memberships`, `invoices`
- ✅ Función helper `is_super_admin()`
- ✅ Políticas de acceso basadas en roles
  yarn db:generate

````

### 3. Aplicar el Schema (Solo desarrollo)

```bash
# Empuja el schema a la base de datos (desarrollo)
yarn db:push

# O usa migraciones para producción
yarn db:migrate
````

## 📊 Schema Actual

El schema incluye:

- **Profile**: Perfiles de usuario (conectado con Supabase Auth)
- **Tenant**: Organizaciones/inquilinos para multi-tenancy
- **Membership**: Relación usuario-organización con roles

## 🔧 Uso en las Aplicaciones

### Importar el Cliente

```typescript
import { prisma } from "@repo/database";
```

### Ejemplo de Uso

```typescript
// Obtener un tenant por slug
const tenant = await prisma.tenant.findUnique({
  where: { slug: "mi-organizacion" },
  include: { memberships: true },
});

// Crear un nuevo tenant
const newTenant = await prisma.tenant.create({
  data: {
    name: "Mi Organización",
    slug: "mi-organizacion",
    domain: "mi-org.com",
  },
});
```

## 🌱 Seeding

```bash
yarn db:seed
```

## 🎛️ Prisma Studio

Para explorar la base de datos visualmente:

```bash
yarn db:studio
```

## 🔄 Scripts Disponibles

- `yarn db:generate` - Generar el cliente de Prisma
- `yarn db:push` - Empujar schema a la DB (desarrollo)
- `yarn db:migrate` - Aplicar migraciones
- `yarn db:studio` - Abrir Prisma Studio
- `yarn db:seed` - Ejecutar seed de datos

## 🏗️ Estructura

```
packages/database/
├── prisma/
│   └── schema.prisma    # Schema de la base de datos
├── src/
│   ├── index.ts         # Cliente exportado
│   └── seed.ts          # Script de seeding
└── package.json
```
