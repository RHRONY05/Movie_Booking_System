import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('should return 200 OK with UP status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body.message).toBe('Server is healthy and running smoothly');
  });
});
