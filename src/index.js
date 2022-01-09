import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import inventoryRoutes from './routes/inventory';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/inventory', inventoryRoutes);

// 404 page
app.get('*', (req, res) => {
  res.redirect('/404.html');
});

app.listen(port, () => {
  console.log(`Application is live on port ${port}`);
});
