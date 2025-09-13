export function urlEncodeObject(props: object): string {
  return encodeURIComponent(btoa(JSON.stringify(props)));
}

export function urlDecodeObject(encodedProps: string): object {
  return JSON.parse(atob(decodeURIComponent(encodedProps)));
}
