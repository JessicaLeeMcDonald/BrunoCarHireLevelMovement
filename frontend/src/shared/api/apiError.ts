import { AxiosError } from 'axios';
import type { ProblemDetails } from './types';

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  detail?: string;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.detail = detail;
  }

  get firstMessage(): string {
    const firstFieldError = Object.values(this.fieldErrors)[0]?.[0];
    return this.detail ?? firstFieldError ?? this.message;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const problem = error.response?.data as ProblemDetails | undefined;
    const status = error.response?.status ?? 0;

    if (problem) {
      return new ApiError(status, problem.title ?? error.message, problem.errors ?? {}, problem.detail);
    }

    return new ApiError(status, error.message);
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message);
  }

  return new ApiError(0, 'An unexpected error occurred.');
}
