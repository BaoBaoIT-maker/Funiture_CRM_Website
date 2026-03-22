import express from 'express';
import { getAllProducts, createProduct, deleteProduct } from '../controllers/productController.js';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js'; // Import bảo vệ

router.get('/', getAllProducts);
router.post('/',verifyToken, createProduct);
router.delete('/:id',verifyToken, deleteProduct);
export default router;