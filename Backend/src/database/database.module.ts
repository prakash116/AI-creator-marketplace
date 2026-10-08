import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { Brief, BriefSchema } from '../briefs/schemas/brief.schema';
import { CreatorProfile, CreatorProfileSchema } from '../creators/schemas/creator-profile.schema';
import { PortfolioItem, PortfolioItemSchema } from '../portfolios/schemas/portfolio-item.schema';
import { Skill, SkillSchema } from '../skills/schemas/skill.schema';
import { Tool, ToolSchema } from '../tools/schemas/tool.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Verification, VerificationSchema } from '../verification/schemas/verification.schema';
import { DatabaseService } from './database.service';
import { MemoryRepository, MongoRepository } from './repository';
import {
  BRIEF_REPOSITORY,
  CREATOR_REPOSITORY,
  PORTFOLIO_REPOSITORY,
  SKILL_REPOSITORY,
  TOOL_REPOSITORY,
  USER_REPOSITORY,
  VERIFICATION_REPOSITORY,
} from './tokens';

interface CollectionDef {
  token: string;
  name: string;
  schema: Schema;
}

const COLLECTIONS: CollectionDef[] = [
  { token: USER_REPOSITORY, name: User.name, schema: UserSchema },
  { token: CREATOR_REPOSITORY, name: CreatorProfile.name, schema: CreatorProfileSchema },
  { token: PORTFOLIO_REPOSITORY, name: PortfolioItem.name, schema: PortfolioItemSchema },
  { token: BRIEF_REPOSITORY, name: Brief.name, schema: BriefSchema },
  { token: SKILL_REPOSITORY, name: Skill.name, schema: SkillSchema },
  { token: TOOL_REPOSITORY, name: Tool.name, schema: ToolSchema },
  { token: VERIFICATION_REPOSITORY, name: Verification.name, schema: VerificationSchema },
];

const TOKENS = COLLECTIONS.map((c) => c.token);

/**
 * Chooses the storage backend at boot:
 *  - MONGODB_URI set   -> Mongoose connection + MongoRepository per collection
 *  - MONGODB_URI empty -> MemoryRepository per collection (seeded on startup)
 * Must be imported after ConfigModule.forRoot() so .env is already loaded.
 */
@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const uri = (process.env.MONGODB_URI ?? '').trim();
    const logger = new Logger('Database');

    if (uri) {
      logger.log('Storage mode: MongoDB (MONGODB_URI is set)');
      const repoProviders: Provider[] = COLLECTIONS.map((c) => ({
        provide: c.token,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useFactory: (model: Model<any>) => new MongoRepository(model),
        inject: [getModelToken(c.name)],
      }));
      return {
        module: DatabaseModule,
        imports: [
          MongooseModule.forRoot(uri, { serverSelectionTimeoutMS: 10000 }),
          MongooseModule.forFeature(COLLECTIONS.map((c) => ({ name: c.name, schema: c.schema }))),
        ],
        providers: [{ provide: DatabaseService, useValue: new DatabaseService('mongodb') }, ...repoProviders],
        exports: [DatabaseService, ...TOKENS],
      };
    }

    logger.log('Storage mode: in-memory (MONGODB_URI not set) — data resets on restart');
    const repoProviders: Provider[] = COLLECTIONS.map((c) => ({
      provide: c.token,
      useValue: new MemoryRepository(),
    }));
    return {
      module: DatabaseModule,
      providers: [{ provide: DatabaseService, useValue: new DatabaseService('memory') }, ...repoProviders],
      exports: [DatabaseService, ...TOKENS],
    };
  }
}
