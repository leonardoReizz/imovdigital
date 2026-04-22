# Site Templates — Catálogo e Roadmap

Este documento descreve a linguagem visual de cada template e propõe variações futuras. Para o **como implementar**, leia a seção `# Site Templates` no `CLAUDE.md` da raiz.

---

## Templates atuais

### `classic` (default)
**Vibe:** institucional, claro, neutro. É o que a maioria dos sites de imobiliária usa hoje — funciona como "comum denominador" seguro.

**Linguagem visual:**
- Cards com borda fina, cantos arredondados (`rounded-xl`), sombras suaves no hover.
- Tipografia 100% sans-serif (Inter por padrão).
- Hero ocupa a tela inteira com texto sobreposto.
- Paleta neutra (gray-50/100/200), cor primária do tenant aparece em badges, botões e bordas de hover.
- Grid de imóveis em 2-3 colunas, cards quadrados.
- Header sticky com nav horizontal + ícones do Lucide.

**Quando recomendar:** primeiro acesso, tenant tradicional, imóveis de médio padrão.

---

### `editorial`
**Vibe:** revista de arquitetura, alto padrão, "magazine-like". Inspirado em sites tipo *Dezeen*, *Domus*, *Living*.

**Linguagem visual:**
- Tipografia mistura serifa (títulos, números, preços — Georgia como fallback) e sans-serif (corpo, navegação em uppercase tracked).
- Cards de imóveis sem borda, em proporção retrato 4:5, com label uppercase em overlay.
- Hero split: texto + bloco visual com cantos super arredondados (`rounded-[3rem]`) e elementos decorativos (círculo outline + bloco com opacidade da cor primária).
- Kickers em uppercase (`— Seleção`, `— Quem somos`, `— Catálogo`) como microcabeçalhos.
- Bordas finas em vez de cards: linhas separando blocos (`border-b border-stone-200`).
- Paleta off-white/stone (`stone-50/100`) em vez de gray puro.
- Footer escuro com descrição em serifa enorme + colunas estruturadas.
- Página de busca: heading editorial, paginação quadrada, cards 4:5 em até 3 colunas.
- Detalhe: título serifa 56px, sidebar com card de preço destacado em serifa, formulário inline com `border-bottom` em vez de inputs com borda.

**Quando recomendar:** imóveis de alto padrão, design/arquitetura, lançamentos boutique, mercados premium (Jardins, Leblon, etc.).

---

## Roadmap — próximos templates sugeridos

A ordem abaixo é uma sugestão por prioridade (combinação de "diferenciação visual" + "demanda provável do mercado imobiliário brasileiro"). Cada um é descrito por mood, traços visuais e quando recomendar — para que dê para abrir um destes e implementar seguindo o checklist do `CLAUDE.md`.

### 1. `minimalist`
**Vibe:** Apple, Airbnb, Notion. Branco-no-branco, espaço respirando, foco total no imóvel.

**Traços principais:**
- Tipografia única (sans, peso 400-600 só), tamanhos grandes mas peso baixo.
- Zero bordas, zero sombras. Separação por *whitespace* (paddings de `py-32`).
- Hero centralizado, texto fino, sem decorações — só o título, a foto e um botão "ghost" com underline animado.
- Cards de imóveis: imagem + 1 linha de título + preço. Sem badges, sem ícones de quartos/banheiros (vão para a página de detalhe).
- Cor primária aparece raramente — apenas em links/CTA, todo o resto é preto/branco/cinza-claríssimo (`gray-50`).
- Header transparente que ganha background no scroll.
- Footer minúsculo, 1 linha.

**Quando recomendar:** imobiliárias-conceito, foco em design, perfil "menos é mais".

**Risco:** pode parecer "vazio" para tenants com pouco conteúdo — talvez exigir mínimo de fotos por imóvel.

---

### 2. `bold`
**Vibe:** marketing agressivo, cor saturada, alto contraste. Tipo *Wise*, *Klarna*, banco digital.

**Traços principais:**
- Cor primária ocupa fundos inteiros de seções (não só botões).
- Tipografia display ultra-bold (peso 800-900), tamanhos enormes (`text-7xl` no hero).
- Cards com cantos super arredondados (`rounded-3xl`), sombras coloridas (sombra na cor primária com opacidade).
- Pílulas e tags em todo lugar: tipo do imóvel, modalidade, número de quartos — tudo vira pílula colorida.
- Animações sutis (hover com escala, parallax leve).
- Hero com formas geométricas grandes ao fundo (blob/blob com gradiente).
- Footer colorido (não preto), usando a cor primária.

