import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly name: Locator;
  readonly photo: Locator;

  constructor(private readonly page: Page) {
    this.name = page.locator('app-profile').locator('.profile_name');
    this.photo = page.locator('app-profile').getByRole('img', { name: 'User photo' });
  }

  async open(): Promise<void> {
    await this.page.goto('/panel/profile');
  }
}
