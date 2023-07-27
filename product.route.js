const express = require('express');
const router = express.Router();
const Product = require('../models/product');



// Create a new product
router.post('/addProduct', async (req, res) => {
  try {
    const { name, price, description, category, quantity } = req.body;
    const product = new Product({ name, price, description, category, quantity });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products
router.get('/listProduct', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single product by ID
router.get('viewProduct/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a product by ID
router.put('updateProduct/:id', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product by ID
router.delete('deleteProduct/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Filter products by name
router.get('/filterProductByName', async (req, res) => {
    try {
      const productName = req.query.name;
      if (!productName) {
        return res.status(400).json({ error: 'Product name parameter is missing' });
      }
  
      const products = await Product.find({ name: { $regex: productName, $options: 'i' } });
      if (products.length === 0) {
        return res.status(404).json({ error: 'No products found with the given name' });
      }
  
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Get products by category
router.get('/productsByCategory/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });

    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found for the specified category' });
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

  

// Buy a product by ID
router.post('/buyProduct/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const quantityToBuy = req.body.quantity;

    if (!quantityToBuy || quantityToBuy <= 0) {
      return res.status(400).json({ error: 'Invalid quantity provided' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (quantityToBuy > product.quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available for purchase' });
    }

    product.quantity -= quantityToBuy;
    await product.save();

    res.json({ message: 'Product purchased successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Rate a product by ID
router.post('/rateProduct/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating provided. Ratings must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product's rating with the new rating and update the total number of ratings
    product.totalRatings += rating;
    product.numRatings += 1;
    product.avgRating = product.totalRatings / product.numRatings;
    await product.save();

    res.json({ message: 'Product rated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get top-rated products in descending order
router.get('/topRatedProducts', async (req, res) => {
  try {

    const topRatedProducts = await Product.find()
      .sort({ avgRating: -1 }) 
      .limit(10);

    if (topRatedProducts.length === 0) {
      return res.status(404).json({ error: 'No top-rated products found' });
    }

    res.json(topRatedProducts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Add a product to the user's wishlist
router.post('/addToWishlist', async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    const userId = req.user.id;

    // Find the user's wishlist based on their user ID
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the product is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: 'Product already in the wishlist' });
    }

    // Add the product to the user's wishlist
    user.wishlist.push(productId);
    await user.save();

    res.json({ message: 'Product added to the wishlist successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
