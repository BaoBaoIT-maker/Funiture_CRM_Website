import prisma from '../config/db.js';
import { sendInvoiceEmail } from '../utils/sendEmail.js';

export const fetchAllCustomers = async () => {
    return await prisma.customer.findMany({
        include: { customerProducts: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const createNewCustomer = async (data) => {
    const { fullName, phone, email, address, budget, notes, status, products } = data;
    
    let calculatedTotal = 0;
    if (products && products.length > 0) {
        calculatedTotal = products.reduce((sum, item) => sum + (item.quantity * item.dealPrice), 0);
    }

    return await prisma.customer.create({
        data: {
            fullName, phone, email, address, budget, notes,
            status: status || 'Mới hỏi',
            totalAmount: calculatedTotal,
            customerProducts: {
                create: products ? products.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity,
                    dealPrice: p.dealPrice
                })) : []
            }
        },
        include: { customerProducts: true }
    });
};

export const updateStatusAndProcessOrder = async (id, status) => {
    const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: { status },
        include: { customerProducts: { include: { product: true } } }
    });

    // Nếu thanh toán thành công: Cập nhật lượt bán & Gửi email
    if (status === 'Đã thanh toán') {
        for (const item of updatedCustomer.customerProducts) {
            if (item.productId) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { soldCount: { increment: item.quantity } }
                });
            }
        }
        if (updatedCustomer.email) {
            await sendInvoiceEmail(updatedCustomer);
        }
    }
    return updatedCustomer;
};