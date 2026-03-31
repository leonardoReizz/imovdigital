export interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  propertyLimit: number;
  userLimit: number;
  features: Record<string, boolean>;
  stripePriceId: string | null;
}
