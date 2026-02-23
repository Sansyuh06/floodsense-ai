import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FloodSense AI - NDRF Command Station",
  description: "AI-enabled Real-Time Flash Flood Forecasting Platform",
};

const suppressScript = `
(function() {
  var oe = console.error;
  var ow = console.warn;
  function shouldHide(args) {
    var msg = '';
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === 'string') msg += args[i];
    }
    return msg.indexOf('hydrat') > -1 || msg.indexOf('Hydrat') > -1 || msg.indexOf('HYDRAT') > -1 || msg.indexOf('bis_skin') > -1 || msg.indexOf('bis_register') > -1 || msg.indexOf('didn\\'t match') > -1;
  }
  console.error = function() { if (!shouldHide(arguments)) oe.apply(console, arguments); };
  console.warn = function() { if (!shouldHide(arguments)) ow.apply(console, arguments); };
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: suppressScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
