"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_INPATIENT_DATA } from "@/graphql/queries";
import type { InpatientDataResponse } from "@/types/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw, Bed, TrendingUp, TrendingDown, Activity } from "lucide-react";

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

  const handleRefresh = () => {
    refetch();
    setLastUpdate(new Date().toLocaleString('ja-JP'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600">
      {/* ヘッダー */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-white hover:bg-white/20">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  トップ
                </Link>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Bed className="h-6 w-6" />
                入院患者数ダッシュボード
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-white hover:bg-white/20">
                <Link href="/outpatient">
                  外来患者
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button onClick={handleRefresh} variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                更新
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総患者数</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{totalPatients.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>平均患者数</CardDescription>
              <CardTitle className="text-3xl text-green-600">{averagePatients.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人/病棟</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                最大患者数
              </CardDescription>
              <CardTitle className="text-3xl text-orange-600">{maxPatients.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                最小患者数
              </CardDescription>
              <CardTitle className="text-3xl text-purple-600">{minPatients.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人</p>
            </CardContent>
          </Card>
        </div>

        {/* グラフエリア */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              {data?.inpatientData.title || "入院患者数（病棟別）"}
            </CardTitle>
            <CardDescription>各病棟の入院患者数を表示しています</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Button onClick={handleRefresh}>再読み込み</Button>
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
          </CardContent>
        </Card>

        {/* データテーブル */}
        <Card>
          <CardHeader>
            <CardTitle>詳細データ</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

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
