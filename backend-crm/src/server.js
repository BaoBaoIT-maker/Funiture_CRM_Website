import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: "🚀 Server Node.js (3-Tier Architecture) đang chạy mượt mà!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});