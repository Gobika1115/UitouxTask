const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const productsRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');

// Connect to MongoDB (Update the DB_URL with your MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/gobika', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB.');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(bodyParser.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', customerRoutes);
app.use('/api', productsRoutes);
app.use('/api', cartRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
