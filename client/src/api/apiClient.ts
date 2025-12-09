import { useAuthContext } from '../contexts/AuthContext';

export async function apiCall<T>(fn: () => Promise<T>): Promise<T> {
  const { refresh, logout } = useAuthContext();

  try {
    return await fn();
  } catch (err: any) {
    // hvis request fejler med 401 → prøv refresh
    if (err?.status === 401 || err?.response?.status === 401) {
      try {
        await refresh();
        return await fn(); // kør original request igen
      } catch {
        logout();
        throw err;
      }
    }

    throw err;
  }
}
