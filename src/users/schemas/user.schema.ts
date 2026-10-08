import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { newId } from '../../common/ids';

@Schema({ collection: 'users', versionKey: false })
export class User {
  @Prop({ type: String, default: newId })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['creator', 'brand'] })
  role: string;

  @Prop()
  creatorId?: string;

  @Prop({ default: () => new Date().toISOString() })
  createdAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
