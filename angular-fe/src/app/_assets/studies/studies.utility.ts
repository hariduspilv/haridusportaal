import { ExternalQualifications, Studies } from "./studies.model";

export function dateSortFn(
  a: Studies | ExternalQualifications,
  b: Studies | ExternalQualifications,
  field: string = 'oppAlgus',
): number {
  const field1 = a[field] || (a as ExternalQualifications).valjaandmKp;
  const field2 = b[field] || (b as ExternalQualifications).valjaandmKp;
  const arrA = field1.split('.');
  const valA = `${arrA[2]}-${arrA[1]}-${arrA[0]}`;
  const arrB = field2.split('.');
  const valB = `${arrB[2]}-${arrB[1]}-${arrB[0]}`;
  return +new Date(valB) - +new Date(valA);
}
