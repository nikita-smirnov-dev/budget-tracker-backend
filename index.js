import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let testTransaction = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Операция 1',
    amount: 5000,
    type: 'income',
    createdAt: 1793048400000,
  },
  {
    id: '2',
    userId: 'user-2',
    title: 'Операция 2',
    amount: 2000,
    type: 'income',
    createdAt: 1793048400000,
  },
  {
    id: '3',
    userId: 'user-2',
    title: 'Операция 3',
    amount: 24000,
    type: 'income',
    createdAt: 1793048900000,
  },
];

let users = [
  {
    id: 'user-1',
    email: 'test11@test.ru',
    password: '$2b$10$yCnxAZM0bGb48rEE3SSTNu5TGiBVZsA3kFWEOgdXD/TMFwr6iGW86',
    name: 'Corey',
    surname: 'Taylor',
  },
  {
    id: 'user-2',
    email: 'test22@test.ru',
    password: '$2b$10$8cnz6lH8fOvInj/PbVcHVOSNceKS9pG.xdmtDs5NzpJAy4keYO7.a',
    name: 'John',
    surname: 'Reavse',
  },
];

const authMiddleware = (req, res, next) => {
  const headerRsponse = req.headers.authorization;

  if (!headerRsponse || !headerRsponse.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const userToken = headerRsponse.split(' ')[1];
  if (!userToken) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный или просроченный токен' });
  }
};

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const userTokenId = req.userId;
  const user = users.find((usr) => usr.id === userTokenId);

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;
    if (!name || !surname || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Заполните все обязательные поля' });
    }

    const foundEmail = users.find((user) => user.email === email);

    if (foundEmail) {
      return res
        .status(400)
        .json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const newUser = {
      id: `user-${Date.now()}`,
      email: email,
      password: hashedPassword,
      name: name,
      surname: surname,
    };
    users.push(newUser);

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '5d',
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Произошла ошибка на сервере при регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Заполните все обязательные поля' });
    }

    const user = users.find((usr) => usr.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '5d',
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Произошла ошибка на сервере при входе' });
  }
});

app.get('/api/transaction', authMiddleware, (req, res) => {
  const userTransactions = testTransaction.filter(
    (item) => item.userId === req.userId,
  );
  res.status(200).json(userTransactions);
});

app.post('/api/transaction', authMiddleware, (req, res) => {
  const newTransaction = req.body;
  const transactionWithUser = { ...newTransaction, userId: req.userId };
  testTransaction.push(transactionWithUser);

  res.status(201).json(transactionWithUser);
});

app.delete('/api/transaction/:id', authMiddleware, (req, res) => {
  const id = req.params.id;

  const testTransactionDelete = testTransaction.find(
    (item) => item.id === id && item.userId === req.userId,
  );

  if (!testTransactionDelete) {
    return res
      .status(404)
      .json({ message: 'Транзакция не найдена или уже удалена' });
  }

  testTransaction = testTransaction.filter((item) => item.id !== id);

  res.json(testTransactionDelete);
});

app.listen(3000, () => {
  console.log('сервер успешно запустился и продолжает работать...');
});
