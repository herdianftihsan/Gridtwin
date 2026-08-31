export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  iconName: 'describe' | 'simulate' | 'decide';
}

export interface WhatIfScenarioExample {
  id: string;
  query: string;
  solarKwp: number;
  batteryKwh: number;
  monthlyBill: string;
  paybackYears: string;
  gridIndependence: string;
  independenceDelta: string;
  tradeoffText: string;
}

export interface ProductPrinciple {
  title: string;
  description: string;
  iconType: 'math' | 'shield' | 'balance' | 'ai';
}