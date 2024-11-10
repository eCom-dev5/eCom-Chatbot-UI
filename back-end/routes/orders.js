const express = require('express');
const db = require('../db/index');
const requireLogin = require('./middleware');
const router = express.Router();

// Middleware to validate order ID and user ownership
const checkIdValidity = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const orderUserId = await db.getOrderUserId(orderId);
    console.log('Order User ID:', orderUserId);

    if (!orderUserId) {
      return res.status(404).send(`An order with the ID '${orderId}' does not exist.`);
    } else if (orderUserId !== req.user.id) {
      return res.status(401).send('Invalid credentials. You cannot view another user\'s order.');
    }
    next();
  } catch (err) {
    console.error('Error in checkIdValidity:', err); // Improved error logging
    res.status(500).send('Query failed. Please ensure you provided a valid order ID.');
  }
};

// Route to get all orders summary for the logged-in user
router.get('', requireLogin, async (req, res) => {
  try {
    const userId = req.user.id;
    const ordersSummary = await db.getOrdersSummary(userId);
    console.log('Orders Summary for user:', userId, ordersSummary);

    res.status(200).json(ordersSummary);
  } catch (err) {
    console.error('Error in fetching orders summary:', err); // Improved error logging
    res.status(500).send('Orders retrieval failed.');
  }
});

// Route to get a specific order by ID
router.get('/:id', requireLogin, checkIdValidity, async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderData = await db.getOrderById(orderId);
    console.log('Order Data:', orderData);

    // Check if the orderData object is valid before sending it
    if (!orderData) {
      return res.status(404).send(`Order with ID '${orderId}' not found.`);
    }

    res.status(200).json(orderData);
  } catch (err) {
    console.error('Error in getOrderById:', err); // Improved error logging
    res.status(500).send('Query failed. Please ensure you provided a valid order ID.');
  }
});

// Route to cancel a specific order by ID
router.delete('/:id', requireLogin, checkIdValidity, async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderStatus = await db.getOrderStatus(orderId);
    if (orderStatus === 'cancelled') {
      return res.status(204).send();
    } else if (orderStatus !== 'pending') {
      return res.status(400).send(`Only 'pending' orders can be cancelled; this order's status is '${orderStatus}'.`);
    }
    await db.updateOrderStatus(orderId, 'cancelled');
    res.status(204).send();
  } catch (err) {
    console.error('Error in cancelling order:', err); // Improved error logging
    res.status(500).send('Query failed. Please ensure you provided a valid order ID.');
  }
});

module.exports = router;
