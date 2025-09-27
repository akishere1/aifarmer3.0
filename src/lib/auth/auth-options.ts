import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@/lib/database/models';
import connectToDatabase from '@/lib/database/connection';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          
          const user = await User.findOne({ 
            email: credentials.email,
            isActive: true 
          }).lean();

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            farmName: user.profile?.farmName,
            subscription: user.subscription
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.farmName = user.farmName;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.farmName = token.farmName as string;
        session.user.subscription = token.subscription as any;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register'
  },
  secret: process.env.NEXTAUTH_SECRET,
};
