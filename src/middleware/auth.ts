import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Use a consistent secret across the application
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key';

export interface JwtPayload {
  id: string;
  email: string;
  // Add other fields as needed
}

export async function authenticate(
  request: NextRequest
): Promise<{ authenticated: boolean; payload?: JwtPayload }> {
  try {
    // Get token from headers
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;
    
    if (!token) {
      return { authenticated: false };
    }
    
    // Verify token using the consistent JWT_SECRET
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return { authenticated: true, payload };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false };
  }
} 