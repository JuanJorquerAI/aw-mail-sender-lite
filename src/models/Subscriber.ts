import { Schema, model, models, type Document, type Types } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  name?: string;
  listId?: Types.ObjectId;
  customFields?: Map<string, string>;
  active: boolean;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, trim: true, lowercase: true },
  name: { type: String, trim: true },
  listId: { type: Schema.Types.ObjectId, ref: 'List' },
  customFields: { type: Map, of: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Evita duplicados por lista
SubscriberSchema.index({ email: 1, listId: 1 }, { unique: true, sparse: true });

export const Subscriber = models.Subscriber || model<ISubscriber>('Subscriber', SubscriberSchema);
export default Subscriber;