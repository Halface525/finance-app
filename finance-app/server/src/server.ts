import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db';
import categoriesRouter from './routes/categories';
import transactionsRouter from './routes/transactions';
import statsRouter from './routes/stats';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Finance API is running' });
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
