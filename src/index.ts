export function hello(name: string): string {
  return `Hello, ${name}!`;
}

if (process.env.NODE_ENV !== 'test') {
  // Simple runtime to show build/start works
  // eslint-disable-next-line no-console
  console.log(hello('World'));
}
