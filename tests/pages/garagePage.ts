import { Locator, Page } from '@playwright/test';

export class GaragePage {
  readonly heading: Locator;
  readonly logoutButton: Locator;
  readonly addCarButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Garage' });
    this.logoutButton = page.getByText('Log out', { exact: true });
    this.addCarButton = page.getByRole('button', { name: 'Add car' });
  }

  async open(): Promise<void> {
    await this.page.goto('/panel/garage');
  }
}
