import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isAdminSession } from '@/lib/rbac';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ isAuthenticated: false, isAdmin: false }, { status: 401 });
  }
  
  const isAdmin = isAdminSession(session);
  
  return NextResponse.json({
    isAuthenticated: true,
    isAdmin,
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image
    }
  });
}