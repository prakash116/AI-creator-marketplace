import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatorEntity, VerificationEntity } from '../common/types';
import { Repository } from '../database/repository';
import { CREATOR_REPOSITORY, VERIFICATION_REPOSITORY } from '../database/tokens';
import { VerificationSignal } from '../seed/seed-data';

export interface VerificationResponse {
  creatorId: string;
  verified: boolean;
  signals: VerificationSignal[];
}

@Injectable()
export class VerificationService {
  constructor(
    @Inject(VERIFICATION_REPOSITORY) private readonly verifications: Repository<VerificationEntity>,
    @Inject(CREATOR_REPOSITORY) private readonly creators: Repository<CreatorEntity>,
  ) {}

  async forCreator(idOrUsername: string): Promise<VerificationResponse> {
    const creator =
      (await this.creators.findById(idOrUsername)) ??
      (await this.creators.findOne({ username: idOrUsername.toLowerCase() }));
    if (!creator) throw new NotFoundException('Creator not found');

    const record = await this.verifications.findById(creator.id);
    if (record) {
      return { creatorId: creator.id, verified: record.verified, signals: record.signals };
    }
    // Fall back to the signals embedded on the profile.
    return { creatorId: creator.id, verified: creator.verified, signals: creator.verification ?? [] };
  }
}
