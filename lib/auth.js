import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDB from './mongodb.js';
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
        name: "Credentials",
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
            id: user._id, 
            email: user.email, 
            name: user.name,
            image: user.image || ''
          };
        },
      }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      try {
        await connectDB();
        if (session?.user?.email) {
          // First, get the existing user data
          const existingUser = await User.findOne({ email: session.user.email });
          
          if (existingUser) {
            // User exists - preserve existing data and only update if new data is provided
            const updateData = {
              email: session.user.email,
            };
            
            // Only update name if it's provided and not empty
            if (session.user.name && session.user.name.trim() !== '') {
              updateData.name = session.user.name;
            }
            
            // Only update image if it's provided and not empty (preserves Google OAuth image)
            if (session.user.image && session.user.image.trim() !== '') {
              updateData.image = session.user.image;
            }
            
            // Update the user with only the new data
            await User.findOneAndUpdate(
              { email: session.user.email },
              { $set: updateData },
              { new: true }
            );
            
            // Return session with existing user data
            session.user = {
              ...session.user,
              name: existingUser.name || session.user.name || '',
              image: existingUser.image || session.user.image || '',
            };
          } else {
            // New user - create with provided data
            await User.create({
              email: session.user.email,
              name: session.user.name || '',
              image: session.user.image || '',
            });
          }
        }
        return session;
      } catch (error) {
        console.error('Error storing session in DB:', error);
        return session;
      }
    },
  },
};

// export default NextAuth(authOptions);
