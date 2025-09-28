import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends Logger {
  constructor(context?: string) {
    super(context || 'Application');
  }

  logAgentActivity(agentName: string, activity: string, data?: any) {
    this.log(`[${agentName}] ${activity}`, data ? JSON.stringify(data) : '');
  }

  logError(context: string, error: Error, additionalInfo?: any) {
    this.error(`${context}: ${error.message}`, error.stack, additionalInfo ? JSON.stringify(additionalInfo) : '');
  }

  logPerformance(operation: string, duration: number) {
    this.log(`Performance - ${operation}: ${duration}ms`);
  }

  logAIInteraction(model: string, tokens: number, cost?: number) {
    this.log(`AI - ${model}: ${tokens} tokens${cost ? `, $${cost.toFixed(4)}` : ''}`);
  }
}