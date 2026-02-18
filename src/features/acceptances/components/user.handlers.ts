import { http, HttpResponse, delay } from 'msw';
import { mockUsers } from './users.mock';

export const userHandlers = [
  http.get('*/users/options', async () => {
    await delay(150);
    const options = mockUsers.map(u => ({
        value: u.id,
        label: u.name,
    }));
    return HttpResponse.json(options);
  }),
  // ... other user handlers might exist here
];