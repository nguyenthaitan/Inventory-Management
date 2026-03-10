// Polyfill import.meta.env for Jest (Vite env vars are not available in Jest)
// This runs before any module is loaded, so it must be in a CJS globalSetup file.
// ts-jest with module:'commonjs' transforms import.meta to globalThis['import.meta']
// or leaves it as a syntax error - we patch it here just in case.
if (typeof globalThis['import'] === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {},
    writable: true,
    configurable: true,
  });
}
if (!globalThis['import'].meta) {
  globalThis['import'].meta = {};
}
if (!globalThis['import'].meta.env) {
  globalThis['import'].meta.env = {
    VITE_API_BASE_URL: 'http://localhost:3000',
  };
}
