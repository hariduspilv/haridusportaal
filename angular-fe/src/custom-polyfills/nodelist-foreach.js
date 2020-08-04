if (typeof NodeList !== "undefined" && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
  if (typeof Symbol !== "undefined" && Symbol.iterator && !NodeList.prototype[Symbol.iterator]) {
      Object.defineProperty(NodeList.prototype, Symbol.iterator, {
          value: Array.prototype[Symbol.itereator],
          writable: true,
          configurable: true
      });
  }
}
