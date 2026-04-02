export interface BusinessHours {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

export interface ContactConfig {
  id: string;
  tenantId: string;
  whatsapp: string | null;
  whatsappMessage: string | null;
  phone: string | null;
  email: string | null;
  showForm: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  businessHours: BusinessHours | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
  tiktok: string | null;
}

export interface UpdateContactConfigDto {
  whatsapp?: string | null;
  whatsappMessage?: string | null;
  phone?: string | null;
  email?: string | null;
  showForm?: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  businessHours?: BusinessHours | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
}
