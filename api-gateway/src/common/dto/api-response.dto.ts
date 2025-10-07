export class ApiResponseDto<T> {
  success: boolean;
  data?: T | null;
  error?: string;
  message?: string;
  timestamp: string;

  constructor(
    success: boolean,
    data?: T | null,
    error?: string,
    message?: string,
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(true, data, undefined, message);
  }

  static error<T>(error: string, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, null as T, error, message);
  }
}
