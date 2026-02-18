import { http, HttpResponse, delay } from 'msw';
import { mockBrands } from './brands.mock';

export const brandHandlers = [
  http.get('*/brands/options', async () => {
    await delay(150);
    const options = mockBrands.map(b => ({
        value: b.id,
        label: b.name,
    }));
    return HttpResponse.json(options);
  }),
  // ... other brand handlers might exist here
];