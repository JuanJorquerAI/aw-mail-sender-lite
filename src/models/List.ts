import { Schema, model, models, type Document } from 'mongoose';

export interface IList extends Document {
  name: string;
  createdAt: Date;
}

const ListSchema = new Schema<IList>({
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

export const List = models.List || model<IList>('List', ListSchema);
export default List;