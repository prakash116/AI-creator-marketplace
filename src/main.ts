import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { ensureSrvDns } from './database/dns-fallback';

const isProd = process.env.NODE_ENV === 'production';

/** Refuse to boot in production with insecure or missing configuration. */
function assertProductionEnv(logger: Logger): void {
  if (!isProd) return;
  const problems: string[] = [];
  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < 32 || /change-me/i.test(secret)) problems.push('JWT_SECRET must be a random string of at least 32 characters');
  if (!process.env.MONGODB_URI?.trim()) problems.push('MONGODB_URI is required (in-memory storage is not persistent)');
  if (!process.env.FRONTEND_URL?.trim()) problems.push('FRONTEND_URL is required for CORS');
  if (problems.length) {
    problems.forEach((p) => logger.error(p));
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  await ensureSrvDns();
  const logger = new Logger('Bootstrap');
  assertProductionEnv(logger);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProd ? ['log', 'warn', 'error'] : undefined,
  });

  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(compression());

  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.enableCors({
    // Production: only the configured frontend(s). Development: also any localhost origin.
    origin: (origin, cb) => {
      if (!origin || frontendUrls.includes(origin)) return cb(null, true);
      if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
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
  await app.listen(port, '0.0.0.0');

  const db = app.get(DatabaseService);
  logger.log(`CRE8R API listening on port ${port} at /api (env: ${isProd ? 'production' : 'development'}, storage: ${db.mode})`);
  if (!process.env.JWT_SECRET) logger.warn('JWT_SECRET not set — using insecure development secret');
}

bootstrap();
