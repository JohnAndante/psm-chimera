import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserAuthData, UserTokenPayload } from '../types/auth.type';

const JWT_SECRET = process.env.JWT_SECRET || 'psm-chimera-secret-key';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    next();
};

export const generateToken = (user: UserAuthData) => {
    const { id, name, email, role } = user;

    const payload = { id, name, email, role };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const extractPayload = (token: string): UserTokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
    } catch (err) {
        return null;
    }
}
