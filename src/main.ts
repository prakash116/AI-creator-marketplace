import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { ensureSrvDns } from './database/dns-fallback';

async function bootstrap(): Promise<void> {
  await ensureSrvDns();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  app.enableCors({
    // Allow the configured frontend(s); also reflect any localhost origin for local dev.
    origin: (origin, cb) => {
      if (!origin || frontendUrls.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.enableShutdownHooks();

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);

  const db = app.get(DatabaseService);
  logger.log(`CRE8R API listening on http://localhost:${port}/api (storage: ${db.mode})`);
  if (!process.env.JWT_SECRET) logger.warn('JWT_SECRET not set — using insecure development secret');
}

bootstrap();
