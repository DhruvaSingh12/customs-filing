import express from 'express';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const authRouter = express.Router();

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
}

authRouter.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().withMessage('Password is required'),
], async (req: express.Request, res: express.Response): Promise<void> => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
    }

    const { email, password } = req.body as LoginRequest;

    try {
        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.passwordHash) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Check password
        const passwordValid = await compare(password, user.passwordHash);
        if (!passwordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Don't return the password hash
        const { passwordHash, ...userWithoutPassword } = user;
        
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        } as LoginResponse);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

export default authRouter;