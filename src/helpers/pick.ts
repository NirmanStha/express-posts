/**
 * Creates a new object with only the specified keys from the original object
 * @param obj - The source object
 * @param keys - Array of keys to pick from the object
 * @returns A new object containing only the specified keys
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Creates a new object with only the specified keys from the original object (alternative implementation)
 * @param obj - The source object
 * @param keys - Array of keys to pick from the object
 * @returns A new object containing only the specified keys
 */
export function pickKeys<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Partial<T>);
}
