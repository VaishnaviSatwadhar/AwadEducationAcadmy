import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Awad Educational Academy | Science Coaching in Kaij - Physics, Chemistry, Biology, NEET, JEE',
  description: 'Premier science coaching institute in Kaij, Maharashtra. Expert coaching for Physics, Chemistry, Biology foundation courses. NEET & JEE preparation by Awad Sir. 15+ years experience, 2000+ students trained, 95% success rate.',
  keywords: ['science coaching', 'physics classes', 'chemistry classes', 'biology classes', 'NEET coaching', 'JEE coaching', '11th 12th science', 'Kaij', 'Beed', 'Maharashtra', 'Awad Sir', 'foundation courses'],
  authors: [{ name: 'Awad Educational Academy' }],
  openGraph: {
    type: 'website',
    title: 'Awad Educational Academy | Science Coaching in Kaij',
    description: 'Expert coaching for Physics, Chemistry, Biology. NEET & JEE preparation by Awad Sir. 15+ years experience in Kaij, Maharashtra.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Awad Educational Academy | Science Coaching',
    description: 'Expert science coaching for NEET & JEE in Kaij, Maharashtra.',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a1a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
