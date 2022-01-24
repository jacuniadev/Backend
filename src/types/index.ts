export const enum Time {
  Second = 1000,
  Minute = 60 * Second,
  Hour = 60 * Minute,
  Day = 24 * Hour,
  Week = 7 * Day,
  Month = 30 * Day,
  Year = 365 * Day,
}

export const enum WebsocketEvents {}

export interface DatabaseObject {
  uuid: string;
  created_at: number;
  updated_at: number;
}

export interface BackendSettings {
  port: number;
  verbose: boolean;
  mongoUrl: string;
  secure: boolean;
}

export interface IGeolocation {
  ip: string;
  success: boolean;
  type: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  country_flag: string;
  country_capital: string;
  country_phone: string;
  country_neighbours: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  asn: string;
  org: string;
  isp: string;
  timezone: string;
  timezone_name: string;
  timezone_dstOffset: number;
  timezone_gmtOffset: number;
  timezone_gmt: string;
  currency: string;
  currency_code: string;
  currency_symbol: string;
  currency_rates: number;
  currency_plural: string;
  completed_requests: number;
}
