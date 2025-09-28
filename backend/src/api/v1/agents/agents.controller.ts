import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../../auth/jwt.guard';
import { ResearchAgentService } from '../../../agents/research/research-agent.service';
import { CommunicationAgentService } from '../../../agents/communication/communication-agent.service';
import { ResearchRequestDto, CommunicationRequestDto, DraftRequestDto } from './dto/agent-requests.dto';

@Controller('api/v1/agents')
@UseGuards(JwtGuard)
export class AgentsController {
  constructor(
    private researchAgent: ResearchAgentService,
    private communicationAgent: CommunicationAgentService,
  ) {}

  @Post('research')
  async research(@Body() request: ResearchRequestDto) {
    try {
      const result = await this.researchAgent.research({
        query: request.query,
        type: request.type || 'general',
        limit: request.limit || 10,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('communication/response')
  async generateResponse(@Body() request: CommunicationRequestDto) {
    try {
      const response = await this.communicationAgent.generateResponse(
        request.message,
        request.context
      );

      return {
        success: true,
        data: { response },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('communication/draft')
  async generateDraft(@Body() request: DraftRequestDto) {
    try {
      const draft = await this.communicationAgent.generateDraft(
        request.type,
        request.content,
        request.tone || 'professional'
      );

      return {
        success: true,
        data: { draft },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}