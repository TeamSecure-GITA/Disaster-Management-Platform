export type AlertSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'EMERGENCY' | 'CRITICAL';

export interface DisasterAlert {
  id: string;
  title: string;
  message: string;
  hazardType: string;
  severity: AlertSeverity;
  affectedRegions: string[];
  issuedAt: string;
  expiresAt: string;
  source: string;
  evacuationMandatory: boolean;
  actionInstructions: string[];
}
