import { LayoutStyle, SubscriptionStatus } from './enums';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layoutStyle: LayoutStyle;
  planId: string;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  planId: string;
}

export interface UpdateTenantDto {
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  layoutStyle?: LayoutStyle;
  customDomain?: string | null;
}

export interface PublicTenant {
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layoutStyle: LayoutStyle;
  contact: {
    whatsapp: string | null;
    phone: string | null;
    email: string | null;
    showForm: boolean;
  } | null;
}
