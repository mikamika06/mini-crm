import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ResearchRequestDto {
  @IsString()
  query: string;

  @IsEnum(['client', 'invoice', 'general'])
  @IsOptional()
  type?: 'client' | 'invoice' | 'general';

  @IsOptional()
  limit?: number;
}

export class CommunicationRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  context?: any;

  @IsEnum(['professional', 'friendly', 'formal'])
  @IsOptional()
  tone?: 'professional' | 'friendly' | 'formal';
}

export class DraftRequestDto {
  @IsEnum(['email', 'message', 'response'])
  type: 'email' | 'message' | 'response';

  @IsString()
  content: string;

  @IsEnum(['professional', 'friendly', 'formal'])
  @IsOptional()
  tone?: 'professional' | 'friendly' | 'formal';
}