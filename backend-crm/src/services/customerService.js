import prisma from '../config/db.js';
import { sendInvoiceEmail } from '../utils/sendEmail.js';

const PAID_STATUS = 'Đã thanh toán';
const CUSTOMER_STATUSES = ['Mới hỏi', 'Đang tư vấn', 'Đã báo giá', 'Đã thanh toán', 'Cần bảo hành'];

const calculateTotalAmount = (products = []) => {
    return products.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.dealPrice)), 0);
};

const getValidatedStatus = (status, fallbackStatus) => {
    const finalStatus = status || fallbackStatus;

    if (!CUSTOMER_STATUSES.includes(finalStatus)) {
        throw new Error('Trạng thái khách hàng không hợp lệ');
    }

    return finalStatus;
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
    const validatedStatus = getValidatedStatus(status, 'Mới hỏi');

    const createdCustomer = await prisma.customer.create({
        data: {
            fullName, phone, email, address, budget, notes,
            status: validatedStatus,
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
    const validatedStatus = getValidatedStatus(status, currentCustomer.status);

    const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: {
            fullName,
            phone,
            email,
            address,
            budget,
            notes,
            status: validatedStatus,
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

    const validatedStatus = getValidatedStatus(status, currentCustomer.status);

    const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: { status: validatedStatus },
        include: { customerProducts: { include: { product: true } } }
    });

    if (currentCustomer.status !== PAID_STATUS && validatedStatus === PAID_STATUS) {
        await processPaidCustomer(updatedCustomer);
    }

    return updatedCustomer;
};