**Quando recomendar:** tenants jovens, foco em aluguel de temporada, público millennial/gen-z, identidade visual forte.

**Risco:** depende de uma cor primária bem escolhida. Se o tenant usar marrom/cinza, o template perde graça.

---

### 3. `dark`
**Vibe:** cinema, luxury real estate, lofts industriais. Tipo *Aman*, *The Modern House*.

**Traços principais:**
- Modo escuro nativo (background `#0a0a0a`/`zinc-950`, texto `zinc-100/300`).
- Imagens ganham presença máxima — sem bordas, fotos sangram nas bordas da tela.
- Tipografia serifa de display (Playfair Display) nos títulos, sans (`Inter`/`Söhne`) no corpo.
- Detalhes em dourado/champagne em vez da cor primária pura (mistura primária + warm tone).
- Hero fullscreen com vídeo ou imagem de altíssima resolução, gradiente de baixo para cima preto.
- Cards com fundo `zinc-900`, hover revela mais informação fade-in.
- Galeria de detalhe em modo full-bleed lightbox.
- Header transparente sobre o hero, sticky com `backdrop-blur` em fundo escuro semitransparente.

**Quando recomendar:** imóveis de altíssimo padrão, casas de campo/praia, mercado de luxo, destaque para fotografia profissional.

**Risco:** depende muito de fotos de qualidade. Imobiliária com fotos amadoras vai ficar pior do que no `classic`.

---

### 4. `compact`
**Vibe:** Zillow, Imovelweb, Quintoandar — alta densidade de informação, foco em conversão rápida.

**Traços principais:**
- Cards menores e mais densos: 4 colunas em desktop, 2 em mobile.
- Filtros sempre visíveis (sidebar fixa, não colapsável, em desktop).
- Mapa lado a lado com lista na página de busca (split 50/50 quando viável).
- Tipografia compacta (`text-xs/sm`), informação de quartos/banheiros/vagas/preço bem visível em cada card.
- Badges de "Novo", "Reduzido", "Visitado" — interface tipo marketplace.
- Detalhe: tabs (Visão geral / Detalhes / Localização / Custos) em vez de scroll longo.
- Header com barra de busca inline (sempre acessível).
- Cor primária aparece em CTAs e badges promocionais.

**Quando recomendar:** imobiliárias com inventário grande (>200 imóveis), público que compara muito antes de decidir, foco em performance/conversão.

**Risco:** layout mais "comoditizado" — pode brigar visualmente com a identidade do tenant.

---

### 5. `coastal`
**Vibe:** litoral, casa de praia, lifestyle. Cores claras, azuis e areia, pegada vacation-rental.

**Traços principais:**
- Paleta off-white + azul claro + areia (`amber-50`, `sky-100`, `stone-50`).
- Fontes mistas: handwritten/script para acentos (não para corpo), sans clean para o resto.
- Ilustrações leves (linhas finas de palmeira, onda) como divisores entre seções.
- Hero com foto horizontal + búzio/ondinha decorativa no canto.
- Cards com cantos suaves (`rounded-2xl`), borda sutil em areia.
- Forma de busca destaca "Período" (check-in/out) em vez de só "Tipo/Bairro" — útil para temporada.
- CTABanner com fundo de gradiente arenoso.
- Footer com mapa estilizado da região.

**Quando recomendar:** imobiliárias de litoral (Floripa, Rio, Búzios, Bahia), foco em temporada, casas de praia.

**Risco:** muito específico — não funciona fora do contexto litorâneo.

---

## Como priorizar

Se for implementar mais um agora, a sugestão é **`minimalist`**: complementa bem o `editorial` (ambos premium, mas com personalidades opostas), tem demanda alta no mercado de design, e o trabalho técnico é o mais simples dos 5 (menos elementos visuais para mirror no preview).

`dark` é o segundo mais "vendável" mas exige mais cuidado com contraste/acessibilidade e tem dependência forte da qualidade das fotos do tenant.

`compact` é o mais útil em termos de UX para inventários grandes, mas é o que mais conflita com a ideia de "templates dão personalidade ao site" — ele padroniza em vez de diferenciar.
