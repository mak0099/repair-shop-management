import { http, HttpResponse, delay } from 'msw';
import { mockMasterSettings } from './master-settings.mock';

export const masterSettingHandlers = [
  http.get('*/master-settings/options', async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    if (!type) {
        return HttpResponse.json([], { status: 400 });
    }
    const options = mockMasterSettings
        .filter(s => s.type === type)
        .map(s => ({ value: s.value, label: s.label }));
    
    return HttpResponse.json(options);
  }),
  // ... other master setting handlers might exist here
];