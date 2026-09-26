import { IncidentApi } from '../api/incident.api';
import { IncidentReport } from '../../types/incident';
import { IncidentDao } from '../../database/incident.dao';
import { SyncQueue } from '../../offline/queue';
import { Connectivity } from '../../offline/connectivity';

export const IncidentReportService = {
  async submitReport(report: IncidentReport): Promise<void> {
    await IncidentDao.insertOrUpdate(report);
    const online = await Connectivity.isOnline();
    if (online) {
      try {
        await IncidentApi.createIncident(report);
        report.syncStatus = 'synced';
        await IncidentDao.insertOrUpdate(report);
        return;
      } catch {}
    }
    await SyncQueue.enqueue('CREATE_INCIDENT', '/incidents', 'POST', report);
  }
};
