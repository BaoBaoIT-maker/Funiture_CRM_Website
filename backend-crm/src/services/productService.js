import prisma from '../config/db.js';

export const fetchAllProducts = async () => {
    return await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
};

export const createNewProduct = async (productData) => {
    return await prisma.product.create({ data: productData });
};

export const removeProduct = async (id) => {
    return await prisma.product.delete({ where: { id: Number(id) } });
};