import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Básico',
      slug: 'basico',
      monthlyPrice: 14900, // R$149,00
      propertyLimit: 30,
      userLimit: 2,
      features: { customDomain: false, analytics: false },
      stripePriceId: null,
    },
    {
      name: 'Profissional',
      slug: 'profissional',
      monthlyPrice: 29900, // R$299,00
      propertyLimit: 150,
      userLimit: 5,
      features: { customDomain: true, analytics: true },
      stripePriceId: null,
    },
    {
      name: 'Multiunidade',
      slug: 'multiunidade',
      monthlyPrice: 49900, // R$499,00
      propertyLimit: -1, // unlimited
      userLimit: -1, // unlimited
      features: { customDomain: true, analytics: true, prioritySupport: true },
      stripePriceId: null,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
