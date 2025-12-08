export function errorToMessage(e: unknown): string {
  if (e instanceof Error) return e.message;

  try {
    return JSON.stringify(e);
  } catch {
    return 'Ukendt fejl';
  }
}
