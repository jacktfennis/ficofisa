import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Geist } from "next/font/google";
import AntdProvider from "./antd-provider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "Ficofisa",
  description: "Welcome to Ficofisa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geistSans.className}>
      <body>
        <AntdRegistry>
          <AntdProvider fontFamily={geistSans.style.fontFamily}>
            {children}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
