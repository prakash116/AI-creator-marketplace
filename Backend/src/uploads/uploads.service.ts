import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const UPLOAD_FOLDER = 'cre8r/portfolio';

export type SignatureResponse =
  | { enabled: true; cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }
  | { enabled: false; message: string };

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  private credentials() {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET')?.trim();
    return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
  }

  isEnabled(): boolean {
    return this.credentials() !== null;
  }

  /** Signed params for a direct browser -> Cloudinary upload (the secret never leaves the server). */
  sign(): SignatureResponse {
    const creds = this.credentials();
    if (!creds) return { enabled: false, message: 'Cloudinary not configured' };

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder: UPLOAD_FOLDER }, creds.apiSecret);
    return {
      enabled: true,
      cloudName: creds.cloudName,
      apiKey: creds.apiKey,
      timestamp,
      signature,
      folder: UPLOAD_FOLDER,
    };
  }
}
