// server/routes/userClicks.js
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
const jsonParser = bodyParser.json();

// POST route to handle user product clicks
router.post('/user-click', jsonParser, async (req, res) => {
  const { user_id, clicked_products } = req.body;

  if (!user_id || !Array.isArray(clicked_products)) {
    return res.status(400).send({ error: "Invalid input. User ID and clicked products array are required." });
  }

  try {
    // Log the data to the console for testing
    console.log('Received user click data:', { user_id, clicked_products });

    // Optionally, save this data to the database.
    // await db.saveUserClicks(user_id, clicked_products);

    res.status(200).send({ message: 'User click data logged successfully.' });
  } catch (error) {
    console.error('Error handling user clicks:', error);
    res.status(500).send({ error: 'An error occurred while processing user clicks.' });
  }
});

module.exports = router;
