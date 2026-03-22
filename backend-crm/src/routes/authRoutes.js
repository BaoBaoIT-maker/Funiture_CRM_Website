import express from 'express';
import { login, registerAdmin } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; // Import bảo vệ
const router = express.Router();

router.post('/login', login);
router.post('/register',verifyToken, registerAdmin);
export default router;