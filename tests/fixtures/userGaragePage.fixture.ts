import { test as base, expect } from '@playwright/test';
import { GaragePage } from '../pages/garagePage';
import { authFile } from '../utils/authFile';

export const test = base.extend<{ userGaragePage: GaragePage }>({
  storageState: authFile,

  userGaragePage: async ({ page }, use) => {
    const garagePage = new GaragePage(page);
    await garagePage.open();
    await use(garagePage);
  },
});

export { expect };
