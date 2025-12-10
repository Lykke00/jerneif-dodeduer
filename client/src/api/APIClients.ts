import { AuthClient, DepositClient, UserClient } from '../generated-ts-client';
import { TOKEN_KEY } from '../atoms/auth';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const prod = import.meta.env.PROD;

const apiUrl = prod ? 'https://' + baseUrl : 'http://' + baseUrl;

function createClient<T extends AuthClient | DepositClient | UserClient>(
  Ctor: new (...args: any[]) => T
): T {
  return new Ctor(apiUrl, {
    fetch: (url: RequestInfo, init?: RequestInit) => {
      const token = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');

      const headers = {
        ...init?.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // IMPORTANT: no explicit return type!
      return window.fetch(url, {
        ...init,
        credentials: 'include',
        headers,
      });
    },
  });
}

export const authClient = createClient(AuthClient);
export const depositClient = createClient(DepositClient);
export const userClient = createClient(UserClient);
