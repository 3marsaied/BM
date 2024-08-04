const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  credentials: true,
}));

const mongoURI = process.env.MONGOURI;

mongoose.connect(mongoURI, { 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
.then(() => {
    console.log('MongoDB connected...');
})
.catch(err => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('', require('./routes/user'));
app.use('', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
