require('dotenv').config()
import Express from "express"

import('./firebase');
import('./database');

(async () => {
  const app = Express()

  app.get("/", (req, res) => {
      res.send(`request ${req} - Hello World! - ${JSON.stringify(process.env)}`);
  });

  app.listen(3000)

})();
