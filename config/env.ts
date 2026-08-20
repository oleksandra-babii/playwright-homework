import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Check your .env file (see .env.example).`);
  }
  return value;
}

export const env = {
  baseUrl: requireEnv('BASE_URL'),
  httpCredentials: {
    username: requireEnv('HTTP_AUTH_USERNAME'),
    password: requireEnv('HTTP_AUTH_PASSWORD'),
  },
  testUser: {
    email: requireEnv('TEST_USER_EMAIL'),
    password: requireEnv('TEST_USER_PASSWORD'),
  },
};
