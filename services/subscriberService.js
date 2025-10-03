const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mail-sender', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.error('Error de conexión a MongoDB:', err));

// Esquemas
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: String,
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
  customFields: { type: Map, of: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const openSchema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber', required: true },
  timestamp: { type: Date, default: Date.now }
});

// Modelos
const Subscriber = mongoose.model('Subscriber', subscriberSchema);
const List = mongoose.model('List', listSchema);
const Open = mongoose.model('Open', openSchema);

// Funciones
async function createList(name) {
  const list = new List({ name });
  await list.save();
  return list._id;
}

async function getSubscriberLists() {
  return await List.find().sort({ createdAt: -1 });
}

async function saveSubscriber(subscriberData) {
  // Verificar si ya existe
  const existingSubscriber = await Subscriber.findOne({ 
    email: subscriberData.email,
    listId: subscriberData.listId
  });

  if (existingSubscriber) {
    // Actualizar datos existentes
    existingSubscriber.name = subscriberData.name || existingSubscriber.name;
    existingSubscriber.customFields = subscriberData.customFields || existingSubscriber.customFields;
    existingSubscriber.active = true;
    await existingSubscriber.save();
    return existingSubscriber;
  } else {
    // Crear nuevo suscriptor
    const subscriber = new Subscriber(subscriberData);
    await subscriber.save();
    return subscriber;
  }
}

async function getSubscribers(listId) {
  return await Subscriber.find({ listId, active: true });
}

async function getSubscriberById(subscriberId) {
  return await Subscriber.findById(subscriberId);
}

async function updateSubscriber(subscriberId, data) {
  const subscriber = await Subscriber.findById(subscriberId);
  
  if (!subscriber) {
    throw new Error('Suscriptor no encontrado');
  }
  
  // Actualizar campos
  if (data.email) subscriber.email = data.email;
  if (data.name) subscriber.name = data.name;
  if (data.customFields) subscriber.customFields = data.customFields;
  
  await subscriber.save();
  return subscriber;
}

async function deleteSubscriber(subscriberId) {
  const result = await Subscriber.deleteOne({ _id: subscriberId });
  return result.deletedCount > 0;
}

async function unsubscribe(subscriberId, email) {
  const subscriber = await Subscriber.findById(subscriberId);
  
  if (!subscriber || subscriber.email !== email) {
    throw new Error('Suscriptor no encontrado');
  }
  
  subscriber.active = false;
  await subscriber.save();
  return subscriber;
}

async function trackOpen(campaignId, subscriberId) {
  const open = new Open({ campaignId, subscriberId });
  await open.save();
  return open;
}

async function getStats(campaignId) {
  // Obtener estadísticas de apertura
  const opens = await Open.find({ campaignId });
  
  // Contar aperturas únicas (por suscriptor)
  const uniqueOpens = new Set();
  opens.forEach(open => uniqueOpens.add(open.subscriberId.toString()));
  
  return {
    totalOpens: opens.length,
    uniqueOpens: uniqueOpens.size,
    openDetails: opens
  };
}

module.exports = {
  createList,
  getSubscriberLists,
  saveSubscriber,
  getSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber,
  unsubscribe,
  trackOpen,
  getStats
};