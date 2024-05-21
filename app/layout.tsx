import type { Metadata } from "next";
import { Roboto, Inter, Rubik_Scribble } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--roboto-text", //반드시 앞에 --를 붙여야한다.
});

const rubik = Rubik_Scribble({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
  variable: "--rubik-text",
  //반드시 앞에 --를 붙여야한다.
  //추가 폰트를 하기 위해서는 먼저 classname에 등록해야함
  //tailwind.congif.ts에서 등록해야함.
  //등록하고 classname에서 font-로 불러오면됨
});

export const metadata: Metadata = {
  title: {
    template: "%s | Peaches Market",
    default: "Peaches Market",
  },
  description: "Sell and buy all the things!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} ${rubik.variable} bg-neutral-900 text-white max-w-lg mx-auto`}
      >
        {children}
      </body>
    </html>
  );
}
