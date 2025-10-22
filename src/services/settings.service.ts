import { Model, Schema, model } from 'mongoose';

export interface AppSettings {
  EMAIL_FROM?: string;
  BASE_URL?: string;
  DEFAULT_PROVIDER?: 'aw-ses' | 'sendgrid';
}

const SettingsSchema = new Schema<AppSettings>({
  EMAIL_FROM: String,
  BASE_URL: String,
  DEFAULT_PROVIDER: {
    type: String, enum: ['aw-ses', 'sendgrid'], default: 'aws-ses'
  },
}, { collection: 'settings', timestamps: true });

const SettingsModel: Model<AppSettings> = model<AppSettings>('Settings', SettingsSchema);

export async function getSettings(): Promise<AppSettings> {
  const doc = await SettingsModel.findOne().lean();
  return doc ?? {};
}

export async function saveSettings(input: AppSettings): Promise<AppSettings> {
  const doc = await SettingsModel.findOne();
  if (!doc) {
    const created = await SettingsModel.create(input);
    return created.toObject();
  }
  Object.assign(doc, input);
  await doc.save();
  return doc.toObject();
}