import { gql } from '@apollo/client';

// 入院患者データ取得
export const GET_INPATIENT_DATA = gql`
  query GetInpatientData {
    inpatientData {
      title
      labels
      values
    }
  }
`;

// 外来患者データ取得
export const GET_OUTPATIENT_DATA = gql`
  query GetOutpatientData(
    $department: String!
    $period: String!
    $startDate: String
    $endDate: String
  ) {
    outpatientData(
      department: $department
      period: $period
      startDate: $startDate
      endDate: $endDate
    ) {
      title
      labels
      datasets {
        label
        data
        borderColor
        backgroundColor
        fill
      }
    }
  }
`;
