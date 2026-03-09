import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Academic Library",
  description: `Digital academic library for ${process.env.NEXT_PUBLIC_DEPARTMENT_NAME || "Department"}`,
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '16px 24px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

