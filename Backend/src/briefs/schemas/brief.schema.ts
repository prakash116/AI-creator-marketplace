import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { newId } from '../../common/ids';

@Schema({ collection: 'briefs', versionKey: false })
export class Brief {
  @Prop({ type: String, default: newId })
  _id: string;

  @Prop() brandId?: string;
  @Prop({ required: true }) brandName: string;
  @Prop() brandLogo?: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;

  @Prop({ required: true, enum: ['Video', 'Image', 'Animation', '3D', 'Motion Graphics'] })
  contentType: string;

  @Prop({ default: '' }) style: string;
  @Prop() mood?: string;
  @Prop() reference?: string;
  @Prop() visualDirection?: string;
  @Prop({ required: true }) aspectRatio: string;
  @Prop({ type: [String], default: [] }) platform: string[];

  @Prop({ required: true, enum: ['Personal', 'Commercial', 'Full commercial rights'] })
  commercialUse: string;

  @Prop({ required: true }) budget: string;
  @Prop() startDate?: string;
  @Prop({ required: true }) deadline: string;
  @Prop({ type: [String], default: [] }) requiredSkills: string[];
  @Prop() invitedCreatorId?: string;
  @Prop({ default: 0 }) applicants: number;
  @Prop({ default: 'open', enum: ['open', 'in_review', 'closed'] }) status: string;
  @Prop({ default: () => new Date().toISOString(), index: true }) createdAt: string;
}

export const BriefSchema = SchemaFactory.createForClass(Brief);
