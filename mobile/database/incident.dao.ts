import { getDatabase } from './index';
import { IncidentReport } from '../types/incident';

export const IncidentDao = {
  async insertOrUpdate(report: IncidentReport): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO incidents (id, title, category, severity, description, latitude, longitude, reported_by, reported_at, status, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [report.id, report.title, report.category, report.severity, report.description, report.coordinates.latitude, report.coordinates.longitude, report.reportedBy, report.reportedAt, report.status, report.syncStatus]
    );
  },
  async getAll(): Promise<IncidentReport[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM incidents ORDER BY reported_at DESC');
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      severity: r.severity,
      description: r.description,
      coordinates: { latitude: r.latitude, longitude: r.longitude },
      photos: [],
      reportedBy: r.reported_by,
      reportedAt: r.reported_at,
      status: r.status,
      syncStatus: r.sync_status,
    }));
  }
};
