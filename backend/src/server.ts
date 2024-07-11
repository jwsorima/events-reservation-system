/*!
 * reserve-api
 * Copyright (c) [2024] [James William Sorima]
 * Licensed under the Non-Commercial License.
 * See LICENSE file for details.
 */
import express, { Application, ErrorRequestHandler } from 'express';
const app: Application = express();
import { pool } from "./db/index.js"

import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

import events from './routes/events.js';
import reservations from './routes/reservations.js';
import root from './routes/root.js';

const isProduction = process.env.APP_ENV === 'production';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

app.set('trust proxy', 1);
app.use(cors({
  origin: isProduction ? ['https://example.com', 'https://www.example.com'] : ['http://localhost:4173', 'http://localhost:5173'],
  credentials: true
}));

const pgSession = connectPgSimple(session)

app.use(session({
  secret: process.env.SESSION_SECRET_KEY!,
  resave: false, // Prevents saving session if it hasn't been modified, improving performance
  saveUninitialized: true, // Saves uninitialized sessions, useful for login sessions
  rolling: true, // Reset the expiration date on every request
  store: new pgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60,
  }),
  cookie: {
      secure: isProduction, // Ensures the cookie is only sent over HTTPS in production
      httpOnly: true, // Ensures the cookie is only accessible via HTTP(S), not client JavaScript
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax',
      domain: isProduction ? `.example.com` : undefined,
  }
}));

app.use('/events', events);
app.use('/reservations', reservations);
app.use('/', root);

app.use(((err, _req, res, next) => {
  console.error(err.stack);
  if(err instanceof SyntaxError) {
    return res.status(400).send({ error: 'Invalid json' });
  }

  next();
}) as ErrorRequestHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}.`);
});

export default app;