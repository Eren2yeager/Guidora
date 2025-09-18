import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/contexts/ToastContext";
import AuthProvider from "@/providers/authProvider";
import QuizRedirect from "@/components/onboarding/QuizRedirect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Guidora - One Stop Educational Advisor",
  description: "Guidora - One Stop Educational Advisor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <QuizRedirect>
              {children}
            </QuizRedirect>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
