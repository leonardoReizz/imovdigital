import { Building2, Palette, Globe, BarChart3, CreditCard, Headphones } from 'lucide-react';

const features = [
  { icon: Building2, title: 'Gestão de Imóveis', description: 'Cadastre e gerencie todos os seus imóveis em um só lugar.' },
  { icon: Palette, title: 'Portal Personalizado', description: 'Sua marca, suas cores. Portal whitelabel completo.' },
  { icon: Globe, title: 'Domínio Próprio', description: 'Use seu próprio domínio para fortalecer sua marca.' },
  { icon: BarChart3, title: 'Leads e Analytics', description: 'Receba leads e acompanhe o desempenho do seu portal.' },
  { icon: CreditCard, title: 'Planos Flexíveis', description: 'Escolha o plano ideal para o tamanho da sua imobiliária.' },
  { icon: Headphones, title: 'Suporte Dedicado', description: 'Equipe pronta para ajudar sua imobiliária a crescer.' },
];

export function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">ImovDigital</span>
          <div className="flex items-center gap-4">
            <a href="#planos" className="text-sm text-gray-600 hover:text-gray-900">
              Planos
            </a>
            <a
              href="#"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Começar agora
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            O portal completo para sua imobiliária
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie seu portal de imóveis personalizado em minutos. Gerencie listagens,
            receba leads e fortaleça sua marca online.
          </p>
          <a
            href="#"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Teste grátis por 14 dias
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Tudo que sua imobiliária precisa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-gray-200">
                <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Planos e Preços
          </h2>
          <p className="text-gray-600 text-center mb-16">
            Escolha o plano ideal para a sua imobiliária
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Básico', price: 'R$149', properties: '30', users: '2', customDomain: false },
              { name: 'Profissional', price: 'R$299', properties: '150', users: '5', customDomain: true },
              { name: 'Multiunidade', price: 'R$499', properties: 'Ilimitado', users: 'Ilimitado', customDomain: true },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 border ${
                  plan.name === 'Profissional' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-200'
                }`}
              >
                {plan.name === 'Profissional' && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mt-4">{plan.name}</h3>
                <p className="text-4xl font-bold text-gray-900 mt-4">
                  {plan.price}
                  <span className="text-base font-normal text-gray-500">/mês</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li>Até {plan.properties} imóveis</li>
                  <li>Até {plan.users} usuários</li>
                  <li>{plan.customDomain ? 'Domínio próprio incluso' : 'Subdomínio imovdigital.com.br'}</li>
                </ul>
                <button className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Começar agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 ImovDigital. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
