import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

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

let users = [
  {
    id: 'user-1',
    email: 'test@test.ru',
    password: '$2b$10$vI8A7vYm6wV48F.N9SSTPO49bFtwWty5tqgDq0rFWh6Q9N7C2FUi2',
    name: 'Corey',
    surname: 'Taylor',
  },
];

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

    const newUser = {
      id: `user-${Date.now()}`,
      email: email,
      password: hashedPassword,
      name: name,
      surname: surname,
    };
    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
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

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Произошла ошибка на сервере при входе' });
  }
});

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

  const testTransactionDelete = testTransaction.find((item) => item.id === id);

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
