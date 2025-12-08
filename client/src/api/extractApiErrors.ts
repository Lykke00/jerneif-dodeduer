import { ApiException } from '../generated-ts-client';

export const extractApiErrors = (e: unknown): string | null => {
  if (!(e instanceof ApiException)) {
    return null;
  }

  try {
    let errorData;

    if (typeof e.response === 'string') {
      try {
        errorData = JSON.parse(e.response);
      } catch {
        return null;
      }
    } else {
      errorData = e.response;
    }

    if (errorData?.errors?.length) {
      return errorData.errors.join(', ');
    }

    return null;
  } catch {
    return null;
  }
};
