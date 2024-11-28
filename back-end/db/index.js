const pg = require('pg');

// Setup
const pool = new pg.Pool();

const query = (text, params, callback) => {
  console.log('Making query...');
  // https://node-postgres.com/features/pooling#single-query
  return pool.query(text, params, callback);
};


// Users
const emailExists = async (email_address) => {
  const res = await query(
    'SELECT email_address FROM users WHERE email_address=$1',
    [email_address]
  );
  return res.rowCount > 0;
};

const getUserByEmail = async (email_address, auth_method) => {
  const baseQuery = 'SELECT id, email_address, hashed_pw, auth_method FROM users';
  const filter = ' WHERE email_address=$1 AND auth_method=$2';
  const res = await query(baseQuery + filter, [email_address, auth_method]);
  return res.rows[0];
};

const addLocalUser = async (email_address, hashed_pw) => {
  const res = await query(
    'INSERT INTO users(email_address, hashed_pw, auth_method) VALUES($1, $2, $3) RETURNING id, email_address',
    [email_address, hashed_pw, 'local']
  );
  return res.rows[0];
};

const addGoogleUser = async (email_address) => {
  const res = await query(
    'INSERT INTO users(email_address, auth_method) VALUES($1, $2) RETURNING id, email_address',
    [email_address, 'google']
  );
  return res.rows[0];
};

const updateUserPassword = async (id, hashed_pw) => {
  await query(
    'UPDATE users SET hashed_pw = $1 WHERE id=$2',
    [hashed_pw, id]
  );
  return;
};


// Products

const getProducts = async (category_id = undefined, search_term = undefined) => {
  const baseQuery = `
    SELECT productmetadata.parent_asin, title, price, features, description,
           average_rating, rating_number, thumb,hi_res
    FROM productmetadata 
    JOIN productimages 
    ON productimages.parent_asin = productmetadata.parent_asin
    WHERE productmetadata.parent_asin IS NOT NULL 
    AND title IS NOT NULL 
    AND price IS NOT NULL 
    AND features IS NOT NULL 
    AND description IS NOT NULL 
    AND average_rating IS NOT NULL 
    AND rating_number IS NOT NULL 
    AND thumb IS NOT NULL
    AND hi_res IS NOT NULL
  `;

  let res;
  
  if (category_id) {
    console.log("Category ID:", category_id);
    res = await query(
      baseQuery + ' AND main_category LIKE $1 LIMIT 100',
      [category_id]
    );

  } else if (search_term) {
    res = await query(
      baseQuery + ' AND LOWER(title) LIKE $1 LIMIT 100',
      ['%' + search_term.toLowerCase() + '%']
    );
  
    
  } else {
    res = await query(baseQuery + ' LIMIT 100');
  }
  
  return res.rows;
};

const getProductById = async (id) => {
  const baseQuery = `
    SELECT productmetadata.parent_asin, title, price, features, description,
           average_rating, rating_number, large_res as thumb 
    FROM productmetadata 
    JOIN productimages 
    ON productimages.parent_asin = productmetadata.parent_asin
    WHERE productmetadata.parent_asin IS NOT NULL 
    AND title IS NOT NULL 
    AND price IS NOT NULL 
    AND features IS NOT NULL 
    AND description IS NOT NULL 
    AND average_rating IS NOT NULL 
    AND rating_number IS NOT NULL 
    AND large_res IS NOT NULL
    AND main_category IS NOT NULL
  `;
  const res = await query(baseQuery + ' AND productmetadata.parent_asin LIKE $1', [id]);
  return res.rows.length > 0 ? res.rows[0] : null;
};

// Categories
const getCategories = async () => {
  res = await query('SELECT distinct(main_category) FROM productcategories');
  console.log(res.rows);

  return res.rows;
};


// Cart
const getCartItems = async (user_id) => {
  const select = 'SELECT product_id, title AS product_name, price AS product_price, quantity AS product_quantity FROM cart_products';
  const join = 'JOIN productmetadata ON cart_products.product_id = productmetadata.parent_asin';
  res = await query(`${select} ${join} WHERE user_id=$1`, [user_id]);
  return res.rows;
};

const cartItemExists = async (user_id, product_id) => {
  res = await query(
    'SELECT user_id, product_id FROM cart_products WHERE user_id=$1 AND product_id=$2',
    [user_id, product_id]
  );
  return res.rowCount > 0;
};

