export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-100 to-blue-200">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-800">
          Sight Words Adventure
        </h1>
        <p className="text-xl md:text-2xl text-blue-600">
          Learn to read with your favorite characters!
        </p>

        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg max-w-md">
          <p className="text-gray-700 mb-4">
            Welcome! The game is being built.
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Next.js + TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span>Vercel Postgres (pending setup)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
              <span>Game mechanics (Phase 1)</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-blue-500 mt-8">
          Phase 1: The Engine - Project Setup Complete
        </p>
      </div>
    </main>
  );
}
