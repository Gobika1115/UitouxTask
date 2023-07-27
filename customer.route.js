const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');

const router = express.Router();

// Middleware to verify the token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied.' });
  }

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Email validation
const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Get all customers
router.get('/listCustomers', authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// Get a customer by ID
router.get('/viewCustomer/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the customer.' });
  }
});

// Create a new customer
router.post('/addCustomer', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, address, phone, state, country, zipCode } = req.body;
    if (!isEmailValid(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }
    const customer = new Customer({ firstName, lastName, email, address, phone, state, country, zipCode });
    await customer.save();
    res.json({ message: 'Customer created successfully', customer});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create the customer.' });
  }
});

// Update a customer
router.put('/updateCustomer/:id', authenticateToken, async (req, res) => {
  try {
    const {firstName, lastName, email, address, phone, state, country, zipCode } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { firstName, lastName, email, address, phone, state, country, zipCode }, { new: true });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ message: 'Customer updated successfully', customer});
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the customer.' });
  }
});

// Delete a customer
router.delete('/deleteCustomer/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the customer.' });
  }
});

module.exports = router;
