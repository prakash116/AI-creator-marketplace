import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { newId } from '../../common/ids';

@Schema({ collection: 'portfolio_items', versionKey: false })
export class PortfolioItem {
  @Prop({ type: String, default: newId })
  _id: string;

  @Prop({ required: true, index: true }) creatorId: string;
  @Prop({ required: true }) title: string;
  @Prop({ default: '' }) description: string;
  @Prop({ default: '' }) thumbnail: string;
  @Prop({ default: '' }) mediaUrl: string;

  @Prop({ required: true, enum: ['Video', 'Image', 'Animation', '3D', 'Motion Graphics'] })
  contentType: string;

  @Prop({ type: [String], default: [] }) tools: string[];
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ default: 0 }) views: number;
  @Prop({ default: 0 }) likes: number;
  @Prop({ default: () => new Date().toISOString() }) createdAt: string;
}

export const PortfolioItemSchema = SchemaFactory.createForClass(PortfolioItem);
