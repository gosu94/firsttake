import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from './components/NavBar';
export const metadata: Metadata = {
    title: 'FirstTake',
    description: 'AI pre-production for short-form video',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="xddsx5s">
            <body className="w-full min-h-screen text-white" data-oid="61stvr6">
                <div className="min-h-screen">
                    <NavBar />
                    <main className="px-6 pb-16">{children}</main>
                </div>
            </body>
        </html>
    );
}
