import jwt, { Secret, SignOptions, JwtPayload as JsonWebTokenPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IUser } from '@/models/User';

// Use environment variables with fallbacks for development
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key';
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
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    }
  );
};

// Extended JWT payload interface
interface ExtendedJwtPayload extends JsonWebTokenPayload {
  id: string;
  role?: string;
}

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set JWT token in cookie
export const setTokenCookie = async (token: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set({
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
export const getTokenFromCookie = async () => {
  const cookiesStore = await cookies();
  return cookiesStore.get('token')?.value;
};

// Remove JWT token from cookie
export const removeTokenCookie = async () => {
  const cookiesStore = await cookies();
  cookiesStore.delete('token');
};

// Authentication middleware
export async function authMiddleware(req: NextRequest) {
  try {
    // Get token from header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token missing' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    );
  }
}

// For testing/development purposes, this function creates a mock token
export function createMockToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

// Role-based authorization middleware
export const authorizeRoles = (allowedRoles: string[]) => {
  return async (req: NextRequest) => {
    const user = await authMiddleware(req);

    if (user instanceof NextResponse) {
      return user;
    }

    const userPayload = user as ExtendedJwtPayload;
    
    if (!userPayload.role || !allowedRoles.includes(userPayload.role)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this resource' },
        { status: 403 }
      );
    }

    return user;
  };
}; 