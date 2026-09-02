import { Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async openSignupModal(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign up' }).click();
  }

  async openSigninModal(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }
}
