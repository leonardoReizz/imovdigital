import { LeadSource } from './enums';

export interface Lead {
  id: string;
  tenantId: string;
  propertyId: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: LeadSource;
  seen: boolean;
  createdAt: Date;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  source: LeadSource;
}
