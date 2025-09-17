#!/usr/bin/env tsx

import { prisma } from "./index";

async function showDatabaseStatus() {
  console.log("📊 Estado actual de la base de datos:");
  console.log("=" .repeat(50));
  
  try {
    // Mostrar todos los perfiles
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        is_super_admin: true,
        created_at: true,
      }
    });
    
    console.log("\n👤 PERFILES:");
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email} (${profile.full_name || 'Sin nombre'})`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Super Admin: ${profile.is_super_admin}`);
      console.log(`   Creado: ${profile.created_at.toISOString()}`);
      console.log();
    });

    // Mostrar todos los tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true,
      }
    });
    
    console.log("\n🏢 EMPRESAS (TENANTS):");
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Creado: ${tenant.created_at.toISOString()}`);
      console.log();
    });

    // Mostrar todas las membresías
    const memberships = await prisma.membership.findMany({
      include: {
        user: {
          select: { email: true, full_name: true }
        },
        tenant: {
          select: { name: true, slug: true }
        }
      }
    });
    
    console.log("\n🤝 MEMBRESÍAS:");
    memberships.forEach((membership, index) => {
      console.log(`${index + 1}. ${membership.user.email} → ${membership.tenant.name}`);
      console.log(`   Rol: ${membership.role}`);
      console.log(`   Tenant Slug: ${membership.tenant.slug}`);
      console.log(`   Creado: ${membership.created_at.toISOString()}`);
      console.log();
    });

    // Mostrar órdenes
    const orders = await prisma.order.findMany({
      include: {
        tenant: {
          select: { name: true, slug: true }
        }
      }
    });
    
    console.log("\n📄 ÓRDENES:");
    if (orders.length === 0) {
      console.log("No hay órdenes");
    } else {
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.number} - $${order.total}`);
        console.log(`   Tenant: ${order.tenant.name}`);
        console.log(`   Estado: ${order.status}`);
        console.log(`   Creado: ${order.created_at.toISOString()}`);
        console.log();
      });
    }

    console.log("\n📈 RESUMEN:");
    console.log(`- Perfiles: ${profiles.length}`);
    console.log(`- Empresas: ${tenants.length}`);
    console.log(`- Membresías: ${memberships.length}`);
    console.log(`- Órdenes: ${orders.length}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  showDatabaseStatus().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { showDatabaseStatus };
