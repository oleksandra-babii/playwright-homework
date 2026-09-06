import { test, expect } from '@playwright/test';
import { ProfilePage } from './pages/profilePage';
import { authFile } from './utils/authFile';

test.use({ storageState: authFile });

test.describe('Profile page', () => {
  test('renders the data returned by the mocked GET profile response', async ({ page }) => {
    const mockedProfile = {
      status: 'ok',
      data: {
        userId: 1,
        photoFilename: 'mocked-photo.png',
        name: 'Mocked',
        lastName: 'Person',
      },
    };

    await page.route('**/api/users/profile', (route) => route.fulfill({ json: mockedProfile }));

    const profilePage = new ProfilePage(page);
    await profilePage.open();

    await expect(profilePage.name).toHaveText(`${mockedProfile.data.name} ${mockedProfile.data.lastName}`);
    await expect(profilePage.photo).toHaveAttribute('src', new RegExp(mockedProfile.data.photoFilename));
  });
});
