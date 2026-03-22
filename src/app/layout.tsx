import { TooltipProvider } from "@/components/ui/tooltip"
import { Raleway, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css"

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={cn("font-sans", spaceGrotesk.variable)}>
            <body>
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster />
            </body>
        </html>
    )
}