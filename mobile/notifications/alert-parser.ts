import { DisasterAlert } from '../types/alert';

export const AlertParser = {
  parseFromSocket(raw: any): DisasterAlert {
    return {
      id: raw.id || `alert-${Date.now()}`,
      title: raw.title || 'Official Disaster Warning',
      message: raw.message || '',
      hazardType: raw.hazardType || 'general',
      severity: raw.severity || 'WARNING',
      affectedRegions: raw.affectedRegions || [],
      issuedAt: raw.issuedAt || new Date().toISOString(),
      expiresAt: raw.expiresAt || new Date(Date.now() + 86400000).toISOString(),
      source: raw.source || 'Emergency Operations Control',
      evacuationMandatory: Boolean(raw.evacuationMandatory),
      actionInstructions: raw.actionInstructions || [],
    };
  }
};
