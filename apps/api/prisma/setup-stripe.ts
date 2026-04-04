import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
  if (match) process.env[match[1]] = match[2];
}

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const plans = await prisma.plan.findMany({ orderBy: { monthlyPrice: 'asc' } });

  for (const plan of plans) {
    console.log(`\n→ ${plan.name}`);

    // Create or find Stripe product
    const products = await stripe.products.search({ query: `metadata["slug"]:"${plan.slug}"` });
    let product: Stripe.Product;

    if (products.data.length > 0) {
      product = products.data[0];
      console.log(`  Produto existente: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: `ImovDigital - ${plan.name}`,
        metadata: { slug: plan.slug },
      });
      console.log(`  Produto criado: ${product.id}`);
    }

    // Create monthly price if not set
    if (!plan.stripePriceId) {
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'brl',
        recurring: { interval: 'month' },
      });
      await prisma.plan.update({
        where: { id: plan.id },
        data: { stripePriceId: monthlyPrice.id },
      });
      console.log(`  Preço mensal criado: ${monthlyPrice.id} (${plan.monthlyPrice / 100}/mês)`);
    } else {
      console.log(`  Preço mensal já existe: ${plan.stripePriceId}`);
    }

    // Create yearly price if not set
    if (!plan.stripeYearlyPriceId && plan.yearlyPrice) {
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.yearlyPrice,
        currency: 'brl',
        recurring: { interval: 'year' },
      });
      await prisma.plan.update({
        where: { id: plan.id },
        data: { stripeYearlyPriceId: yearlyPrice.id },
      });
      console.log(`  Preço anual criado: ${yearlyPrice.id} (${plan.yearlyPrice / 100}/ano)`);
    } else if (plan.stripeYearlyPriceId) {
      console.log(`  Preço anual já existe: ${plan.stripeYearlyPriceId}`);
    }
  }

  console.log('\n✅ Setup do Stripe concluído!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
