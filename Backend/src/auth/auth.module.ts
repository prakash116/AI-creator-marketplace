import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { CreatorsModule } from '../creators/creators.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './jwt-auth.guard';

export const DEV_JWT_SECRET = 'cre8r-dev-secret-change-me';

/** Global so JwtService and the guards are usable from every feature module. */
@Global()
@Module({
  imports: [
    UsersModule,
    CreatorsModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET') || DEV_JWT_SECRET,
        signOptions: {
          // ms-style string ("7d") or seconds
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}
