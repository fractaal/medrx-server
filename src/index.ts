require('dotenv').config();
import Express from 'express';
import cors from 'cors';
import * as db from './database';
import seeder from './seeder';

export const app = Express();
app.use(Express.json()); // Allow Express to parse JSON in request bodies
app.use(cors());

(async () => {
  await import('./firebase');
  await db.initialize();

  // Use authentication middleware
  await import('./auth');

  // Routes
  import('./routes/storefront');
  import('./routes/search');
  import('./routes/product');
  import('./routes/prescription');

  app.listen(process.env.PORT ?? 80);

  // Seeder!!!
  if (process.env.SEED) {
    await seeder();
  }
})();
