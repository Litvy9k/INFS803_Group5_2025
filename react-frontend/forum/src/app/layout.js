import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'GameForum - Connect with Gamers Worldwide',
  description: 'Join the community to discuss games, share strategies, and connect with fellow gamers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <NavBar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}