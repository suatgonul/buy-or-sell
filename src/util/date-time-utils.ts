import {DateTime, Duration} from 'luxon';
import {RuntimeException} from '@nestjs/core/errors/exceptions/runtime.exception';

export function addDuration(baseTimestamp: DateTime, duration: Duration, multiply: number): DateTime {
  const multipliedDuration: Duration = Duration.fromMillis(duration.toMillis() * multiply);
  return baseTimestamp.plus(multipliedDuration);
}

export function subtractDuration(baseTimestamp: DateTime, duration: Duration, multiply: number): DateTime {
  const multipliedDuration: Duration = Duration.fromMillis(duration.toMillis() * multiply);
  return baseTimestamp.minus(multipliedDuration);
}

export function getMultipliedDuration(duration: Duration, factor: number): Duration {

  if (duration.minutes) {
    return Duration.fromObject({
      minutes: duration.minutes * factor
    });
  } else if (duration.hours) {
    return Duration.fromObject({
      hours: duration.hours * factor
    });
  } else if (duration.days) {
    return Duration.fromObject({
      days: duration.days * factor
    });
  } else if (duration.weeks) {
    return Duration.fromObject({
      weeks: duration.weeks * factor
    });
  } else if (duration.months) {
    return Duration.fromObject({
      months: duration.months * factor
    });
  } else {
    throw new RuntimeException('Invalid duration');
  }
}