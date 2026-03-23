import express from 'express';
import { getAllCustomers, createCustomer, getCustomerById, updateCustomer, updateCustomerStatus } from '../controllers/customerController.js';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js'; // Import bảo vệ

router.get('/', verifyToken, getAllCustomers);
router.get('/:id', verifyToken, getCustomerById);
router.post('/',verifyToken, createCustomer);
router.put('/:id',verifyToken, updateCustomer);
router.patch('/:id/status',verifyToken, updateCustomerStatus); // API cập nhật trạng thái
export default router;