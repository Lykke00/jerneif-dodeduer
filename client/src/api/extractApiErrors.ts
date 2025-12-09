import { ApiException } from '../generated-ts-client';

export interface FieldError {
  field: string;
  messages: string[];
}

export const extractApiErrorsDetailed = (e: unknown): Record<string, string[]> | null => {
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

    if (errorData?.errors && typeof errorData.errors === 'object') {
      return errorData.errors;
    }

    return null;
  } catch {
    return null;
  }
};

// For backward compatibility - returns all messages as a single string
export const extractApiErrors = (e: unknown): string | null => {
  const errors = extractApiErrorsDetailed(e);
  if (!errors) return null;

  const allMessages: string[] = [];
  for (const messages of Object.values(errors)) {
    if (Array.isArray(messages)) {
      allMessages.push(...messages);
    }
  }

  return allMessages.length > 0 ? allMessages.join(', ') : null;
};

// Helper to check if a specific field has errors
export const hasFieldError = (
  errors: Record<string, string[]> | null,
  fieldName: string
): boolean => {
  return !!errors?.[fieldName]?.length;
};

// Helper to get errors for a specific field
export const getFieldErrors = (
  errors: Record<string, string[]> | null,
  fieldName: string
): string[] => {
  return errors?.[fieldName] || [];
};
