export class Time {
  public static Second = 1000;
  public static Minute = 60 * this.Second;
  public static Hour = 60 * this.Minute;
  public static Day = 24 * this.Hour;
  public static Week = 7 * this.Day;
  public static Month = 30 * this.Day;
  public static Year = 365 * this.Day;
}
