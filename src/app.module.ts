import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BriefsModule } from './briefs/briefs.module';
import { CreatorsModule } from './creators/creators.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { SeedModule } from './seed/seed.module';
import { SkillsModule } from './skills/skills.module';
import { ToolsModule } from './tools/tools.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { VerificationModule } from './verification/verification.module';

// ConfigModule.forRoot() loads .env synchronously, so it must be evaluated
// before DatabaseModule.forRoot() reads MONGODB_URI.
const configModule = ConfigModule.forRoot({ isGlobal: true });

@Module({
  imports: [
    configModule,
    DatabaseModule.forRoot(),
    SeedModule,
    AuthModule,
    UsersModule,
    CreatorsModule,
    PortfoliosModule,
    BriefsModule,
    SkillsModule,
    ToolsModule,
    VerificationModule,
    UploadsModule,
    HealthModule,
  ],
})
export class AppModule {}
