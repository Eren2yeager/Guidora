import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDB from './mongodb.js';
import { formatPhoneNumber } from './smsService.js';
import mongoose from 'mongoose';

// 
// NOTE: NextAuth's default credentials provider always shows a form/page for credentials login
// If you want to use credentials (email/password) but do NOT want the default NextAuth credentials sign-in page to show,
// you must implement your own custom sign-in page (and set `pages: { signIn: '/your-custom-signin' }` below).
// Then, POST to /api/auth/callback/credentials from your own UI, and NextAuth will not show its default popup/page.
// 

export const authOptions = {
 providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
        name: "EmailCredentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          await connectDB();
  
          const user = await User.findOne({ email: credentials?.email });
          if (!user) throw new Error("No user found");
  
          const isValid = await bcrypt.compare(credentials?.password, user.password);
          if (!isValid) throw new Error("Invalid password");
  
          return {
            id: user._id.toString(), // Convert ObjectId to string
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
            image: user.image || user.media?.iconUrl || '',
          };
        },
      }),
    CredentialsProvider({
        name: "PhoneCredentials",
        credentials: {
          phone: { label: "Phone", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          await connectDB();
  
          const formattedPhone = formatPhoneNumber(credentials?.phone);
          const user = await User.findOne({ phone: formattedPhone });
          if (!user) throw new Error("No user found");
  
          const isValid = await bcrypt.compare(credentials?.password, user.password);
          if (!isValid) throw new Error("Invalid password");
  
          return { 
            id: user._id.toString(), // Convert ObjectId to string
            email: user.email, 
            phone: user.phone,
            name: user.name,
            image: user.image || ''
          };
        },
      }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from token to session - this is the source of truth
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role || 'Student';
        session.user.image = token.image;
      }
      
      // Only sync with DB if we have a valid email from token
      if (!token?.email) {
        return session;
      }
      
      try {
        await connectDB();
        
        // Look for user by the email from the token (not from session)
        const existingUser = await User.findOne({ email: token.email }).select('email phone name role image media password');

        if (existingUser) {
          // User exists, update session with DB data
          session.user.id = existingUser._id.toString();
          session.user.name = existingUser.name || token.name || '';
          session.user.role = existingUser.role || 'Student';
          session.user.image = existingUser.image || existingUser.media?.iconUrl || token.image || '';
          session.user.phone = existingUser.phone || '';
        } else {
          // User doesn't exist, create new user for Google OAuth
          const randomPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          const newUserId = new mongoose.Types.ObjectId();

          const newUser = await User.create({
            _id: newUserId,
            email: token.email,
            name: token.name || '',
            role: 'Student',
            image: token.image || '',
            password: hashedPassword,
            location: {
              geo: {
                type: "Point",
                coordinates: [0, 0],
              },
            },
          });
          
          session.user.id = newUser._id.toString();
        }
        
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        // Return session with token data if DB fails
        return session;
      }
    },
  },
};
