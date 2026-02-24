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
  title: "Floody - NDRF Command Station",
  description: "AI-enabled Real-Time Flash Flood Forecasting Platform",
};

const suppressScript = `
(function() {
  var oe = console.error;
  var ow = console.warn;
  function shouldHide(args) {
    var msg = '';
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (typeof a === 'string') msg += a;
      else if (a && typeof a === 'object') {
        try { msg += JSON.stringify(a); } catch(e) {}
      }
    }
    var l = msg.toLowerCase();
    return l.indexOf('hydrat') > -1 || l.indexOf('bis_skin') > -1 || l.indexOf('bis_register') > -1 || l.indexOf("didn't match") > -1 || l.indexOf('did not match') > -1 || l.indexOf('server rendered html') > -1 || l.indexOf('tree hydrated') > -1;
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a237e" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
