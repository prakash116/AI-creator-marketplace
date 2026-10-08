/**
 * `npm run seed` — resets and re-seeds MongoDB from seed-data.ts.
 * In-memory mode needs no seeding (it seeds itself on every start).
 */
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from '../database/database.service';
import { ensureSrvDns } from '../database/dns-fallback';
import { SeedService } from './seed.service';

async function run(): Promise<void> {
  process.env.SKIP_AUTO_SEED = '1';
  await ensureSrvDns();
  const logger = new Logger('SeedScript');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
  try {
    const db = app.get(DatabaseService);
    if (!db.isMongo) {
      logger.warn('MONGODB_URI is not set — in-memory mode seeds automatically on startup. Nothing to do.');
      return;
    }
    await app.get(SeedService).seed(true);
    logger.log('MongoDB reset and seeded successfully');
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
