const bodyParser = require('body-parser');
const express = require('express');

const db = require('../db/index');
const requireLogin = require('./middleware');

const router = express.Router();

// https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json();


router.post('/create-pending-order', jsonParser, async (req, res) => {
  console.log('Received POST /create-pending-order request');
  try {
    // Check address details were provided
    const { address, postcode } = req.body;
    console.log("Received address:", address, "Received postcode:", postcode);
    
    if (!(address && postcode)) {
      console.log('Address or postcode missing in request body');
      return res.status(400).send('Please provide a valid address and postcode in the request body.');
    }

    // Check if the cart isn't empty
    const userId = req.user?.id || 1; // Temporarily use a test user ID if requireLogin is removed
    console.log('User ID:', userId);

    const cartItems = await db.getCartItems(userId);
    console.log('Retrieved cart items:', cartItems);

    if (!cartItems || cartItems.length < 1) {
      console.log('Cart is empty');
      return res.status(400).send('Your cart is empty.');
    }

    // Retrieve or create address
    let addressId = await db.getAddressId(address, postcode);
    console.log("Retrieved address ID:", addressId);
    
    if (!addressId) {
      addressId = await db.addAddress(address, postcode);
      console.log('Created new address ID:', addressId);
    }

    // Create pending order
    const orderDetails = await db.createPendingOrder(userId, addressId);
    console.log('Order created successfully with details:', orderDetails);
    
    // Return the order ID for confirmation
    res.status(201).json(orderDetails);

  } catch (err) {
    console.error("Error in /create-pending-order:", err.stack); // Log full error stack for debugging
    res.status(500).send('Order creation failed. Please ensure you are providing valid data.');
  }
});

module.exports = router;
