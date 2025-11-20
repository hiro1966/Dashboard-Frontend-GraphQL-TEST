export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏥 医療ダッシュボード
          </h1>
          <p className="text-xl text-white/90">
            入院・外来患者数の統合ビュー
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 入院患者カード */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🛏️ 入院患者数</h2>
              <span className="text-sm text-purple-600 font-semibold">詳細を見る →</span>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">グラフエリア</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">総患者数</p>
                <p className="text-3xl font-bold text-purple-600">-</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">病棟数</p>
                <p className="text-3xl font-bold text-purple-600">-</p>
              </div>
            </div>
          </div>

          {/* 外来患者カード */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🚪 外来患者数</h2>
              <span className="text-sm text-purple-600 font-semibold">詳細を見る →</span>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">グラフエリア</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">今月の患者数</p>
                <p className="text-3xl font-bold text-purple-600">-</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">診療科数</p>
                <p className="text-3xl font-bold text-purple-600">3</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <div className="bg-white/90 rounded-lg p-6 inline-block">
            <p className="text-gray-700">
              最終更新: <span className="font-semibold">-</span>
            </p>
            <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              🔄 更新
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
