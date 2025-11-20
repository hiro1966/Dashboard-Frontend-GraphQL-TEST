// 入院患者データ型
export interface InpatientData {
  title: string;
  labels: string[];
  values: number[];
}

// 外来患者データセット型
export interface DatasetInfo {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
}

// 外来患者データ型
export interface OutpatientData {
  title: string;
  labels: string[];
  datasets: DatasetInfo[];
}

// GraphQLレスポンス型
export interface InpatientDataResponse {
  inpatientData: InpatientData;
}

export interface OutpatientDataResponse {
  outpatientData: OutpatientData;
}

// 外来患者クエリ変数型
export interface OutpatientVariables {
  department: string;
  period: string;
  startDate?: string | null;
  endDate?: string | null;
}
