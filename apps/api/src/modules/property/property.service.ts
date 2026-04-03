import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../../prisma/prisma.service';

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  COMMERCIAL: 'Imóvel Comercial',
  LAND: 'Terreno',
  RURAL: 'Imóvel Rural',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'Venda',
  RENT: 'Aluguel',
  BOTH: 'Venda e Aluguel',
};

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.property.findMany({ where: { tenantId } });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.property.findFirst({ where: { id, tenantId } });
  }

  async create(tenantId: string, data: any) {
    // Check property limit
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true, _count: { select: { properties: true } } },
    });
    if (tenant) {
      const limit = tenant.subscriptionStatus === 'TRIAL' ? 10 : tenant.plan.propertyLimit;
      if (tenant._count.properties >= limit) {
        throw new BadRequestException(
          `Limite de ${limit} imóveis atingido. Faça upgrade do seu plano.`,
        );
      }
    }

    return this.prisma.property.create({ data: { ...data, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
    const property = await this.prisma.property.findFirst({ where: { id, tenantId } });
    if (!property) throw new BadRequestException('Imóvel não encontrado');
    return this.prisma.property.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    const property = await this.prisma.property.findFirst({ where: { id, tenantId } });
    if (!property) throw new BadRequestException('Imóvel não encontrado');
    return this.prisma.property.delete({ where: { id } });
  }

  async generateSeo(data: any) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new BadRequestException(
        'Chave da API Anthropic não configurada. Adicione ANTHROPIC_API_KEY no .env',
      );
    }

    const type = TYPE_LABELS[data.type] || data.type || '';
    const listing = LISTING_LABELS[data.listingType] || data.listingType || '';
    const neighborhood = data.neighborhood || '';
    const city = data.city || '';
    const state = data.state || '';
    const bedrooms = data.bedrooms || '';
    const suites = data.suites || '';
    const bathrooms = data.bathrooms || '';
    const parkingSpots = data.parkingSpots || '';
    const area = data.area || '';
    const price = data.price
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.price / 100)
      : '';
    const amenities = (data.amenities || []).join(', ');
    const description = data.description || '';
    const title = data.title || '';

    const prompt = `Você é um especialista em SEO imobiliário brasileiro. Gere um meta title e uma meta description otimizados para o Google, com base nos dados do imóvel abaixo.

DADOS DO IMÓVEL:
- Título do anúncio: ${title}
- Tipo: ${type}
- Modalidade: ${listing}
- Localização: ${neighborhood}, ${city} - ${state}
- Quartos: ${bedrooms} | Suítes: ${suites} | Banheiros: ${bathrooms} | Vagas: ${parkingSpots}
- Área: ${area}m²
- Preço: ${price}
- Comodidades: ${amenities}
- Descrição do anúncio: ${description}

REGRAS OBRIGATÓRIAS:
1. Meta title: máximo 60 caracteres. Deve conter o tipo do imóvel, número de quartos (se houver) e a localização (bairro + cidade). Ser atrativo para cliques.
2. Meta description: entre 120 e 155 caracteres. Deve destacar os principais diferenciais, incluir a localização, e conter um call-to-action sutil ("Confira", "Agende sua visita", etc).
3. Use linguagem natural e persuasiva em pt-BR.
4. Inclua palavras-chave relevantes para busca imobiliária no Google.
5. NÃO use emojis.
6. NÃO exceda os limites de caracteres.

Responda APENAS em JSON válido, sem markdown, no formato:
{"metaTitle": "...", "metaDescription": "..."}`;

    const client = new Anthropic({ apiKey });

    let text = '';
    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      text =
        response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (err: any) {
      console.error('Anthropic API error:', err?.message || err);
      throw new BadRequestException(
        `Erro ao chamar a IA: ${err?.message || 'Falha na comunicação com a API'}`,
      );
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return {
        metaTitle: (parsed.metaTitle || '').slice(0, 60),
        metaDescription: (parsed.metaDescription || '').slice(0, 160),
      };
    } catch {
      console.error('Failed to parse AI response:', text);
      throw new BadRequestException('Erro ao processar resposta da IA. Tente novamente.');
    }
  }
}
