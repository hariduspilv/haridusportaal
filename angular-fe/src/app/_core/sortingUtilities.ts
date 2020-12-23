import { SortDirection } from './models/Sorting';

export interface MultipleSortKeys {
  key: string;
  direction?: SortDirection;
}

const getDescendantProp = (obj, path): any => path.split('.')
  .reduce((acc, part) => acc && acc[part], obj);

const transformToLowerCase = (value): string | undefined => (
  value ? value.toString().toLowerCase() : value
);

export const sortByComparison = (first: any, second: any): number => {
  const a = typeof first === 'string' ? transformToLowerCase(first) : first;
  const b = typeof second === 'string' ? transformToLowerCase(second) : second;

  // == check is for both null and undefined
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a < b) return -1;
  if (a > b) return 1;

  return 0;
};

export const sortByDotNotationKey = (arr: any, key: string): any[] => arr.sort((a, b) => {
  const composedA = getDescendantProp(a, key);
  const composedB = getDescendantProp(b, key);

  return sortByComparison(composedA, composedB);
});

export const sortByKey = (arr: any, key: string, direction?: SortDirection): any[] => {
  if (key.includes('.')) {
    return sortByDotNotationKey(arr, key);
  }

  return arr.sort((a, b) => (direction === SortDirection.ASC
    ? sortByComparison(a[key], b[key])
    : sortByComparison(a[key], b[key]) * -1));
};

export const sortByMultipleKeys = (
  sourceArray: any[],
  keysArray: MultipleSortKeys[],
): any[] => keysArray
  .reduce((list, currentKey) => sortByKey(list, currentKey.key, currentKey.direction), sourceArray);
