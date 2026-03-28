/**
 * Van Queue Backend Server
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Database
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/van-queue';
console.log('Connecting to MongoDB:', MONGODB_URI);

const { startAutoCutoffScheduler } = require('./schedulers/autoCutoff');
const { initSystem } = require('./utils/initSystem');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await initSystem();
    startAutoCutoffScheduler();
  })
  .catch(err => {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

// Routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trip');
const bookingRoutes = require('./routes/booking');
const routesRoutes = require('./routes/routes');
const queueRoutes = require('./routes/queue');
const walkinRoutes = require('./routes/walkin');
const driverRoutes = require('./routes/driverRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/walk-in', walkinRoutes);
app.use('/api/driver', driverRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Van Queue Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Van Queue API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/driver/login',
      trips: '/api/trip/*',
      routes: '/api/routes',
      health: '/health'
    }
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-trip', (tripId) => {
    socket.join(`trip-${tripId}`);
    console.log(`Socket ${socket.id} joined trip-${tripId}`);
  });

  socket.on('leave-trip', (tripId) => {
    socket.leave(`trip-${tripId}`);
    console.log(`Socket ${socket.id} left trip-${tripId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Van Queue Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
