import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SignatureResponse, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Get('status')
  status(): { cloudinary: boolean } {
    return { cloudinary: this.uploads.isEnabled() };
  }

  @Post('signature')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  signature(): SignatureResponse {
    return this.uploads.sign();
  }
}
