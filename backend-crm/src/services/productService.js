import prisma from '../config/db.js';

const normalizeImageUrl = (value) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:image/') || trimmed.startsWith('/uploads/')) {
        return trimmed;
    }

    return null;
};

const normalizeProductData = (productData = {}) => {
    const normalized = { ...productData };

    if (Object.prototype.hasOwnProperty.call(normalized, 'imageUrl')) {
        normalized.imageUrl = normalizeImageUrl(normalized.imageUrl);
    }

    return normalized;
};

export const fetchAllProducts = async () => {
    return await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
};

export const createNewProduct = async (productData) => {
    return await prisma.product.create({ data: normalizeProductData(productData) });
};

export const updateProductById = async (id, productData) => {
    return await prisma.product.update({
        where: { id: Number(id) },
        data: normalizeProductData(productData),
    });
};

export const removeProduct = async (id) => {
    return await prisma.product.delete({ where: { id: Number(id) } });
};