import { Controller, Get, Param } from '@nestjs/common';
import { VerificationResponse, VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Get(':creatorId')
  forCreator(@Param('creatorId') creatorId: string): Promise<VerificationResponse> {
    return this.verification.forCreator(creatorId);
  }
}
