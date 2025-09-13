import SecureLayout from '@/layouts/secureLayout';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export default function ProtectedLayout({ children }) {
  return <SecureLayout>
    <Navbar />
    {children}
    <Footer />
  </SecureLayout>;
  
}


