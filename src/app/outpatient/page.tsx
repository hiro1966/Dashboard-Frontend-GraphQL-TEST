"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_OUTPATIENT_DATA, GET_DEPARTMENTS } from "@/graphql/queries";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, RefreshCw, Users, TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";

interface Department {
  departmentId: string;
  departmentName: string;
  seq: number;
  isDisplay: boolean;
  color: string | null;
}

interface DepartmentsResponse {
  departments: Department[];
}

export default function OutpatientPage() {
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [department, setDepartment] = useState("全科");
  const [period, setPeriod] = useState("日毎");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-10-31");

  useEffect(() => {
    setLastUpdate(new Date().toLocaleString('ja-JP'));
  }, []);

  // 診療科マスタを取得
  const { data: departmentsData } = useQuery<DepartmentsResponse>(GET_DEPARTMENTS);

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

  // 診療科マスタから色のマッピングを作成
  const colorMap: { [key: string]: string } = {};
  departmentsData?.departments.forEach(dept => {
    if (dept.color) {
      colorMap[dept.departmentName] = dept.color;
    }
  });
  // デフォルト色を追加
  if (!colorMap["全科"]) colorMap["全科"] = "#8b5cf6";

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
                <Users className="h-6 w-6" />
                外来患者数ダッシュボード
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-white hover:bg-white/20">
                <Link href="/inpatient">
                  入院患者
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
        {/* フィルターパネル */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              フィルター設定
            </CardTitle>
            <CardDescription>診療科・期間・日付範囲を選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 診療科選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  🏥 診療科
                </label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="診療科を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全科">全科</SelectItem>
                    <SelectItem value="全科(色分)">全科(色分)</SelectItem>
                    {departmentsData?.departments.map(dept => (
                      <SelectItem key={dept.departmentId} value={dept.departmentName}>
                        {dept.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 期間種別選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  📅 期間種別
                </label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="期間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="年毎">年毎</SelectItem>
                    <SelectItem value="月毎">月毎</SelectItem>
                    <SelectItem value="日毎">日毎</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 開始日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  開始日
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* 終了日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  終了日
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総患者数</CardDescription>
              <CardTitle className="text-3xl text-pink-600">{stats.total.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>平均患者数</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.average.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人/日</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                最大患者数
              </CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.max.toLocaleString()}</CardTitle>
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
              <CardTitle className="text-3xl text-purple-600">{stats.min.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">人</p>
            </CardContent>
          </Card>
        </div>

        {/* グラフエリア */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {data?.outpatientData.title || "外来患者数"}
            </CardTitle>
            <CardDescription>
              {department === "全科(色分)" ? "診療科別の積み上げグラフ" : `${department}の患者数推移`}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Button onClick={handleRefresh}>再読み込み</Button>
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
