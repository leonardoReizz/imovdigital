import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeWall } from '../components/UpgradeWall';

export function LeadsPage() {
  const { canAccessLeads } = useSubscription();

  if (!canAccessLeads) {
    return (
      <UpgradeWall
        feature="Painel de Leads"
        description="Receba e gerencie os contatos dos visitantes do seu site. Veja quem se interessou por cada imóvel e entre em contato diretamente."
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Leads</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">
          Nenhum lead recebido ainda. Os contatos dos visitantes aparecerão aqui.
        </p>
      </div>
    </div>
  );
}
