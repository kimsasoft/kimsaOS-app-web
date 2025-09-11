#!/usr/bin/env tsx

import { prisma } from "./index";

async function forceCleanAll() {
  console.log("🧹 LIMPIEZA FORZADA - Eliminando todos los datos problemáticos...");
  
  try {
    // Crear nueva instancia de prisma para evitar conflictos
    
    console.log("1. Eliminando facturas...");
    await prisma.invoice.deleteMany({});
    
    console.log("2. Eliminando membresías...");
    await prisma.membership.deleteMany({});
    
    console.log("3. Eliminando tenants...");
    await prisma.tenant.deleteMany({});
    
    console.log("4. Eliminando perfiles no super admin...");
    await prisma.profile.deleteMany({
      where: {
        is_super_admin: false
      }
    });

    console.log("\n✅ Limpieza forzada completada");
    console.log("🎉 Base de datos reseteada - Solo queda el super admin");
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  forceCleanAll().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { forceCleanAll };
