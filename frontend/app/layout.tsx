import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
    title: 'FirstTake',
    description: 'AI pre-production for short-form video',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="xddsx5s">
            <body className="w-full min-h-screen" data-oid="61stvr6">
                {children}
            </body>
        </html>
    );
}
