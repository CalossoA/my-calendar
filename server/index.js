// Reminder automatico: ogni minuto invia notifiche per task imminenti (entro 10 minuti)
setInterval(async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 10 * 60 * 1000); // 10 minuti dopo
  const tasks = await Todo.find({
    done: false,
    date: { $gte: now, $lte: soon }
  });
  if (tasks.length && subscriptions.length) {
    for (const task of tasks) {
      const payload = JSON.stringify({
        title: 'Promemoria: ' + task.title,
        body: `Hai una cosa da fare alle ${new Date(task.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      });
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(sub, payload);
        } catch (err) {
          // Ignora errori di invio
        }
      }
    }
  }
}, 60 * 1000);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mycalendar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Modello base per le cose da fare
const TodoSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  done: Boolean,
  priority: {
    type: String,
    enum: ['normal', 'high', 'low'],
    default: 'normal',
  },
});
const Todo = mongoose.model('Todo', TodoSchema);

// API CRUD base
// Ottieni tutti i todo ordinati per data
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find().sort({ date: 1 });
  res.json(todos);
});

// Ottieni tutti i giorni unici con almeno un task (per vista calendario)
app.get('/api/todo-days', async (req, res) => {
  const days = await Todo.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
    { $sort: { _id: 1 } }
  ]);
  res.json(days.map(d => d._id));
});

app.post('/api/todos', async (req, res) => {
  const todo = new Todo(req.body);
  await todo.save();
  res.json(todo);
});

app.put('/api/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Notifiche push: setup chiavi VAPID
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    'mailto:youremail@example.com',
    publicVapidKey,
    privateVapidKey
  );
}

let subscriptions = [];

// Endpoint per registrare una subscription push
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// Endpoint per inviare una notifica push a tutti
app.post('/api/notify', async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error('Push error:', err);
    }
  }
  res.json({ success: true });
});


// Serve la build React
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  // Se la richiesta non è per le API, restituisci index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
