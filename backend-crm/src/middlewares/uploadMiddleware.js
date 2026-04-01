import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsDir = path.resolve(process.cwd(), 'uploads');

const ensureUploadsDir = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadsDir();
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) {
        cb(null, true);
        return;
    }

    cb(new Error('Chỉ hỗ trợ file ảnh'), false);
};

export const uploadImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
