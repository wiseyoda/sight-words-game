import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-indigo-800">
            Sight Words Adventure
          </h1>
          <p className="text-xl md:text-2xl text-indigo-600">
            Learn to read with your favorite characters!
          </p>
        </div>

        {/* Play Button */}
        <div className="pt-4">
          <Link
            href="/play"
            className="inline-block px-12 py-6 bg-indigo-500 text-white text-2xl font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Play
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-bold text-gray-800">Build Sentences</h3>
            <p className="text-sm text-gray-600">
              Tap words to create sentences
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="font-bold text-gray-800">Earn Stars</h3>
            <p className="text-sm text-gray-600">
              Complete missions to earn rewards
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-bold text-gray-800">Learn 133 Words</h3>
            <p className="text-sm text-gray-600">
              Master the Dolch sight word list
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 space-y-2">
          <p className="text-sm text-indigo-400">
            For young readers ages 4-6
          </p>
          <Link
            href="/admin"
            className="text-xs text-indigo-300 hover:text-indigo-500 transition"
          >
            Parent Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
