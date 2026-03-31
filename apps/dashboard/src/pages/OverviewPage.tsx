import { Building2, MessageSquare, Users, TrendingUp } from 'lucide-react';

const cards = [
  { label: 'Total de Imóveis', value: '0', icon: Building2, color: 'bg-blue-500' },
  { label: 'Leads do Mês', value: '0', icon: MessageSquare, color: 'bg-green-500' },
  { label: 'Usuários Ativos', value: '0', icon: Users, color: 'bg-purple-500' },
  { label: 'Visualizações', value: '0', icon: TrendingUp, color: 'bg-orange-500' },
];

export function OverviewPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                {card.label}
              </span>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Últimos Leads
        </h3>
        <p className="text-gray-500 text-sm">
          Nenhum lead recebido ainda. Os leads aparecerão aqui quando visitantes
          entrarem em contato pelo seu portal.
        </p>
      </div>
    </div>
  );
}
