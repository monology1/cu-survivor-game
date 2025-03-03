import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
            <h1 className="text-5xl font-bold mb-8">Potato Vampire Survivors</h1>
            <p className="text-xl mb-8">A Vampire Survivors-like game with a potato protagonist!</p>
            <Link
                href="/game"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium text-lg transition-colors"
            >
                Play Now
            </Link>
        </main>
    );
}