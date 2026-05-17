import type { Metadata } from "next"
import "./globals.css"

import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: "Brilliant Chess - Free Chess Analyzer",
  description: "Analyze your chess games and improve your skills completely free.",
  keywords: ["chess", "chess analysis", "free chess analyzer", "free chess.com analyzer", "analyze chess for free", "analyze chess games", "brilliant move chess", "brilliant chess", "brilliant-chess"],
  authors: [{ name: 'Delo' }],
  applicationName: "Brilliant Chess",

  icons: {
    icon: "favicon.ico"
  },
}

import ConfigContextProvider from "@/context/config"
import ErrorsContextProvider from "@/context/errors"
import Nav from "@/components/nav/nav"
import PageErrors from "@/components/errors/pageErrors"

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`flex navTop:flex-row flex-col items-center justify-start h-screen w-screen overflow-x-hidden ${dmSans.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} ${dmSans.className}`}>
        <ConfigContextProvider>
          <ErrorsContextProvider>
            <PageErrors />
            <Nav />
            {children}
          </ErrorsContextProvider>
        </ConfigContextProvider>
      </body>
    </html>
  )
}
