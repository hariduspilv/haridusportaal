export function focus(id: string) {
  setTimeout(() => {
    const elem = document.getElementById(id);
    if (elem) {
      document.getElementById(id).focus();
    }
  },         0);
}
