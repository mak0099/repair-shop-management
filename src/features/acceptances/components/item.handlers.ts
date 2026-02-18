import { http, HttpResponse, delay } from 'msw';
import { mockItems } from './items.mock';

export const itemHandlers = [
  http.get('*/items/options', async () => {
    await delay(150);
    const options = mockItems.map(i => ({
        value: i.id,
        label: i.name,
    }));
    return HttpResponse.json(options);
  }),
  // ... other item handlers might exist here
];