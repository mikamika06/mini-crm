import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  HttpException,
  UseGuards,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { CoordinatorAgentService } from './coordinator-agent.service';
import { CoordinatorToolsService } from './coordinator-tools.service';
import { JwtGuard } from '../../auth/jwt.guard';
import {
  CoordinatorRequestDto,
  AnalyticsCoordinationRequestDto,
  ResearchCoordinationRequestDto,
  CommunicationCoordinationRequestDto,
  BatchCoordinationRequestDto,
  SmartCoordinationRequestDto,
  ToolExecutionRequestDto
} from './dto/coordinator-request.dto';
import {
  CoordinatorResponse,
  CoordinatorRequest
} from './interfaces/coordinator.interfaces';

@Controller('api/v1/coordinator')
@UseGuards(JwtGuard)
export class CoordinatorController {
  constructor(
    private coordinatorService: CoordinatorAgentService,
    private coordinatorTools: CoordinatorToolsService,
  ) {}

  /**
   * Main coordination endpoint - orchestrates all agents
   */
  @Post('coordinate')
  async coordinate(@Body(ValidationPipe) request: CoordinatorRequestDto): Promise<CoordinatorResponse> {
    try {
      if (!request.query || request.query.trim().length === 0) {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }

      return await this.coordinatorService.coordinate(request);
    } catch (error) {
      console.error('Coordination error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to coordinate agents',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Analytics-focused coordination
   */
  @Post('analytics')
  async analyticsCoordination(@Body(ValidationPipe) request: AnalyticsCoordinationRequestDto): Promise<CoordinatorResponse> {
    try {
      if (!request.query || request.query.trim().length === 0) {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }

      if (!request.context?.clientId) {
        throw new HttpException('Client ID is required for analytics coordination', HttpStatus.BAD_REQUEST);
      }

      return await this.coordinatorService.coordinate(request);
    } catch (error) {
      console.error('Analytics coordination error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to coordinate analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Research-focused coordination
   */
  @Post('research')
  async researchCoordination(@Body(ValidationPipe) request: ResearchCoordinationRequestDto): Promise<CoordinatorResponse> {
    try {
      if (!request.query || request.query.trim().length === 0) {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }

      if (!request.context?.searchType) {
        throw new HttpException('Search type is required for research coordination', HttpStatus.BAD_REQUEST);
      }

      return await this.coordinatorService.coordinate(request);
    } catch (error) {
      console.error('Research coordination error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to coordinate research',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Communication-focused coordination
   */
  @Post('communication')
  async communicationCoordination(@Body(ValidationPipe) request: CommunicationCoordinationRequestDto): Promise<CoordinatorResponse> {
    try {
      if (!request.query || request.query.trim().length === 0) {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }

      return await this.coordinatorService.coordinate(request);
    } catch (error) {
      console.error('Communication coordination error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to coordinate communication',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get coordination health status
   */
  @Get('health')
  async getHealth() {
    try {
      return await this.coordinatorService.healthCheck();
    } catch (error) {
      console.error('Health check error:', error);
      throw new HttpException(
        'Health check failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get available coordination tools for LangGraph
   */
  @Get('tools')
  async getAvailableTools() {
    try {
      return this.coordinatorTools.getAvailableTools();
    } catch (error) {
      console.error('Tools retrieval error:', error);
      throw new HttpException(
        'Failed to retrieve tools',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get coordination statistics
   */
  @Get('stats')
  async getStats() {
    try {
      return await this.coordinatorTools.getToolStats();
    } catch (error) {
      console.error('Stats retrieval error:', error);
      throw new HttpException(
        'Failed to retrieve stats',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * LangGraph tool execution endpoint
   */
  @Post('tools/execute')
  async executeTool(
    @Body(ValidationPipe) body: ToolExecutionRequestDto
  ) {
    try {
      const { tool, input } = body;

      if (!tool || !input) {
        throw new HttpException('Tool name and input are required', HttpStatus.BAD_REQUEST);
      }

      switch (tool) {
        case 'coordinate':
          return await this.coordinatorTools.coordinateTool(input);
        
        case 'analyticsCoordination':
          return await this.coordinatorTools.analyticsCoordinationTool(input);
        
        case 'researchCoordination':
          return await this.coordinatorTools.researchCoordinationTool(input);
        
        case 'communicationCoordination':
          return await this.coordinatorTools.communicationCoordinationTool(input);
        
        case 'healthCheck':
          return await this.coordinatorTools.healthCheckTool();
        
        default:
          throw new HttpException(`Unknown tool: ${tool}`, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Tool execution error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Tool execution failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Batch coordination for multiple queries
   */
  @Post('batch')
  async batchCoordination(
    @Body(ValidationPipe) body: BatchCoordinationRequestDto
  ): Promise<{ results: CoordinatorResponse[]; totalTime: number; }> {
    try {
      const { requests, parallel = false } = body;

      if (!requests || !Array.isArray(requests) || requests.length === 0) {
        throw new HttpException('Requests array is required', HttpStatus.BAD_REQUEST);
      }

      if (requests.length > 10) {
        throw new HttpException('Maximum 10 requests allowed per batch', HttpStatus.BAD_REQUEST);
      }

      const startTime = Date.now();
      let results: CoordinatorResponse[];

      if (parallel) {
        // Execute all requests in parallel
        results = await Promise.all(
          requests.map(request => this.coordinatorService.coordinate(request))
        );
      } else {
        // Execute requests sequentially
        results = [];
        for (const request of requests) {
          const result = await this.coordinatorService.coordinate(request);
          results.push(result);
        }
      }

      const totalTime = Date.now() - startTime;

      return {
        results,
        totalTime
      };
    } catch (error) {
      console.error('Batch coordination error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Batch coordination failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Smart coordination - automatically determines best strategy
   */
  @Post('smart')
  async smartCoordination(
    @Body(ValidationPipe) body: SmartCoordinationRequestDto
  ): Promise<CoordinatorResponse> {
    try {
      const { query, context, preferences } = body;

      if (!query || query.trim().length === 0) {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }

      // Build enhanced request with preferences
      const request: CoordinatorRequest = {
        query,
        context: {
          ...context,
          metadata: {
            ...context?.metadata,
            preferences
          }
        }
      };

      return await this.coordinatorService.coordinate(request);
    } catch (error) {
      console.error('Smart coordination error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Smart coordination failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}