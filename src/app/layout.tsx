import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Mewing',
  description: 'Panel de Control',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen w-full">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
