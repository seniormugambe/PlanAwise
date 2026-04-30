import type { AgentResponse } from '../types.js';

export interface Agent<TInput = unknown> {
  handle(input: TInput): Promise<AgentResponse>;
}
