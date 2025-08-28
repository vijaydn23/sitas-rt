// D:\sitas-rt\src\app\not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-gray-600">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="px-4 py-2 rounded border">Go home</Link>
      </div>
    </main>
  );
}
