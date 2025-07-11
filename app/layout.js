// app/layout.js

import './globals.css'; // Global CSS importu

export const metadata = {
  title: 'Chat App',
  description: 'Socket.io ile chat uygulaması',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
