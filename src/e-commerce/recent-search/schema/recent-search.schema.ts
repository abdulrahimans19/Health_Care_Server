import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { UserProfile } from 'src/user-profile/schema/user-profile.schema';

@Schema()
export class RecentSearch extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: UserProfile.name })
  profile_id: Types.ObjectId;

  @Prop()
  food_search: string[];

  @Prop()
  pharma_search: string[];
}

export const recent_search_schema = SchemaFactory.createForClass(RecentSearch);
