import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  BriefEntity,
  CreatorEntity,
  PortfolioEntity,
  SkillEntity,
  ToolEntity,
  UserEntity,
  VerificationEntity,
} from '../common/types';
import { newId } from '../common/ids';
import { DatabaseService } from '../database/database.service';
import { Repository } from '../database/repository';
import {
  BRIEF_REPOSITORY,
  CREATOR_REPOSITORY,
  PORTFOLIO_REPOSITORY,
  SKILL_REPOSITORY,
  TOOL_REPOSITORY,
  USER_REPOSITORY,
  VERIFICATION_REPOSITORY,
} from '../database/tokens';
import { BRIEFS, CREATORS, DEMO_USERS, PORTFOLIO, SKILLS, TOOLS } from './seed-data';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger('Seed');

  constructor(
    private readonly db: DatabaseService,
    @Inject(USER_REPOSITORY) private readonly users: Repository<UserEntity>,
    @Inject(CREATOR_REPOSITORY) private readonly creators: Repository<CreatorEntity>,
    @Inject(PORTFOLIO_REPOSITORY) private readonly portfolio: Repository<PortfolioEntity>,
    @Inject(BRIEF_REPOSITORY) private readonly briefs: Repository<BriefEntity>,
    @Inject(SKILL_REPOSITORY) private readonly skills: Repository<SkillEntity>,
    @Inject(TOOL_REPOSITORY) private readonly tools: Repository<ToolEntity>,
    @Inject(VERIFICATION_REPOSITORY) private readonly verifications: Repository<VerificationEntity>,
  ) {}

  /** Auto-seed on boot when the creators collection is empty (always true in memory mode). */
  async onModuleInit(): Promise<void> {
    if (process.env.SKIP_AUTO_SEED === '1') return;
    if ((await this.creators.count()) > 0) {
      this.logger.log(`Existing data found (${this.db.mode}); skipping auto-seed`);
      return;
    }
    await this.seed(false);
  }

  /** Inserts all seed data. With reset=true, every collection is cleared first. */
  async seed(reset: boolean): Promise<void> {
    const repos = [
      this.users,
      this.creators,
      this.portfolio,
      this.briefs,
      this.skills,
      this.tools,
      this.verifications,
    ];
    if (reset) await Promise.all(repos.map((r) => r.deleteAll()));

    const now = new Date().toISOString();
    const users: UserEntity[] = await Promise.all(
      DEMO_USERS.map(async (u) => ({
        id: newId(),
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: await bcrypt.hash(u.password, 10),
        role: u.role,
        creatorId: 'creatorId' in u ? u.creatorId : undefined,
        createdAt: now,
      })),
    );
    const ownerByCreator = new Map(users.filter((u) => u.creatorId).map((u) => [u.creatorId, u.id]));

    const creators: CreatorEntity[] = CREATORS.map(({ portfolio: _p, ...c }) => ({
      ...c,
      userId: ownerByCreator.get(c.id) ?? c.userId,
    }));
    const verifications: VerificationEntity[] = CREATORS.map((c) => ({
      id: c.id,
      creatorId: c.id,
      verified: c.verified,
      signals: c.verification,
    }));

    await this.users.insertMany(users.map((u) => (u.creatorId ? u : stripCreatorId(u))));
    await this.creators.insertMany(creators);
    await this.portfolio.insertMany(PORTFOLIO);
    await this.briefs.insertMany(BRIEFS);
    await this.skills.insertMany(SKILLS);
    await this.tools.insertMany(TOOLS);
    await this.verifications.insertMany(verifications);

    this.logger.log(
      `Seeded ${this.db.mode}: ${creators.length} creators, ${PORTFOLIO.length} portfolio items, ` +
        `${BRIEFS.length} briefs, ${SKILLS.length} skills, ${TOOLS.length} tools, ${users.length} demo users`,
    );
  }
}

const stripCreatorId = (u: UserEntity): UserEntity => {
  const { creatorId: _c, ...rest } = u;
  return rest;
};
