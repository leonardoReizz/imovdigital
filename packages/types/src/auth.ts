import { UserRole } from './enums';

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: UserRole;
}
