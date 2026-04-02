import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface Limits {
  properties: number;
  users: number;
  customDomain: boolean;
  leads: boolean;
  team: boolean;
}

interface Usage {
  properties: number;
  users: number;
}

interface SubscriptionState {
  status: string; // TRIAL | ACTIVE | OVERDUE | CANCELED
  trialDaysLeft: number;
  trialExpired: boolean;
  planName: string;
  limits: Limits;
  usage: Usage;
  loaded: boolean;
}

interface SubscriptionContextValue extends SubscriptionState {
  refresh: () => Promise<void>;
  canAddProperty: boolean;
  canAddTeamMember: boolean;
  canUseCustomDomain: boolean;
  canAccessLeads: boolean;
  canAccessTeam: boolean;
  isTrial: boolean;
  isActive: boolean;
  isBlocked: boolean; // trial expired and not subscribed
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionState>({
    status: 'TRIAL',
    trialDaysLeft: 7,
    trialExpired: false,
    planName: '',
    limits: { properties: 10, users: 1, customDomain: false, leads: false, team: false },
    usage: { properties: 0, users: 0 },
    loaded: false,
  });

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/subscription');
      setState({
        status: data.tenant.subscriptionStatus,
        trialDaysLeft: data.tenant.trialDaysLeft,
        trialExpired: data.tenant.trialExpired,
        planName: data.currentPlan.name,
        limits: data.limits,
        usage: data.usage,
        loaded: true,
      });
    } catch {
      // If fails (not logged in), keep defaults
      setState((prev) => ({ ...prev, loaded: true }));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) refresh();
    else setState((prev) => ({ ...prev, loaded: true }));
  }, [refresh]);

  const isTrial = state.status === 'TRIAL';
  const isActive = state.status === 'ACTIVE';
  const isBlocked = isTrial && state.trialExpired;

  const value: SubscriptionContextValue = {
    ...state,
    refresh,
    canAddProperty: state.usage.properties < state.limits.properties,
    canAddTeamMember: state.limits.team && state.usage.users < state.limits.users,
    canUseCustomDomain: state.limits.customDomain,
    canAccessLeads: state.limits.leads,
    canAccessTeam: state.limits.team,
    isTrial,
    isActive,
    isBlocked,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
