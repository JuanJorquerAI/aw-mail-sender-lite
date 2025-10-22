import { Schema, model, models, type Document, type Types } from 'mongoose';

export interface IOpen extends Document {
  type: string;
  campaignId: string;
  subscriberId: Types.ObjectId;
  provider: string;
  meta: Schema.Types.Mixed,
  timestamp: Date;
}

const OpenSchema = new Schema<IOpen>({
  type: { type: String, enum: ['delivered', 'open', 'click', 'bounce', 'complaint', 'unsubscribe'], required: true },
  campaignId: { type: String, required: true },
  subscriberId: { type: Schema.Types.ObjectId, ref: 'Subscriber', required: true },
  provider: String,
  meta: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
})

OpenSchema.index({ campaignId: 1, subscriberId: 1 });
OpenSchema.index({ subscriberId: 1, timeStamp: -1 });

export const Open = models.Open || model<IOpen>('Open', OpenSchema);
export default Open;