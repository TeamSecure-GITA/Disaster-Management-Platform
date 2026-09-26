export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isOfflineExpertResponse?: boolean;
  suggestedActions?: string[];
  toolCitations?: string[];
}

export interface DamageAnalysisResult {
  damageLevel: 'no_damage' | 'minor' | 'moderate' | 'severe' | 'destroyed';
  confidence: number;
  summary: string;
  detectedObjects: string[];
  debrisDensityPct?: number;
  roofCollapsePct?: number;
}
