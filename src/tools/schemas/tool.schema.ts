import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { newId } from '../../common/ids';

@Schema({ collection: 'tools', versionKey: false })
export class Tool {
  @Prop({ type: String, default: newId })
  _id: string;

  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) category: string;
  @Prop({ default: '' }) description: string;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
