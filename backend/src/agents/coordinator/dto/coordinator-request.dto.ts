import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatorContextDto {
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsEnum(['general', 'client', 'invoice', 'analytics'])
  searchType?: 'general' | 'client' | 'invoice' | 'analytics';

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CoordinatorRequestDto {
  @IsString()
  query: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatorContextDto)
  context?: CoordinatorContextDto;
}

export class AnalyticsCoordinationContextDto extends CoordinatorContextDto {
  @IsNumber()
  clientId: number;

  @IsOptional()
  @IsBoolean()
  includeChurnAnalysis?: boolean;

  @IsOptional()
  @IsBoolean()
  includeToneAnalysis?: boolean;

  @IsOptional()
  @IsBoolean()
  includePriorityAssessment?: boolean;
}

export class AnalyticsCoordinationRequestDto {
  @IsString()
  query: string;

  @ValidateNested()
  @Type(() => AnalyticsCoordinationContextDto)
  context: AnalyticsCoordinationContextDto;
}

export class ResearchCoordinationContextDto extends CoordinatorContextDto {
  @IsEnum(['general', 'client', 'invoice', 'analytics'])
  searchType: 'general' | 'client' | 'invoice' | 'analytics';

  @IsNumber()
  limit: number;

  @IsOptional()
  @IsBoolean()
  includeVectorSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  includeDatabaseSearch?: boolean;
}

export class ResearchCoordinationRequestDto {
  @IsString()
  query: string;

  @ValidateNested()
  @Type(() => ResearchCoordinationContextDto)
  context: ResearchCoordinationContextDto;
}

export class CommunicationCoordinationContextDto extends CoordinatorContextDto {
  @IsOptional()
  @IsEnum(['professional', 'friendly', 'urgent', 'casual'])
  tone?: 'professional' | 'friendly' | 'urgent' | 'casual';

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsBoolean()
  includeAnalytics?: boolean;

  @IsOptional()
  @IsBoolean()
  includeResearch?: boolean;
}

export class CommunicationCoordinationRequestDto {
  @IsString()
  query: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CommunicationCoordinationContextDto)
  context?: CommunicationCoordinationContextDto;
}

export class BatchCoordinationRequestDto {
  @ValidateNested({ each: true })
  @Type(() => CoordinatorRequestDto)
  requests: CoordinatorRequestDto[];

  @IsOptional()
  @IsBoolean()
  parallel?: boolean;
}

export class SmartCoordinationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  prioritizeSpeed?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAllAgents?: boolean;

  @IsOptional()
  @IsNumber()
  maxProcessingTime?: number;
}

export class SmartCoordinationRequestDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsObject()
  context?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => SmartCoordinationPreferencesDto)
  preferences?: SmartCoordinationPreferencesDto;
}

export class ToolExecutionRequestDto {
  @IsString()
  tool: string;

  @IsObject()
  input: any;
}