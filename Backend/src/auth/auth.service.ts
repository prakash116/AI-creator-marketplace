import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload, PublicUser, UserEntity, toPublicUser } from '../common/types';
import { CreatorsService } from '../creators/creators.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly creators: CreatorsService,
    private readonly jwt: JwtService,
  ) {}

  private async issue(user: UserEntity): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, creatorId: user.creatorId };
    const token = await this.jwt.signAsync(payload);
    return { token, user: toPublicUser(user) };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    let user = await this.users.create({ name: dto.name.trim(), email: dto.email, passwordHash, role: dto.role });

    if (dto.role === 'creator') {
      await this.creators.createForUser(user.id, { name: user.name });
      user = (await this.users.findEntityById(user.id)) ?? user;
    }
    return this.issue(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issue(user);
  }

  me(userId: string): Promise<PublicUser> {
    return this.users.findPublicById(userId);
  }
}
