const express = require('express');
const router = express.Router();
const ShoppingCart = require('../models/cart');

// Create a shopping cart for a user 
router.post('/createCart', async (req, res) => {
    try {
      
      const userId = req.user.id;
  
      // Create a new shopping cart for the user
      const cart = new ShoppingCart({ user: userId, products: [] });
      await cart.save();
  
      res.json({ message: 'Shopping cart created successfully', cartId: cart._id });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Add a product to the user's shopping cart
  router.post('/addToCart/:cartId', async (req, res) => {
    try {
      const cartId = req.params.cartId;
      const { productId, quantity } = req.body;
  
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product or quantity provided' });
      }
  
      const cart = await ShoppingCart.findById(cartId);
      if (!cart) {
        return res.status(404).json({ error: 'Shopping cart not found' });
      }
  
      // Find the product to add to the cart
      const productToAdd = await Product.findById(productId);
      if (!productToAdd) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Add the product to the cart with the specified quantity
      cart.products.push({ product: productId, quantity });
      await cart.save();
  
      res.json({ message: 'Product added to the shopping cart successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  module.exports = router;
  