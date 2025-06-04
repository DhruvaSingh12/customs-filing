import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import * as z from 'zod';

// Define validation schema
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  gstin: z.string().length(15, { message: "GSTIN must be exactly 15 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the data
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, gstin, password } = validation.data;
    
    // Instead of directly using Prisma here, make a request to your backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        gstin,
        password: await hash(password, 12),
        role: 'user'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Registration failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "User created successfully",
        user: {
          id: data.id,
          name: data.name,
          email: data.email
        }
      }, 
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "Server error during registration" },
      { status: 500 }
    );
  }
}