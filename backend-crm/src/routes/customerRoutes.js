import express from 'express';
import { getAllCustomers, createCustomer, updateCustomerStatus } from '../controllers/customerController.js';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js'; // Import bảo vệ

router.get('/', getAllCustomers);
router.post('/',verifyToken, createCustomer);
router.patch('/:id/status',verifyToken, updateCustomerStatus); // API cập nhật trạng thái
export default router;