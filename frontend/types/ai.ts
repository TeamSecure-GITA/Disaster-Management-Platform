export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ToolResult {
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: 'success' | 'failure' | 'running';
  timestamp: string;
}

export interface SourceCitation {
  id: string;
  title: string;
  sourceType: 'sensor_telemetry' | 'geological_survey' | 'satellite_sar' | 'drone_feed' | 'first_responder' | 'government_bulletin';
  confidence: number;
  snippet: string;
  url?: string;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  citations?: SourceCitation[];
  tools?: ToolResult[];
  confidenceScore?: number;
  actionsSuggested?: AIAction[];
}

export interface AIAction {
  id: string;
  type: 'dispatch_drone' | 'trigger_siren' | 'evacuate_zone' | 'reassign_units' | 'broadcast_sms';
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, any>;
}

export interface SituationBrief {
  id: string;
  headline: string;
  summary: string;
  threatLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  keyImpactZones: string[];
  recommendedActions: string[];
  generatedAt: string;
  confidence: number;
  modelsUsed: string[];
}
