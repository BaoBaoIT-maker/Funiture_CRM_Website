import prisma from '../config/db.js';
import { sendInvoiceEmail } from '../utils/sendEmail.js';

const PAID_STATUS = 'Đã thanh toán';

const calculateTotalAmount = (products = []) => {
    return products.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.dealPrice)), 0);
};

const processPaidCustomer = async (customerData) => {
    for (const item of customerData.customerProducts) {
        if (item.productId) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { soldCount: { increment: item.quantity } }
            });
        }
    }

    if (customerData.email) {
        await sendInvoiceEmail(customerData);
    }
};

export const fetchAllCustomers = async () => {
    return await prisma.customer.findMany({
        include: { customerProducts: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const fetchCustomerById = async (id) => {
    const customer = await prisma.customer.findUnique({
        where: { id: Number(id) },
        include: { customerProducts: { include: { product: true } } }
    });

    if (!customer) {
        throw new Error('Không tìm thấy khách hàng');
    }

    return customer;
};

export const createNewCustomer = async (data) => {
    const { fullName, phone, email, address, budget, notes, status, products } = data;

    const normalizedProducts = products || [];
    const calculatedTotal = calculateTotalAmount(normalizedProducts);

    const createdCustomer = await prisma.customer.create({
        data: {
            fullName, phone, email, address, budget, notes,
            status: status || 'Mới hỏi',
            totalAmount: calculatedTotal,
            customerProducts: {
                create: normalizedProducts.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity,
                    dealPrice: p.dealPrice
                }))
            }
        },
        include: { customerProducts: { include: { product: true } } }
    });

    if (createdCustomer.status === PAID_STATUS) {
        await processPaidCustomer(createdCustomer);
    }

    return createdCustomer;
};

export const updateCustomerDetail = async (id, data) => {
    const currentCustomer = await prisma.customer.findUnique({
        where: { id: Number(id) },
        include: { customerProducts: true }
    });

    if (!currentCustomer) {
        throw new Error('Không tìm thấy khách hàng');
    }

    const {
        fullName,
        phone,
        email,
        address,
        budget,
        notes,
        status,
        products,
    } = data;

    const normalizedProducts = products || [];
    const calculatedTotal = calculateTotalAmount(normalizedProducts);

    const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: {
            fullName,
            phone,
            email,
            address,
            budget,
            notes,
            status: status || currentCustomer.status,
            totalAmount: calculatedTotal,
            customerProducts: {
                deleteMany: {},
                create: normalizedProducts.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity,
                    dealPrice: p.dealPrice
                }))
            }
        },
        include: { customerProducts: { include: { product: true } } }
    });

    if (currentCustomer.status !== PAID_STATUS && updatedCustomer.status === PAID_STATUS) {
        await processPaidCustomer(updatedCustomer);
    }

    return updatedCustomer;
};

export const updateStatusAndProcessOrder = async (id, status) => {
    const currentCustomer = await prisma.customer.findUnique({ where: { id: Number(id) } });

    if (!currentCustomer) {
        throw new Error('Không tìm thấy khách hàng');
    }

    const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: { status },
        include: { customerProducts: { include: { product: true } } }
    });

    if (currentCustomer.status !== PAID_STATUS && status === PAID_STATUS) {
        await processPaidCustomer(updatedCustomer);
    }

    return updatedCustomer;
};