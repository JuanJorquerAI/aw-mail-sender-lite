import { Types } from 'mongoose';
import { List } from '../models/List.js';
import { Subscriber } from '../models/Subscriber.js';
import { Open } from '../models/Event.js';

export async function createList(name: string) {
  const doc = await List.create({ name });
  return doc._id;
}

export async function getSubscriberLists() {
  return List.find().sort({ createdAt: -1 });
}

export async function saveSubscriber(input: {
  email: string;
  name?: string;
  listId: Types.ObjectId | string;
  customFields?: Record<string, string>;
}) {
  const listId = new Types.ObjectId(input.listId);
  const existing = await Subscriber.findOne({ email: input.email, listId });
  if (existing) {
    existing.name = input.name ?? existing.name;
    if (input.customFields) existing.customFields = input.customFields as any;
    existing.active = true;
    await existing.save();
    return existing.toObject();
  }
  const created = await Subscriber.create({ ...input, listId });
  return created.toObject();
}

export async function getSubscribers(listId: string) {
  return Subscriber.find({ listId, active: true }).lean();
}

export async function getSubscribersById(id: string) {
  return Subscriber.findById(id).lean();
}

export async function updateSubscriber(id: string, data: Partial<{ email: string; name: string; customFields: Record<string, string> }>) {
  const doc = await Subscriber.findById(id);
  if (!doc) throw new Error('Suscriptor no encontrado');
  if (data.email) doc.email = data.email;
  if (data.name) doc.name = data.name;
  if (data.customFields) doc.customFields = data.customFields as any;
  await doc.save();
  return doc.toObject();
}

export async function deleteSubscriber(id: string) {
  const res = await Subscriber.deleteOne({ _id: id });
  return res.deletedCount > 0;
}

export async function unsubscribe(subscriberId: string, email: string) {
  const doc = await Subscriber.findById(subscriberId);
  if (!doc || doc.email !== email) throw new Error('Suscriptor no encontrado');
  doc.active = false;
  await doc.save();
  return doc.toObject();
}

export async function trackOpen(campaignId: string, subscriberId: string) {
  const open = await Open.create({ campaignId, subscriberId });
  return open.toObject();
}

export async function getStats(campaignId: string) {
  const opens = await Open.find({ campaignId }).lean();
  const unique = new Set(opens.map((o: { subscriberId: any; }) => String(o.subscriberId)));
  return { totalOpens: opens.length, uniqueOpens: unique.size, openDetails: opens };
}