#!/usr/bin/env tsx

import { prisma } from "./index";

async function cleanAllData() {
  console.log("🧹 Limpiando TODA la base de datos (excepto super admin)...");
  console.log("⚠️  ADVERTENCIA: Esto eliminará TODOS los datos excepto el super admin!");
  
  try {
    // 1. Eliminar todas las órdenes
    console.log("🗑️  Eliminando todas las órdenes...");
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✅ Eliminadas ${deletedOrders.count} órdenes`);

    // 2. Eliminar todas las membresías
    console.log("🗑️  Eliminando todas las membresías...");
    const deletedMemberships = await prisma.membership.deleteMany({});
    console.log(`✅ Eliminadas ${deletedMemberships.count} membresías`);

    // 3. Eliminar todos los tenants
    console.log("🗑️  Eliminando todos los tenants...");
    const deletedTenants = await prisma.tenant.deleteMany({});
    console.log(`✅ Eliminados ${deletedTenants.count} tenants`);

    // 4. Eliminar todos los perfiles EXCEPTO super admins
    console.log("🗑️  Eliminando perfiles (excepto super admins)...");
    const deletedProfiles = await prisma.profile.deleteMany({
      where: {
        is_super_admin: false
      }
    });
    console.log(`✅ Eliminados ${deletedProfiles.count} perfiles (mantenidos los super admins)`);

    // 5. Mostrar resumen final
    const remainingProfiles = await prisma.profile.count();
    const remainingTenants = await prisma.tenant.count();
    const remainingMemberships = await prisma.membership.count();
    const remainingOrders = await prisma.order.count();

    console.log("\n📊 Estado final de la base de datos:");
    console.log(`- Perfiles restantes: ${remainingProfiles}`);
    console.log(`- Tenants restantes: ${remainingTenants}`);
    console.log(`- Membresías restantes: ${remainingMemberships}`);
    console.log(`- Órdenes restantes: ${remainingOrders}`);

    console.log("\n🎉 Base de datos limpiada exitosamente");
    console.log("✅ Ahora puedes hacer pruebas frescas sin conflictos");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanTestData() {
  console.log("🧹 Limpiando datos de prueba específicos...");
  
  try {
    // Eliminar en orden correcto respetando las foreign keys
    
    // 1. Eliminar órdenes de tenants de prueba
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        tenant: {
          OR: [
            { slug: { contains: "test" } },
            { slug: { contains: "empresa" } },
            { slug: { contains: "mi-" } },
            { name: { contains: "test" } },
            { name: { contains: "Test" } },
          ]
        }
      }
    });
    console.log(`✅ Eliminadas ${deletedOrders.count} órdenes de prueba`);

    // 2. Eliminar memberships de tenants/usuarios de prueba
    const deletedMemberships = await prisma.membership.deleteMany({
      where: {
        OR: [
          {
            tenant: {
              OR: [
                { slug: { contains: "test" } },
                { slug: { contains: "empresa" } },
                { slug: { contains: "mi-" } },
                { name: { contains: "test" } },
                { name: { contains: "Test" } },
              ]
            }
          },
          {
            user: {
              OR: [
                { email: { contains: "test" } },
                { email: { contains: "@example.com" } },
                { email: { contains: "@gmail.com" } }, // Solo si son de prueba
              ]
            }
          }
        ]
      }
    });
    console.log(`✅ Eliminadas ${deletedMemberships.count} membresías de prueba`);

    // 3. Eliminar tenants de prueba
    const deletedTenants = await prisma.tenant.deleteMany({
      where: {
        OR: [
          { slug: { contains: "test" } },
          { slug: { contains: "empresa" } },
          { slug: { contains: "mi-" } },
          { name: { contains: "test" } },
          { name: { contains: "Test" } },
          { name: { contains: "Empresa" } },
          { name: { contains: "Mi " } },
        ]
      }
    });
    console.log(`✅ Eliminados ${deletedTenants.count} tenants de prueba`);

    // 4. Eliminar perfiles de prueba (solo aquellos con email de prueba)
    const deletedProfiles = await prisma.profile.deleteMany({
      where: {
        AND: [
          { is_super_admin: false }, // No eliminar super admins
          {
            OR: [
              { email: { contains: "test" } },
              { email: { contains: "@example.com" } },
              // Agrega más patrones si necesitas
            ]
          }
        ]
      }
    });
    console.log(`✅ Eliminados ${deletedProfiles.count} perfiles de prueba`);

    // 5. Mostrar resumen de datos restantes
    const remainingProfiles = await prisma.profile.count();
    const remainingTenants = await prisma.tenant.count();
    const remainingMemberships = await prisma.membership.count();
    const remainingOrders = await prisma.order.count();

    console.log("\n📊 Datos restantes:");
    console.log(`- Perfiles: ${remainingProfiles}`);
    console.log(`- Tenants: ${remainingTenants}`);
    console.log(`- Membresías: ${remainingMemberships}`);
    console.log(`- Órdenes: ${remainingOrders}`);

    console.log("\n🎉 Limpieza selectiva completada exitosamente");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Permitir ejecutar limpieza completa con argumento
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--all') || args.includes('-a')) {
    console.log("⚠️  LIMPIEZA COMPLETA - Se eliminarán TODOS los datos excepto super admins");
    cleanAllData().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  } else {
    console.log("🎯 LIMPIEZA SELECTIVA - Solo datos de prueba");
    cleanTestData().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }
}

export { cleanTestData, cleanAllData };
