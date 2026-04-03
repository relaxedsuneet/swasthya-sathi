const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('AI Medical Fact-Checker API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});