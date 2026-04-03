import { Controller, Post, Patch, Delete, Body, Get, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 per minute
  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      agencyName: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } }) // 10 per minute
  @Post('login')
  async login(@Body() body: { email: string; password: string; tenantId?: string }) {
    return this.authService.login(body.email, body.password, body.tenantId);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-tenant')
  async switchTenant(
    @CurrentUser('email') email: string,
    @Body() body: { tenantId: string },
  ) {
    return this.authService.switchTenant(email, body.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tenants')
  async listTenants(@CurrentUser('email') email: string) {
    return this.authService.listTenants(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-tenant')
  async createTenant(
    @CurrentUser('sub') userId: string,
    @Body() body: { agencyName: string },
  ) {
    return this.authService.createTenant(userId, body.agencyName);
  }

  @Throttle({ short: { ttl: 60000, limit: 3 } }) // 3 per minute
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 per minute
  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; password: string },
  ) {
    return this.authService.resetPassword(body.email, body.code, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { name?: string; phone?: string },
  ) {
    return this.authService.updateProfile(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.sub, body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(
    @CurrentUser() user: any,
    @Body() body: { password: string },
  ) {
    return this.authService.softDeleteAccount(user.sub, body.password);
  }
}
