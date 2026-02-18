import { http, HttpResponse, delay } from 'msw';
import { mockModels } from './models.mock';

export const modelHandlers = [
  http.get('*/models/options', async () => {
    await delay(150);
    const options = mockModels.map(m => ({
        value: m.id,
        label: m.name,
    }));
    return HttpResponse.json(options);
  }),
  // ... other model handlers might exist here
];