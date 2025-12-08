import { AuthClient } from '../generated-ts-client';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const prod = import.meta.env.PROD;

const apiUrl = prod ? 'https://' + baseUrl : 'http://' + baseUrl;

export const authClient = new AuthClient(apiUrl, {
  fetch: (url, init) => {
    return window.fetch(url, {
      ...init,
      credentials: 'include',
    });
  },
});
