import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Generate JWT token
export const generateToken = (user: Partial<IUser>) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set JWT token in cookie
export const setTokenCookie = (token: string) => {
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
};

// Get JWT token from cookie
export const getTokenFromCookie = () => {
  return cookies().get('token')?.value;
};

// Remove JWT token from cookie
export const removeTokenCookie = () => {
  cookies().delete('token');
};

// Authentication middleware
export const authMiddleware = async (req: NextRequest) => {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return decoded;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 401 }
    );
  }
};

// Role-based authorization middleware
export const authorizeRoles = (allowedRoles: string[]) => {
  return async (req: NextRequest) => {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this resource' },
        { status: 403 }
      );
    }

    return user;
  };
}; 