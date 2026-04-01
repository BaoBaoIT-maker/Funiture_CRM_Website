import prisma from '../config/db.js';
import { sendInvoiceEmail } from '../utils/sendEmail.js';

const PAID_STATUS = 'Đã thanh toán';
const CUSTOMER_STATUSES = ['Mới hỏi', 'Đang tư vấn', 'Đã báo giá', 'Đã thanh toán', 'Cần bảo hành'];

const normalizeEmail = (email) => {
    if (typeof email !== 'string') return null;
    const trimmed = email.trim().toLowerCase();
    return trimmed || null;
};

const ensureEmailIsUnique = async (email, excludeCustomerId = null) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    const existingCustomer = await prisma.customer.findFirst({
        where: {
            email: normalizedEmail,
            ...(excludeCustomerId ? { id: { not: excludeCustomerId } } : {}),
        },
        select: { id: true },
    });

    if (existingCustomer) {
        throw new Error('Email đã tồn tại');
    }

    return normalizedEmail;
};

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

const normalizeAndValidateProducts = async (products = []) => {
    const normalizedProducts = products.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        dealPrice: Number(item.dealPrice),
    }));

    for (const item of normalizedProducts) {
        if (!Number.isInteger(item.productId) || item.productId <= 0) {
            throw new Error('Sản phẩm không hợp lệ');
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error('Số lượng phải lớn hơn 0');
        }

        if (!Number.isFinite(item.dealPrice) || item.dealPrice < 0) {
            throw new Error('Giá chốt không hợp lệ');
        }
    }

    const productIds = [...new Set(normalizedProducts.map((item) => item.productId))];
    if (productIds.length === 0) {
        return [];
    }

    const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
    });

    const existingIds = new Set(existingProducts.map((product) => product.id));
    const hasMissingProduct = productIds.some((id) => !existingIds.has(id));

    if (hasMissingProduct) {
        throw new Error('Có sản phẩm không tồn tại trong hệ thống');
    }

    return normalizedProducts;
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

    const normalizedProducts = await normalizeAndValidateProducts(products || []);
    const calculatedTotal = calculateTotalAmount(normalizedProducts);
    const validatedStatus = getValidatedStatus(status, 'Mới hỏi');
    const normalizedEmail = await ensureEmailIsUnique(email);

    const createdCustomer = await prisma.customer.create({
        data: {
            fullName, phone, email: normalizedEmail, address, budget, notes,
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

    const normalizedProducts = await normalizeAndValidateProducts(products || []);
    const calculatedTotal = calculateTotalAmount(normalizedProducts);
    const validatedStatus = getValidatedStatus(status, currentCustomer.status);
    const normalizedEmail = await ensureEmailIsUnique(email, Number(id));

    const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: {
            fullName,
            phone,
            email: normalizedEmail,
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

export const removeCustomerById = async (id) => {
    const customerId = Number(id);
    const existingCustomer = await prisma.customer.findUnique({ where: { id: customerId } });

    if (!existingCustomer) {
        throw new Error('Không tìm thấy khách hàng');
    }

    return await prisma.customer.delete({ where: { id: customerId } });
};