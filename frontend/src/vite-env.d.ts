/// <reference types="vite/client" />

// Add JSON module support
declare module "*.json" {
  const value: any;
  export default value;
}
