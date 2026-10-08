import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { newId } from '../../common/ids';

@Schema({ collection: 'skills', versionKey: false })
export class Skill {
  @Prop({ type: String, default: newId })
  _id: string;

  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) category: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
