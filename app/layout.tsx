import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AUTOMATE // DISTRIBUTION PROTOCOL",
  description: "INDUSTRIAL GRADE REELS AUTOMATION GATEWAY.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#ffffff',
          colorBackground: '#09090b',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
          colorInputBackground: '#18181b',
          colorInputText: '#ffffff',
          borderRadius: '0px',
        }
      }}
    >
      <html lang="en" className="dark bg-[#09090b]" style={{ colorScheme: 'dark' }}>
        <body className="antialiased bg-background text-foreground selection:bg-white selection:text-black">
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-background">
              <div className="min-h-full flex flex-col border-l border-white/5">
                {children}
              </div>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
