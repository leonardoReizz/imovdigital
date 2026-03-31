import { UserRole } from './enums';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
}
