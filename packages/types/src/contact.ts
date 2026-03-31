export interface ContactConfig {
  id: string;
  tenantId: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  showForm: boolean;
}

export interface UpdateContactConfigDto {
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  showForm?: boolean;
}
