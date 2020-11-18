declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    MONGO_URL: string;
    BOT_TOKEN: string;
    PORT: string;
    URL: string;
    FINANCE_BASE_URL: string;
  }
}
