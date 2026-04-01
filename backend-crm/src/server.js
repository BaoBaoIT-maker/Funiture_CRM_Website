import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/test', (req, res) => {
    res.json({ message: "🚀 Server Node.js (3-Tier Architecture) đang chạy mượt mà!" });
});

app.use((err, req, res, next) => {
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Kích thước dữ liệu quá lớn. Vui lòng chọn ảnh nhỏ hơn.',
        });
    }

    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.',
        });
    }

    if (err?.message === 'Chỉ hỗ trợ file ảnh') {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    return next(err);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});