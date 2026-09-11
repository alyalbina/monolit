import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/ui/theme/ThemeProvider';
export const metadata: Metadata = { title: 'Ask.Monolit' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><a href="#main" className="am-sr">Skip to content</a><ThemeProvider>{children}</ThemeProvider></body></html>;
}
