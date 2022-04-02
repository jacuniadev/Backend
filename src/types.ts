export const enum Time {
  Second = 1000,
  Minute = 60 * Second,
  Hour = 60 * Minute,
  Day = 24 * Hour,
  Week = 7 * Day,
  Month = 30 * Day,
  Year = 365 * Day,
}

export interface BackendSettings {
  port: number;
  verbose: boolean;
  mongoUrl: string;
  secure: boolean;
}
