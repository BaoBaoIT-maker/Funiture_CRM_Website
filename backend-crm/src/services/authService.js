import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authenticateUser = async (username, password) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error("Tài khoản không tồn tại!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Sai mật khẩu!");

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
};

export const createAdminUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.user.create({
        data: { username, password: hashedPassword }
    });
};