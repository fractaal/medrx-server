require('dotenv').config();
import Express from 'express';
import * as db from './database';

export const app = Express();
app.use(Express.json()); // Allow Express to parse JSON in request bodies

(async () => {
  await import('./firebase');
  await db.initialize();

  // Use authentication middleware
  await import('./auth');

  app.get('/', (req, res) => {
    res.send(`request ${req} - Hello World! - ${JSON.stringify(process.env)}`);
  });

  app.listen(3000);
})();
