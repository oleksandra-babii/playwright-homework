import { Locator, Page } from '@playwright/test';

export type SignupField = 'name' | 'lastName' | 'email' | 'password' | 'repeatPassword';

export interface SignupFormData {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  repeatPassword?: string;
}

export class SignupModal {
  readonly nameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly serverError: Locator;

  private readonly inputs: Record<SignupField, Locator>;

  constructor(page: Page) {
    this.nameInput = page.locator('#signupName');
    this.lastNameInput = page.locator('#signupLastName');
    this.emailInput = page.locator('#signupEmail');
    this.passwordInput = page.locator('#signupPassword');
    this.repeatPasswordInput = page.locator('#signupRepeatPassword');
    this.registerButton = page.getByRole('button', { name: 'Register' });
    this.serverError = page.locator('app-signup-form .alert-danger');

    this.inputs = {
      name: this.nameInput,
      lastName: this.lastNameInput,
      email: this.emailInput,
      password: this.passwordInput,
      repeatPassword: this.repeatPasswordInput,
    };
  }

  /** Fills the given fields and blurs each one (Tab) so Angular marks it "touched" and runs validation. */
  async fillAndBlur(data: SignupFormData): Promise<void> {
    for (const [field, value] of Object.entries(data) as [SignupField, string][]) {
      const input = this.inputs[field];
      await input.fill(value);
      await input.press('Tab');
    }
  }

  /** Fills the given fields without blurring (form stays "pristine" for the untouched fields). */
  async fill(data: SignupFormData): Promise<void> {
    for (const [field, value] of Object.entries(data) as [SignupField, string][]) {
      await this.inputs[field].fill(value);
    }
  }

  errorMessagesFor(field: SignupField): Locator {
    return this.inputs[field]
      .locator('xpath=ancestor::div[contains(@class,"form-group")]')
      .locator('.invalid-feedback p');
  }

  input(field: SignupField): Locator {
    return this.inputs[field];
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }
}
