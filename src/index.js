// eslint-disable-next-line import/extensions
import 'regenerator-runtime/runtime.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import inventoryRoutes from './routes/inventory';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use((req, res, next) => {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }
    next();
  });
});
app.use(express.static('public'));

app.use('/api/inventory', inventoryRoutes);

// 404 page
app.get('*', (req, res) => {
  res.redirect('/404.html');
});

app.listen(port, () => {
  console.log(`Application is live on port ${port}`);
});
