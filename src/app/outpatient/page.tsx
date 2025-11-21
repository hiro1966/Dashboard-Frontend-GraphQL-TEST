"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_OUTPATIENT_DATA } from "@/graphql/queries";
import type { OutpatientDataResponse } from "@/types/dashboard";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import Link from "next/link";

export default function OutpatientPage() {
  const [department, setDepartment] = useState("全科");
  const [period, setPeriod] = useState("日毎");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-10-31");

  const { data, loading, error, refetch } = useQuery<OutpatientDataResponse>(
    GET_OUTPATIENT_DATA,
    {
      variables: { department, period, startDate, endDate },
    }
  );

  // グラフ用データ整形
  const chartData = data?.outpatientData.labels.map((label, index) => {
    const row: any = { date: label };
    data.outpatientData.datasets.forEach(dataset => {
      row[dataset.label] = dataset.data[index];
    });
    return row;
  }) || [];

  // 統計計算
  const calculateStats = () => {
    if (!data?.outpatientData.datasets.length) return { total: 0, average: 0, max: 0, min: 0 };
    
    const allValues = data.outpatientData.datasets.flatMap(ds => ds.data);
    const total = allValues.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / allValues.length);
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    
    return { total, average, max, min };
  };

  const stats = calculateStats();
  const isStacked = department === "全科(色分)";

  // 色のマッピング
  const colorMap: { [key: string]: string } = {
    "内科": "#ef4444",
    "小児科": "#3b82f6",
    "整形外科": "#f59e0b",
    "全科": "#8b5cf6"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600">
      {/* ヘッダー */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-white hover:text-white/80 transition-colors"
              >
                ← トップ
              </Link>
              <h1 className="text-2xl font-bold text-white">🚪 外来患者数ダッシュボード</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/inpatient"
                className="text-white hover:text-white/80 transition-colors"
              >
                入院患者 →
              </Link>
              <button
                onClick={() => refetch()}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 更新
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* フィルターパネル */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 フィルター設定</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 診療科選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏥 診療科
              </label>
              <div className="flex flex-wrap gap-2">
                {["全科", "全科(色分)", "内科", "小児科", "整形外科"].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDepartment(dept)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      department === dept
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* 期間種別選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 期間種別
              </label>
              <div className="flex flex-wrap gap-2">
                {["年毎", "月毎", "日毎"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      period === p
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 開始日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📆 開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* 終了日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📆 終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">総患者数</p>
            <p className="text-3xl font-bold text-pink-600">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">平均患者数</p>
            <p className="text-3xl font-bold text-green-600">{stats.average.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人/日</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">最大患者数</p>
            <p className="text-3xl font-bold text-orange-600">{stats.max.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">最小患者数</p>
            <p className="text-3xl font-bold text-purple-600">{stats.min.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {data?.outpatientData.title || "外来患者数"}
            </h2>
            <p className="text-gray-600">
              {department === "全科(色分)" ? "診療科別の積み上げグラフ" : `${department}の患者数推移`}
            </p>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">❌ データの取得に失敗しました</p>
                <p className="text-gray-600 text-sm mb-4">{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  再読み込み
                </button>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {isStacked ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                      label={{ value: '患者数（人）', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {data?.outpatientData.datasets.map((dataset) => (
                      <Area
                        key={dataset.label}
                        type="monotone"
                        dataKey={dataset.label}
                        stackId="1"
                        stroke={colorMap[dataset.label] || "#8b5cf6"}
                        fill={colorMap[dataset.label] || "#8b5cf6"}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                      label={{ value: '患者数（人）', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {data?.outpatientData.datasets.map((dataset) => (
                      <Line
                        key={dataset.label}
                        type="monotone"
                        dataKey={dataset.label}
                        stroke={colorMap[dataset.label] || "#ec4899"}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </p>
        </div>
      </main>
    </div>
  );
}
