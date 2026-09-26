import { OfflineQueue } from '../../offline/queue';

describe('Offline Queue Service', () => {
  let queue: OfflineQueue;

  beforeEach(() => {
    queue = new OfflineQueue();
  });

  it('enqueues pending operations', async () => {
    const item = await queue.enqueue({
      type: 'CREATE_INCIDENT',
      endpoint: '/api/v1/incidents',
      method: 'POST',
      payload: { title: 'Test Flood', severity: 'high' },
      maxRetries: 5,
    });

    expect(item.id).toBeDefined();
    expect(item.status).toBe('pending');
    expect(item.retryCount).toBe(0);
  });

  it('returns queue length accurately', async () => {
    await queue.enqueue({
      type: 'TRIGGER_SOS',
      endpoint: '/api/v1/emergency/sos',
      method: 'POST',
      payload: { lat: 37.77, lng: -122.41 },
      maxRetries: 10,
    });

    const pending = await queue.getPendingItems();
    expect(pending.length).toBeGreaterThan(0);
  });
});\n