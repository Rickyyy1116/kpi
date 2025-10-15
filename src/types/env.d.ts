// Cloudflare D1 の型定義
declare global {
  interface Env {
    DB: D1Database;
    CACHE: KVNamespace;
  }
}

export {};

