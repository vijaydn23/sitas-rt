// D:\sitas-rt\src\app\layout.tsx
import './globals.css';  // <= must be here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
