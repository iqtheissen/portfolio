import { Anaheim } from "next/font/google";
import { Anybody } from "next/font/google";
import "./globals.css";
import I18nextClientProvider from "./providers/I18nextProvider";


const anaheim = Anaheim({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const anybody = Anybody({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata= {
  title: "Quint Theissen | Creative Developer",
  description: "Welcome to my portfolio website",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={anybody.className}>
        <I18nextClientProvider>
          {children}
        </I18nextClientProvider>
      </body>
    </html>
  );
}
