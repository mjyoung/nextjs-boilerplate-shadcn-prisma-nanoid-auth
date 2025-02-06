import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/utils/styles";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-screen flex-col bg-slate-200 font-sans antialiased",
          inter.variable,
        )}
      >
        <TRPCReactProvider>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col p-6">{children}</div>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
