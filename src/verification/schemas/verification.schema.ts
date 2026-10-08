import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

/** One document per creator; `_id` equals `creatorId`. */
@Schema({ collection: 'verifications', versionKey: false })
export class Verification {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, unique: true }) creatorId: string;
  @Prop({ default: false }) verified: boolean;

  /** VerificationSignal[] */
  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  signals: Record<string, unknown>[];
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
