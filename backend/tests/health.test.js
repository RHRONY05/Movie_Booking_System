import request from 'supertest';
import app from '../src/app.js';

describe('Root & Health Endpoints', () => {
  it('should return 200 OK with UP status on /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body.message).toBe('Server is healthy and running smoothly');
  });

  it('should return 200 OK with ONLINE status on /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ONLINE');
    expect(response.body.service).toBe('CineReserve Core API Service');
  });
});
