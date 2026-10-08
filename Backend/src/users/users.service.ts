import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PublicUser, UserEntity, UserRole, toPublicUser } from '../common/types';
import { Repository } from '../database/repository';
import { USER_REPOSITORY } from '../database/tokens';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly users: Repository<UserEntity>) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.findOne({ email: email.trim().toLowerCase() });
  }

  findEntityById(id: string): Promise<UserEntity | null> {
    return this.users.findById(id);
  }

  async findPublicById(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
  }

  create(data: { name: string; email: string; passwordHash: string; role: UserRole; creatorId?: string }): Promise<UserEntity> {
    return this.users.create({
      ...data,
      email: data.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    });
  }

  setCreatorId(userId: string, creatorId: string): Promise<UserEntity | null> {
    return this.users.update(userId, { creatorId });
  }
}