const addCartItem = async (user_id, product_id, product_quantity = 1) => {
  // Insert the new cart item
  const insert = 'INSERT INTO cart_products(user_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *';
  const resInsert = await query(insert, [user_id, product_id, product_quantity]);

  // Get the product details
  const productDetails = await query('SELECT name, price FROM products WHERE id = $1', [product_id]);
  
  if (productDetails.rows.length === 0) {
    throw new Error(`Product with ID '${product_id}' not found.`);
  }
  
  const product_name = productDetails.rows[0].name;
  const product_price = productDetails.rows[0].price;

  return { product_id, product_name, product_price, product_quantity };
};


const deleteCartItem = async (user_id, product_id) => {
  const deleteRes = await query(
    'DELETE FROM cart_products WHERE user_id=$1 AND product_id=$2 RETURNING quantity',
    [user_id, product_id]
  );
  try {
    // TypeError if cart item didn't exist (quantity undefined)
    const quantity = deleteRes.rows[0].quantity;
    await query(
      'UPDATE products SET available_stock_count = (available_stock_count + $1) WHERE id=$2',
      [quantity, product_id]
    );
  } catch(err) {
    console.log(err);
  }
  return;
};


// Addresses
const getAddressById = async (id) => {
  const res = await query('SELECT address, postcode FROM addresses WHERE id=$1', [id]);
  return res.rows[0];
};

const getAddressId = async (address, postcode) => {
  const res = await query(
    'SELECT id FROM addresses WHERE address=$1 AND postcode=$2',
    [address, postcode]
  );
  return res.rows.length === 1 ? res.rows[0].id : undefined;
};

const addAddress = async (address, postcode) => {
  const res = await query(
    'INSERT INTO addresses(address, postcode) VALUES($1, $2) RETURNING id',
    [address, postcode]
  );
  return res.rows[0].id;
};


// // Checkout
const createPendingOrder = async (user_id, address_id) => {
  console.log("Starting createPendingOrder function...");
  console.log("User ID:", user_id);
  console.log("Address ID:", address_id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log("Database transaction started.");

    let total_cost = 0;
    const order_status = 'confirmed';

    // Insert a new order record into the `orders` table
    const orderCreationRes = await client.query(
      'INSERT INTO orders(user_id, address_id, status, total_cost) VALUES($1, $2, $3, $4) RETURNING id, order_placed_time',
      [user_id, address_id, order_status, total_cost]
    );

    // Get the new order's ID and order placed time
    const order_id = orderCreationRes.rows[0].id;
    const order_placed_time = orderCreationRes.rows[0].order_placed_time;
    console.log("Created order with ID:", order_id, "and order placed time:", order_placed_time);

    // Retrieve cart items and iterate over them
    const cartItems = await getCartItems(user_id);
    for await (const item of cartItems) {
      const { product_id: parent_asin, product_quantity, product_price } = item; // Use `parent_asin` as per schema
      console.log("Processing item - Parent ASIN:", parent_asin, "Quantity:", product_quantity, "Price:", product_price);

      // Insert each product in the order_products table using `parent_asin`
      await client.query(
        'INSERT INTO order_products(order_id, parent_asin, product_quantity) VALUES($1, $2, $3)',
        [order_id, parent_asin, product_quantity]
      );

      // Calculate total cost for the order
      total_cost += Number(product_price) * product_quantity;
    }

    // Update the `total_cost` for the order
    await client.query(
      'UPDATE orders SET total_cost=$1 WHERE id=$2',
      [total_cost, order_id]
    );
    console.log("Total cost updated for order:", total_cost);

    // Retrieve address details for confirmation
    const addressRes = await client.query(
      'SELECT address, postcode FROM addresses WHERE id=$1',
      [address_id]
    );
    const { address, postcode } = addressRes.rows[0];
    console.log("Retrieved Address:", address, "Postcode:", postcode);

    // Commit the transaction to save all changes
    await client.query('COMMIT');

    // Return the order details as confirmation
    return {
      order_id,
      user_id: Number(user_id),
      order_status,
      order_placed_time,
      total_cost,
      address,
      postcode,
      order_items: cartItems,
    };

  } catch (err) {
    // Rollback the transaction in case of any error
    await client.query('ROLLBACK');
    console.error("Error in createPendingOrder:", err.stack); // Detailed error logging
    throw new Error('Order creation failed. Please ensure you are providing valid data.');
  } finally {
    client.release();
    console.log("Database client released.");
  }
};



