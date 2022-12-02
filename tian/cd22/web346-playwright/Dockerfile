# syntax=docker/dockerfile:1.3-labs
FROM mcr.microsoft.com/playwright:v1.28.0-focal
RUN <<EOF 
mkdir -p app/tests
cd app
npm init -y
npm install -D  @playwright/test
cat <<EOOF > playwright.config.ts
import type { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
  use: {
    baseURL: 'http://box101:3000',
    browserName: 'firefox',
    headless: true,
  },
};
export default config;
EOOF
EOF