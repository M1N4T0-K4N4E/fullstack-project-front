import { TooltipProvider } from "@/components/ui/tooltip"
import { Raleway, Space_Grotesk, Outfit, Instrument_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css"

const instrumentSansHeading = Instrument_Sans({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable, instrumentSansHeading.variable)}>
      <body>
        <TooltipProvider>
            {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}