const confirmPaidOrder = async (order_id) => {
  // Confirm an order after successful payment
  // Update order status and time; reduce product stock count; clear cart

  // Update order status and order placed time
  const status = 'processing order';
  await query(
    'UPDATE orders SET order_placed_time=(SELECT LOCALTIMESTAMP), status=$1 WHERE id=$2',
    [status, order_id]
  );  

  const order = await getOrderById(order_id);

  // https://node-postgres.com/features/transactions
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // For each order item, reduce stock count and delete cart item
    for await (const product of order.order_items) {
      const { product_id, product_quantity } = product;

      // Reduce the product's stock count
      await client.query(
        'UPDATE products SET stock_count = (stock_count - $1) WHERE id=$2',
        [product_quantity, product_id]
      );

      // Delete the product from the user's cart
      await client.query(
        'DELETE FROM cart_products WHERE user_id=$1 AND product_id=$2',
        [order.user_id, product_id]
      );
    };

    // Commit updates and return order details
    await client.query('COMMIT');

  } catch(err) {
    await client.query('ROLLBACK');
    throw err;

  } finally {
    client.release();
  }
};


// Orders
const getOrdersSummary = async (user_id) => {
  const select = 'SELECT id AS order_id, order_placed_time, status AS order_status, total_cost';
  res = await query(
    `${select} FROM orders WHERE user_id=$1 ORDER BY order_id DESC`,
    [user_id]
  );
  return res.rows;
};

const getOrderUserId = async (id) => {
  const res = await query('SELECT user_id FROM orders WHERE id=$1', [id]);
  return res.rows[0] ? res.rows[0].user_id : undefined;
};

const getOrderStatus = async (id) => {
  const res = await query('SELECT status FROM orders WHERE id=$1', [id]);
  return res.rows[0] ? res.rows[0].status : undefined;
};

const getOrderById = async (id) => {
  console.log(`Fetching order details for order ID: ${id}`);

  // Select query for the main order details
  const orderSelect = `
    SELECT orders.id, user_id, order_placed_time, status, total_cost, address, postcode
  `;
  const addressesJoin = `
    JOIN addresses ON orders.address_id = addresses.id
  `;
  
  try {
    // Fetch the main order details
    const orderRes = await query(
      `${orderSelect} FROM orders ${addressesJoin} WHERE orders.id=$1`,
      [id]
    );
    console.log('Order main details:', orderRes.rows);
    
    if (orderRes.rows.length === 0) {
      console.error(`No order found with ID: ${id}`);
      throw new Error(`Order not found with ID: ${id}`);
    }
    
    const orderItemsSelect = `
      SELECT op.parent_asin, pm.title AS product_name, pm.price AS product_price, op.product_quantity
    `;
    const productsJoin = `
      FROM order_products op
      JOIN productmetadata pm ON op.parent_asin = pm.parent_asin
    `;
    
    // Fetch the order items
    const orderItemsRes = await query(
      `${orderItemsSelect} ${productsJoin} WHERE op.order_id=$1`,
      [id]
    );
    console.log('Order items:', orderItemsRes.rows);
    console.log('Order items status:', orderRes.rows[0].status);  // Use `status` directly
    // Assemble the final order object to return
    return {
      order_id: orderRes.rows[0].id,
      user_id: orderRes.rows[0].user_id,
      order_items: orderItemsRes.rows,
      order_placed_time: orderRes.rows[0].order_placed_time,
      order_status: orderRes.rows[0].status,  // Use `status` directly
      total_cost: orderRes.rows[0].total_cost,
      address: orderRes.rows[0].address,
      postcode: orderRes.rows[0].postcode
    };

  } catch (error) {
    console.error(`Error in getOrderById: ${error.message}`, error.stack);
    throw new Error('Query failed. Please ensure you provided a valid order ID.');
  }
};



const updateOrderStatus = async (id, status) => {
  await query(
    'UPDATE orders SET status=$1 WHERE id=$2',
    [status, id]
  );
  return;
};


// Exports
module.exports = {
  query,
  emailExists,
  getUserByEmail,
  addLocalUser,
  addGoogleUser,
  updateUserPassword,
  getProducts,
  getProductById,
  getCategories,
  getCartItems,
  cartItemExists,
  addCartItem,
  deleteCartItem,
  getAddressById,
  getAddressId,
  addAddress,
  createPendingOrder,
  confirmPaidOrder,
  getOrdersSummary,
  getOrderUserId,
  getOrderStatus,
  getOrderById,
  updateOrderStatus,
};