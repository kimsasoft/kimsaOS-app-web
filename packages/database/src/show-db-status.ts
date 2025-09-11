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
        domain: true,
        created_at: true,
      }
    });
    
    console.log("\n🏢 EMPRESAS (TENANTS):");
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   Domain: ${tenant.domain || 'Sin dominio'}`);
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

    // Mostrar facturas
    const invoices = await prisma.invoice.findMany({
      include: {
        tenant: {
          select: { name: true, slug: true }
        }
      }
    });
    
    console.log("\n📄 FACTURAS:");
    if (invoices.length === 0) {
      console.log("No hay facturas");
    } else {
      invoices.forEach((invoice, index) => {
        console.log(`${index + 1}. ${invoice.number} - $${invoice.amount}`);
        console.log(`   Tenant: ${invoice.tenant.name}`);
        console.log(`   Estado: ${invoice.status}`);
        console.log(`   Creado: ${invoice.created_at.toISOString()}`);
        console.log();
      });
    }

    console.log("\n📈 RESUMEN:");
    console.log(`- Perfiles: ${profiles.length}`);
    console.log(`- Empresas: ${tenants.length}`);
    console.log(`- Membresías: ${memberships.length}`);
    console.log(`- Facturas: ${invoices.length}`);

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
