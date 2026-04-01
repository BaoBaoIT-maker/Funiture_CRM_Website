import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/image', verifyToken, uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không có file ảnh được tải lên' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    return res.status(201).json({
        success: true,
        data: {
            path: imagePath,
            filename: req.file.filename,
        },
    });
});

export default router;
