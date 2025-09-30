import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { JwtGuard } from '../../../auth/jwt.guard';
import { AnalyticsAgentService } from '../../../agents/analytics/analytics-agent.service';
import { DatabaseAnalyticsService } from '../../../agents/analytics/database-analytics.service';
import {
  ToneAnalysis,
  PriorityAssessment,
  ChurnPrediction,
  AnalyticsResult,
  BatchChurnAnalysisResult
} from '../../../agents/analytics/interfaces/analytics.interfaces';
import {
  AnalyzeToneDto,
  AssessPriorityDto,
  ChurnAnalysisDto,
  ComprehensiveAnalysisDto,
  BatchChurnAnalysisDto,
  ToneAnalysisResponseDto,
  PriorityAssessmentResponseDto,
  ChurnPredictionResponseDto,
  AnalyticsResultResponseDto,
  BatchChurnAnalysisResponseDto
} from '../../../agents/analytics/dto/analytics.dto';

@Controller('api/v1/analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsAgentService,
    private databaseAnalyticsService: DatabaseAnalyticsService
  ) {}

  @Post('tone')
  async analyzeTone(@Body() dto: AnalyzeToneDto): Promise<ToneAnalysis> {
    return await this.analyticsService.analyzeTone(dto.text);
  }

  @Post('priority')
  async assessPriority(@Body() dto: AssessPriorityDto): Promise<PriorityAssessment> {
    return await this.analyticsService.assessPriority(
      dto.text,
      dto.clientId,
      dto.metadata
    );
  }

  @Post('churn')
  async analyzeChurn(@Body() dto: ChurnAnalysisDto): Promise<ChurnPrediction> {
    return await this.analyticsService.calculateChurnProbability(dto.clientId);
  }

  @Post('comprehensive')
  async comprehensiveAnalysis(@Body() dto: ComprehensiveAnalysisDto): Promise<AnalyticsResult> {
    return await this.analyticsService.comprehensiveAnalysis(
      dto.text,
      dto.clientId,
      dto.metadata
    );
  }

  @Get('churn/batch')
  async batchChurnAnalysis(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<BatchChurnAnalysisResult[]> {
    return await this.analyticsService.getBatchChurnAnalysis(limit || 50);
  }

  @Get('client/:id')
  async getClientAnalytics(@Param('id', ParseIntPipe) clientId: number) {
    return await this.databaseAnalyticsService.getClientAnalytics(clientId);
  }

  @Get('global')
  async getGlobalAnalytics() {
    return await this.databaseAnalyticsService.getGlobalAnalytics();
  }

  @Get('trends')
  async getTrendAnalytics(
    @Query('months', new ParseIntPipe({ optional: true })) months?: number
  ) {
    return await this.databaseAnalyticsService.getTrendAnalytics(months || 6);
  }

  @Get('risk/top')
  async getTopClientsAtRisk(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return await this.databaseAnalyticsService.getTopClientsAtRisk(limit || 10);
  }

  @Get('payments/patterns')
  async getPaymentPatterns() {
    return await this.databaseAnalyticsService.getPaymentPatterns();
  }

  // Quick analysis endpoint for dashboard
  @Get('dashboard/summary')
  async getDashboardSummary() {
    const [globalAnalytics, topRiskClients, paymentPatterns] = await Promise.all([
      this.databaseAnalyticsService.getGlobalAnalytics(),
      this.databaseAnalyticsService.getTopClientsAtRisk(5),
      this.databaseAnalyticsService.getPaymentPatterns()
    ]);

    return {
      global: globalAnalytics,
      topRiskClients,
      paymentPatterns
    };
  }

  // Health check for analytics services
  @Get('health')
  async healthCheck() {
    try {
      // Test basic functionality
      const testTone = await this.analyticsService.analyzeTone('Hello world');
      const globalStats = await this.databaseAnalyticsService.getGlobalAnalytics();
      
      return {
        status: 'healthy',
        services: {
          analytics: testTone ? 'operational' : 'degraded',
          database: globalStats ? 'operational' : 'degraded'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}