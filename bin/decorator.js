export function __type(type) {
  return function (a, b) {
    return a[b];
  };
}
