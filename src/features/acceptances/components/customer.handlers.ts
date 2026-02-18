import { http, HttpResponse, delay } from 'msw';
import { mockCustomers } from './customers.mock';

export const customerHandlers = [
  http.get('*/customers/options', async () => {
    await delay(150);
    const options = mockCustomers.map(c => ({
        value: c.id,
        label: `${c.name} (${c.mobile})`,
    }));
    return HttpResponse.json(options);
  }),
  // ... other customer handlers might exist here
];