import { gql } from '@apollo/client/core';

// 診療科マスタ取得
export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments {
      departmentId
      departmentName
      seq
      isDisplay
      color
    }
  }
`;

// 病棟マスタ取得
export const GET_WARDS = gql`
  query GetWards {
    wards {
      wardId
      wardName
      seq
      isDisplay
      color
    }
  }
`;

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
