import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

// Prevent unhandled errors from crashing the process
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  const baseDomain = process.env.BASE_DOMAIN || 'imovdigital.com.br';
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests
      const allowed = [
        process.env.DASHBOARD_URL || 'http://localhost:5173',
        process.env.WEB_URL || 'http://localhost:5174',
      ];
      if (
        allowed.includes(origin) ||
        origin.endsWith(`.${baseDomain}`) ||
        origin === `https://${baseDomain}` ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    credentials: true,
  });

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API rodando na porta ${port}`);
}

bootstrap();
