import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { existsSync } from 'fs';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for SPA serving
    crossOriginEmbedderPolicy: false,
  }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      process.env.DASHBOARD_URL || 'http://localhost:5173',
      process.env.WEB_URL || 'http://localhost:5174',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // In production, serve the dashboard SPA from public/dashboard
  const dashboardPath = join(__dirname, '..', 'public', 'dashboard');
  if (existsSync(dashboardPath)) {
    app.useStaticAssets(dashboardPath, { prefix: '/' });

    // SPA fallback: any non-API, non-file request serves index.html
    const express = app.getHttpAdapter().getInstance();
    express.get(/^\/(?!api\/).*/, (_req: any, res: any, next: any) => {
      const indexPath = join(dashboardPath, 'index.html');
      if (existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      next();
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API rodando na porta ${port}`);
}

bootstrap();
