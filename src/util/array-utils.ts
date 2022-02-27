export function last<T>(array: T[]): T {
  if (array.length > 0) {
    return array[array.length - 1];
  } else {
    return null;
  }
}