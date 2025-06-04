import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const userRouter = express.Router();

interface CreateUserRequest {
    name: string;
    email: string;
    gstin: string;
    password: string;
    role: 'user' | 'admin';
}

interface ValidationError {
    error: string;
    details: Array<any>;
}

// Create a new user
userRouter.post('/', [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('gstin').isLength({ min: 15, max: 15 }).withMessage('GSTIN must be exactly 15 characters'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
], async (req: express.Request, res: express.Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() } as ValidationError);
        return;
    }

    const { name, email, gstin, password, role }: CreateUserRequest = req.body;

    try {
        // Check if user with this email already exists
        const userByEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (userByEmail) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }

        // Check if user with this GSTIN already exists
        const userByGstin = await prisma.user.findUnique({
            where: { gstin }
        });

        if (userByGstin) {
            res.status(409).json({ error: 'User with this GSTIN already exists' });
            return;
        }

        // Create the user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                gstin,
                passwordHash: password, // Password is already hashed in the frontend
                role: role as 'user' | 'admin'
            }
        });

        // Don't return the password hash
        const { passwordHash, ...userWithoutPassword } = user;
        
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

export default userRouter;