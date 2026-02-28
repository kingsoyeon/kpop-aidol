import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "K-Pop A Idol",
  description: "당신의 기획사를 세워라",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link href="https://cdn.jsdelivr.net/npm/neodunggeunmo@1.53.0/dist/neodunggeunmo.css" rel="stylesheet" />
      </head>
      <body className={`${notoSansKr.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
