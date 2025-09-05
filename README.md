# Monorepo: Next.js + Supabase + Prisma + Shadcn UI + Yarn Workspaces

Un monorepo completo para aplicaciones multi-tenant con autenticación, base de datos y componentes UI compartidos.

## 🏗️ Estructura

```
├── apps/
│   ├── web/          # Aplicación principal (puerto 3000)
│   └── admin/        # Panel administrativo (puerto 3001)
├── packages/
│   ├── ui/           # Componentes UI compartidos (Shadcn)
│   ├── supabase/     # Cliente de Supabase configurado
│   └── database/     # Prisma ORM y schema
```

## 🚀 Configuración Inicial

### 1. Instalar dependencias

```bash
yarn install
```

### 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y configura:

- URL y API key de Supabase
- String de conexión a la base de datos PostgreSQL

### 3. Configurar base de datos

```bash
# Generar cliente de Prisma
yarn db:generate

# Aplicar schema (desarrollo)
yarn db:push

# Poblar con datos iniciales
yarn db:seed
```

## 🎯 Desarrollo

```bash
yarn dev
# web:   http://localhost:3000
# admin: http://localhost:3001
```

## 📊 Base de Datos

```bash
# Generar cliente después de cambios en schema
yarn db:generate

# Explorar datos con Prisma Studio
yarn db:studio

# Aplicar migraciones
yarn db:migrate
```

## 📦 Paquetes

- **@repo/ui**: Componentes UI basados en Shadcn
- **@repo/supabase**: Cliente de Supabase pre-configurado
- **@repo/database**: Cliente de Prisma y schema de DB
