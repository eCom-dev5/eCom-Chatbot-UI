const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const router = express.Router();
const jsonParser = bodyParser.json();

// POST route to handle user product clicks
router.post('/user-click', jsonParser, async (req, res) => {
  const { user_id, clicked_product } = req.body;
  console.log("Data arrived in the Express backend payload:", req.body);

  if (!user_id || !clicked_product) {
    return res.status(400).send({ error: "Invalid input. User ID and clicked product are required." });
  }

  try {
    console.log("ASIN being sent to FastAPI:", clicked_product);

    // Forward the clicked_product to the FastAPI backend using a GET request
    const response = await axios.get('http://localhost:80/initialize', {
      params: { asin: clicked_product, user_id: user_id}, // Send ASIN as a query parameter
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Error handling user clicks:", error);
    res.status(500).send({ error: "An error occurred while processing user clicks." });
  }
});

module.exports = router;
