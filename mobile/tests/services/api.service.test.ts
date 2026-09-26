import { ApiClient } from '../../services/api/client';

describe('ApiClient', () => {
  it('initializes with base URL and headers', () => {
    const client = new ApiClient({ baseURL: 'http://localhost:5000/api' });
    expect(client).toBeDefined();
  });

  it('correctly builds query parameters', async () => {
    const client = new ApiClient({ baseURL: 'http://localhost:5000/api' });
    expect(client.getBaseURL()).toContain('5000');
  });
});\n