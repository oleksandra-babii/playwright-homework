import { test, expect } from './fixtures/userGaragePage.fixture';

/**
 * Uses the `userGaragePage` fixture (see fixtures/userGaragePage.fixture.ts), which
 * loads the storage state saved by the `setup` project (tests/setup/auth.setup.ts)
 * so the user is already logged in when the test starts.
 */
test.describe('Garage', () => {
  test('shows the garage page for the already logged-in user', async ({ userGaragePage }) => {
    await expect(userGaragePage.heading).toBeVisible();
    await expect(userGaragePage.logoutButton).toBeVisible();
    await expect(userGaragePage.addCarButton).toBeVisible();
  });
});
