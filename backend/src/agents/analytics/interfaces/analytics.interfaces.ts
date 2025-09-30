export interface ToneAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface PriorityAssessment {
  priority: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: string[];
  escalationRequired: boolean;
}

export interface ChurnPrediction {
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export interface AnalyticsResult {
  tone: ToneAnalysis;
  priority: PriorityAssessment;
  churn?: ChurnPrediction;
}




export interface AnalyzeToneInput {
  text: string;
}





export interface AssessPriorityInput {
  text: string;
  clientId?: number;
  metadata?: any;
}



export interface ChurnAnalysisInput {
  clientId: number;
}

export interface ComprehensiveAnalysisInput {
  text: string;
  clientId?: number;
  metadata?: any;
}

export interface ClientAnalytics {
  clientId: number;
  email: string;
  name: string;
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueCount: number;
  paymentRatio: number;
  averageInvoiceValue: number;
  daysSinceLastInvoice: number;
}

export interface GlobalAnalytics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  averagePaymentTime: number;
  churnRate: number;
}

export interface TrendAnalytics {
  period: string;
  newClients: number;
  lostClients: number;
  revenue: number;
  paymentRatio: number;
}

export interface PaymentPatterns {
  onTimePayments: number;
  latePayments: number;
  averageDaysLate: number;
  totalInvoices: number;
}

export interface AnalyticsToolResponse<T> {
  result: T;
  description: string;
}

export interface BatchChurnAnalysisResult {
  clientId: number;
  email: string;
  churnPrediction: ChurnPrediction;
}