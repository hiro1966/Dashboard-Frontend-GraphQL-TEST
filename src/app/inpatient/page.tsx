"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_INPATIENT_DATA } from "@/graphql/queries";
import type { InpatientDataResponse } from "@/types/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Link from "next/link";

export default function InpatientPage() {
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    setLastUpdate(new Date().toLocaleString('ja-JP'));
  }, []);
  const { data, loading, error, refetch } = useQuery<InpatientDataResponse>(GET_INPATIENT_DATA);

  // グラフ用データ整形
  const chartData = data?.inpatientData.labels.map((label, index) => ({
    ward: label,
    patients: data.inpatientData.values[index],
  })) || [];

  // 統計計算
  const totalPatients = data?.inpatientData.values.reduce((sum, val) => sum + val, 0) || 0;
  const averagePatients = totalPatients > 0 ? Math.round(totalPatients / (data?.inpatientData.labels.length || 1)) : 0;
  const maxPatients = data?.inpatientData.values.length > 0 ? Math.max(...data.inpatientData.values) : 0;
  const minPatients = data?.inpatientData.values.length > 0 ? Math.min(...data.inpatientData.values) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
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
              <h1 className="text-2xl font-bold text-white">🛏️ 入院患者数ダッシュボード</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/outpatient"
                className="text-white hover:text-white/80 transition-colors"
              >
                外来患者 →
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
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">総患者数</p>
            <p className="text-3xl font-bold text-blue-600">{totalPatients.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">平均患者数</p>
            <p className="text-3xl font-bold text-green-600">{averagePatients.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人/病棟</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">最大患者数</p>
            <p className="text-3xl font-bold text-orange-600">{maxPatients.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">最小患者数</p>
            <p className="text-3xl font-bold text-purple-600">{minPatients.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">人</p>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {data?.inpatientData.title || "入院患者数（病棟別）"}
            </h2>
            <p className="text-gray-600">各病棟の入院患者数を表示しています</p>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  再読み込み
                </button>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="ward" 
                    stroke="#666"
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis 
                    stroke="#666"
                    style={{ fontSize: '14px' }}
                    label={{ value: '患者数（人）', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value + ' 人', '患者数']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="patients" 
                    fill="#3b82f6" 
                    name="入院患者数"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* データテーブル */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">詳細データ</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    病棟
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    患者数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.ward}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.patients.toLocaleString()} 人
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            最終更新: {lastUpdate || "読み込み中..."}
          </p>
        </div>
      </main>
    </div>
  );
}
