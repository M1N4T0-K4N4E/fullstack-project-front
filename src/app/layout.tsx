import { TooltipProvider } from "@/components/ui/tooltip"
import { Raleway, Space_Grotesk, Outfit, Instrument_Sans, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css"
import { Viewport } from "next";

const instrumentSansHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const viewport: Viewport = {
  themeColor: [
    { color: '#000000', media: '(prefers-color-scheme: dark)' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable, instrumentSansHeading.variable)}>
      <body className="min-w-[320px] overflow-y-scroll antialiased">
        <div className="isolate min-h-dvh bg-background">
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </div>
        <Toaster />
      </body>
    </html>
  )
}