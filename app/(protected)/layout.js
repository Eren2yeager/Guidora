import SecureLayout from '@/layouts/secureLayout';

export default function ProtectedLayout({ children }) {
  return <SecureLayout>{children}</SecureLayout>;
}