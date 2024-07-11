import { Router, Request, Response } from 'express';
const root = Router();
import { rateLimitAdmin, rateLimitUsers } from '../middlewares/rateLimiters.js';
import { checkAuth } from '../middlewares/auth.js';
import { v4 as uuidv4 } from 'uuid';

root.post('/login', rateLimitUsers, (req: Request, res: Response) => {
  const user = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  };
  
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    req.session.userId = uuidv4();
    res.send({ login: true });
  } else {
    res.status(401).send({ authentication: false });
  }
});

root.post('/logout', rateLimitAdmin, checkAuth, (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid')
    res.send({ message: 'Logged out successfully' });
  });
});

root.get('/auth-status', rateLimitAdmin, checkAuth, (_req: Request, res: Response) => {
  res.send({ authentication: true })
});

export default root;