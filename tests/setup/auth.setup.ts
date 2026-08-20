import { test as setup } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginModal } from '../pages/loginModal';
import { authFile } from '../utils/authFile';
import { env } from '../../config/env';

setup('authenticate as test user', async ({ page }) => {
  const homePage = new HomePage(page);
  const loginModal = new LoginModal(page);

  await homePage.open();
  await homePage.openSigninModal();
  await loginModal.login(env.testUser.email, env.testUser.password);

  await page.waitForURL(/\/panel\/garage/);
  await page.context().storageState({ path: authFile });
});
