import "./globals.css";

export const metadata = {
  title: "게시판",
  description: "게시판",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}