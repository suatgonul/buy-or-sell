import {DateTime, Duration} from 'luxon';

/**
 * Adds duration (multiplied with the given multiplication factor) to timestamp
 * @param baseTimestamp Time stamp from which the duration to be added
 * @param duration Base duration to be added
 * @param multiply Multiplication factor for the base duration
 */
export function addDuration(baseTimestamp: DateTime, duration: Duration, multiply: number): DateTime {
  const multipliedDuration: Duration = Duration.fromMillis(duration.toMillis() * multiply);
  return baseTimestamp.plus(multipliedDuration);
}

/**
 * Subtracts duration (multiplied with the given multiplication factor) from timestamp
 * @param baseTimestamp Time stamp from which the duration to be subtracted
 * @param duration Base duration to be subtracted
 * @param multiply Multiplication factor for the base duration
 */
export function subtractDuration(baseTimestamp: DateTime, duration: Duration, multiply: number): DateTime {
  const multipliedDuration: Duration = Duration.fromMillis(duration.toMillis() * multiply);
  return baseTimestamp.minus(multipliedDuration);
}