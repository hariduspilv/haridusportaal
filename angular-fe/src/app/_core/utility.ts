export function focus(id: string) {
  setTimeout(() => {
    const elem = document.getElementById(id);
    if (elem) {
      document.getElementById(id).focus();
    }
  },         0);
}
export function arrayOfLength(len) {
  return Array(parseInt(len, 10)).fill(0).map((x, i) => i);
}
export function parseUnixDate(input) {
  const tmpDate = new Date(input * 1000);
  const year = tmpDate.getFullYear();
  const month = tmpDate.getMonth();
  const day = tmpDate.getDate();
  return new Date(year, month, day, 0, 0).getTime();
}
