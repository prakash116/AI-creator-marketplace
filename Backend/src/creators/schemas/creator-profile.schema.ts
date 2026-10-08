import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { newId } from '../../common/ids';

@Schema({ collection: 'creators', versionKey: false })
export class CreatorProfile {
  /** Seeded profiles use the username as id (e.g. 'aarav-mehta'). */
  @Prop({ type: String, default: newId })
  _id: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ default: '' }) avatar: string;
  @Prop({ default: '' }) cover: string;
  @Prop({ default: '' }) headline: string;
  @Prop({ default: '' }) bio: string;
  @Prop({ default: '' }) location: string;

  @Prop({ type: [String], default: [] }) specialization: string[];
  @Prop({ type: [String], default: [] }) focusAreas: string[];
  @Prop({ type: [String], default: [] }) skills: string[];
  @Prop({ type: [String], default: [] }) tools: string[];
  @Prop({ type: [String], default: [] }) contentTypes: string[];

  @Prop({ default: 0 }) experience: number;
  @Prop({ default: 0 }) rating: number;
  @Prop({ default: 0 }) reviews: number;
  @Prop({ default: 0 }) projectsCompleted: number;
  @Prop({ default: 0 }) hourlyRate: number;

  @Prop({ default: 'Available', enum: ['Available', 'Limited', 'Booked'] })
  availability: string;

  @Prop({ default: '< 24 hours' }) responseTime: string;
  @Prop({ default: false }) verified: boolean;

  /** VerificationSignal[] */
  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  verification: Record<string, unknown>[];

  /** WorkflowStep[] */
  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  workflow: Record<string, unknown>[];

  @Prop({ default: false }) featured: boolean;
}

export const CreatorProfileSchema = SchemaFactory.createForClass(CreatorProfile);
