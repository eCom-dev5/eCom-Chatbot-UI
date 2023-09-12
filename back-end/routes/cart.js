const express = require('express');

const db = require('../db/index');
const requireLogin = require('./middleware');

const router = express.Router();

router.post('/:id', requireLogin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const product = await db.getProductById(productId);
    if (!product) {
      return res.status(404).send(`A product with the ID '${productId}' does not exist.`);
    }

    const requestedQuantity = req.query.quantity ? Number(req.query.quantity) : 1;
    const availableQuantity = product.available_stock_count;
    if (requestedQuantity > availableQuantity) {
      return res.status(400).send(`The available stock count is ${availableQuantity}.`);
    }

    const userId = req.user.id;
    const itemExists = await db.cartItemExists(userId, productId);
    if (itemExists) {
      return res.status(400).send('This product is already in your cart.');
    }

    const cartItem = await db.addCartItem(userId, productId, requestedQuantity);
    res.status(201).json(cartItem);

  } catch(err) {
    res.status(500).send(
      'Cart update failed. Please ensure you are providing valid data.'
    );
  }
});


module.exports = router;