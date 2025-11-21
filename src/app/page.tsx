"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_INPATIENT_DATA, GET_OUTPATIENT_DATA } from "@/graphql/queries";
import type { InpatientDataResponse, OutpatientDataResponse } from "@/types/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart, Line } from "recharts";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Hospital, Activity } from "lucide-react";

export default function Home() {
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString('ja-JP'));
  }, []);

  // 入院患者データ取得
  const { data: inpatientData, loading: inpatientLoading, refetch: refetchInpatient } = useQuery<InpatientDataResponse>(
    GET_INPATIENT_DATA
  );

  // 外来患者データ取得（月毎、全科）
  const { data: outpatientData, loading: outpatientLoading, refetch: refetchOutpatient } = useQuery<OutpatientDataResponse>(
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

  const handleRefresh = () => {
    refetchInpatient();
    refetchOutpatient();
    setLastUpdate(new Date().toLocaleTimeString('ja-JP'));
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Hospital className="h-10 w-10 md:h-12 md:w-12" />
            医療ダッシュボード
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            入院・外来患者数の統合ビュー
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* 入院患者カード */}
          <Link href="/inpatient">
            <Card className="hover:scale-105 transition-transform cursor-pointer border-2 hover:border-purple-400 hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🛏️ 入院患者数
                  </span>
                  <span className="text-sm text-purple-600 font-semibold">詳細を見る →</span>
                </CardTitle>
                <CardDescription>病棟別の入院患者数</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </Link>

          {/* 外来患者カード */}
          <Link href="/outpatient">
            <Card className="hover:scale-105 transition-transform cursor-pointer border-2 hover:border-pink-400 hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🚪 外来患者数
                  </span>
                  <span className="text-sm text-purple-600 font-semibold">詳細を見る →</span>
                </CardTitle>
                <CardDescription>月別の外来患者数推移</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </Link>
        </div>

        <footer className="mt-8 md:mt-12 text-center">
          <Card className="inline-block bg-white/95">
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">
                最終更新: <span className="font-semibold">{lastUpdate || "読み込み中..."}</span>
              </p>
              <Button 
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                更新
              </Button>
            </CardContent>
          </Card>
        </footer>
      </div>
    </main>
  );
}
