"use client";

import { useQuery } from "@apollo/client/react";
import { GET_INPATIENT_DATA, GET_OUTPATIENT_DATA } from "@/graphql/queries";
import type { InpatientDataResponse, OutpatientDataResponse } from "@/types/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart, Line } from "recharts";

export default function Home() {
  // 入院患者データ取得
  const { data: inpatientData, loading: inpatientLoading } = useQuery<InpatientDataResponse>(
    GET_INPATIENT_DATA
  );

  // 外来患者データ取得（月毎、全科）
  const { data: outpatientData, loading: outpatientLoading } = useQuery<OutpatientDataResponse>(
    GET_OUTPATIENT_DATA,
    {
      variables: {
        department: "全科",
        period: "月毎",
        startDate: "2025-01-01",
        endDate: "2025-10-31",
      },
    }
  );

  // 入院患者グラフ用データ整形
  const inpatientChartData = inpatientData?.inpatientData.labels.map((label, index) => ({
    name: label,
    patients: inpatientData.inpatientData.values[index],
  })) || [];

  // 外来患者グラフ用データ整形
  const outpatientChartData = outpatientData?.outpatientData.labels.map((label, index) => ({
    name: label,
    patients: outpatientData.outpatientData.datasets[0]?.data[index] || 0,
  })) || [];

  // 統計計算
  const inpatientTotal = inpatientData?.inpatientData.values.reduce((sum, val) => sum + val, 0) || 0;
  const inpatientWards = inpatientData?.inpatientData.labels.length || 0;
  
  const outpatientLatest = outpatientData?.outpatientData.datasets[0]?.data.slice(-1)[0] || 0;

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
            
            {inpatientLoading ? (
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inpatientChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">総患者数</p>
                <p className="text-3xl font-bold text-purple-600">
                  {inpatientTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">病棟数</p>
                <p className="text-3xl font-bold text-purple-600">{inpatientWards}</p>
              </div>
            </div>
          </div>

          {/* 外来患者カード */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🚪 外来患者数</h2>
              <span className="text-sm text-purple-600 font-semibold">詳細を見る →</span>
            </div>
            
            {outpatientLoading ? (
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={outpatientChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="patients" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">今月の患者数</p>
                <p className="text-3xl font-bold text-purple-600">
                  {outpatientLatest.toLocaleString()}
                </p>
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
              最終更新: <span className="font-semibold">{new Date().toLocaleTimeString('ja-JP')}</span>
            </p>
            <button 
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              🔄 更新
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
