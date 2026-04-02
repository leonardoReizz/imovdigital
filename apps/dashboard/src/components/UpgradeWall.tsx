import { Link } from 'react-router';
import { Lock, Zap } from 'lucide-react';

interface UpgradeWallProps {
  feature: string;
  description: string;
}

export function UpgradeWall({ feature, description }: UpgradeWallProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
        <Lock className="w-7 h-7 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{feature}</h2>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">{description}</p>
      <Link
        to="/dashboard/subscription"
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
      >
        <Zap className="w-4 h-4" />
        Fazer Upgrade
      </Link>
      <p className="text-xs text-gray-400 mt-3">Disponível nos planos pagos</p>
    </div>
  );
}
