import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let testTransaction = [
  {
    id: '1',
    title: 'Операция 1',
    amount: 5000,
    type: 'income',
    createdAt: 1793048400000,
  },
  {
    id: '2',
    title: 'Операция 2',
    amount: 2000,
    type: 'income',
    createdAt: 1793048400000,
  },
];

app.get('/api/transaction', (req, res) => {
  res.json(testTransaction);
});

app.post('/api/transaction', (req, res) => {
  const newTransaction = req.body;
  testTransaction.push(newTransaction);

  res.json(newTransaction);
});

app.delete('/api/transaction/:id', (req, res) => {
  const id = req.params.id;

  testTransaction = testTransaction.filter((item) => item.id !== id);
  res.json({ success: true, id });
});

app.listen(3000, () => {
  console.log('сервер успешно запустился и продолжает работать...');
});
