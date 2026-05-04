const mockAdminFindUnique = jest.fn();

jest.mock('../config/database', () => ({
  default: {
    adminUser: { findUnique: mockAdminFindUnique },
  },
}));

jest.mock('bcryptjs', () => ({ compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mock.jwt.token'), verify: jest.fn() }));
jest.mock('../utils/logger', () => ({
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import express, { NextFunction, Request, Response } from 'express';
import { login, me } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const app = express();
app.use(express.json());
app.post('/api/auth/login', login);
app.get('/api/auth/me', verifyToken, me as (req: Request, res: Response, next: NextFunction) => void);

const fakeAdmin = {
  id: 'admin-1',
  email: 'admin@kalia.com',
  password: '$2b$10$hashedpassword',
  name: 'Admin',
  createdAt: new Date(),
};

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/login', () => {
    it('returns JWT on valid credentials', async () => {
      mockAdminFindUnique.mockResolvedValue(fakeAdmin);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@kalia.com', password: 'secret' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('mock.jwt.token');
      expect(res.body.admin.email).toBe('admin@kalia.com');
    });

    it('returns 401 on wrong password', async () => {
      mockAdminFindUnique.mockResolvedValue(fakeAdmin);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@kalia.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });

    it('returns 401 on unknown email', async () => {
      mockAdminFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@kalia.com', password: 'pass' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns admin data with valid JWT', async () => {
      (mockJwt.verify as jest.Mock).mockReturnValue({ id: 'admin-1', email: 'admin@kalia.com', name: 'Admin' });
      mockAdminFindUnique.mockResolvedValue({ id: 'admin-1', email: 'admin@kalia.com', name: 'Admin', createdAt: new Date() });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock.jwt.token');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@kalia.com');
    });

    it('returns 401 with invalid JWT', async () => {
      (mockJwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer bad.token');

      expect(res.status).toBe(401);
    });

    it('returns 401 with no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
