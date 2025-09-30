import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import {
  ToneAnalysis,
  PriorityAssessment,
  ChurnPrediction,
  AnalyticsResult,
  BatchChurnAnalysisResult
} from '../interfaces/analytics.interfaces';

export class AnalyzeToneDto {
  @IsString()
  text: string;
}

export class AssessPriorityDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class ChurnAnalysisDto {
  @IsNumber()
  clientId: number;
}

export class ComprehensiveAnalysisDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class BatchChurnAnalysisDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

// Response DTOs використовують інтерфейси
export class ToneAnalysisResponseDto implements ToneAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
  urgency: 'low' | 'medium' | 'high';
}

export class PriorityAssessmentResponseDto implements PriorityAssessment {
  priority: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: string[];
  escalationRequired: boolean;
}

export class ChurnPredictionResponseDto implements ChurnPrediction {
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export class AnalyticsResultResponseDto implements AnalyticsResult {
  tone: ToneAnalysisResponseDto;
  priority: PriorityAssessmentResponseDto;
  churn?: ChurnPredictionResponseDto;
}

export class BatchChurnAnalysisResponseDto implements BatchChurnAnalysisResult {
  clientId: number;
  email: string;
  churnPrediction: ChurnPredictionResponseDto;
}