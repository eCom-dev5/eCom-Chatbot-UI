// server/routes/userClicks.test.js
const request = require('supertest');
const api = require('../index');

// Mock the database, if applicable
jest.mock('../db/index');

test('POST /api/user-click returns a 400 status code with invalid data', async () => {
  const res = await request(api).post('/api/user-click').send({});
  expect(res.statusCode).toBe(400);
});

test('POST /api/user-click returns a 200 status code with valid data', async () => {
  const res = await request(api).post('/api/user-click').send({
    user_id: '1',
    clicked_products: ['product1', 'product2'],
  });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('User click data logged successfully.');
});

// Close the server after all tests are done
afterAll(() => {
  api.server.close();
});
