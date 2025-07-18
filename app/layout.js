import './globals.css';

export const metadata = {
  title: 'Chat App',
  description: 'Gerçek zamanlı sohbet uygulaması',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
