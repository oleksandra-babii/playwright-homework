import { test, expect, Locator, Page } from '@playwright/test';
import { validSignupData } from './utils/testData';

/**
 * Covers the "Register" form on https://qauto.forstudy.space/.
 * Every user created here gets an email starting with the `autotest_` prefix
 * (see utils/testData.ts) so autotest accounts can be told apart from real ones.
 */

type SignupField = 'name' | 'lastName' | 'email' | 'password' | 'repeatPassword';

interface SignupFormData {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  repeatPassword?: string;
}

function signupInputs(page: Page): Record<SignupField, Locator> {
  return {
    name: page.locator('#signupName'),
    lastName: page.locator('#signupLastName'),
    email: page.locator('#signupEmail'),
    password: page.locator('#signupPassword'),
    repeatPassword: page.locator('#signupRepeatPassword'),
  };
}

/** Fills the given fields and blurs each one (Tab) so Angular marks it "touched" and runs validation. */
async function fillAndBlur(page: Page, data: SignupFormData): Promise<void> {
  const inputs = signupInputs(page);
  for (const [field, value] of Object.entries(data) as [SignupField, string][]) {
    await inputs[field].fill(value);
    await inputs[field].press('Tab');
  }
}

/** Fills the given fields without blurring (form stays "pristine" for the untouched fields). */
async function fillSignup(page: Page, data: SignupFormData): Promise<void> {
  const inputs = signupInputs(page);
  for (const [field, value] of Object.entries(data) as [SignupField, string][]) {
    await inputs[field].fill(value);
  }
}

function errorMessagesFor(page: Page, field: SignupField): Locator {
  return signupInputs(page)[field]
    .locator('xpath=ancestor::div[contains(@class,"form-group")]')
    .locator('.invalid-feedback p');
}

async function openSignupModal(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign up' }).click();
}

test.describe('Registration form', () => {
  test.beforeEach(async ({ page }) => {
    await openSignupModal(page);
  });

  test('registers a new user when all fields are filled in correctly', async ({ page }) => {
    const data = validSignupData();
    const registerButton = page.getByRole('button', { name: 'Register' });

    await fillAndBlur(page, data);
    await expect(registerButton).toBeEnabled();

    await registerButton.click();

    await expect(page).toHaveURL(/\/panel\/garage/);
    await expect(page.getByRole('heading', { name: 'Garage' })).toBeVisible();
    await expect(page.getByText('Log out', { exact: true })).toBeVisible();
  });

  test('shows a "required" error for every field and keeps Register disabled on an empty submit', async ({ page }) => {
    const inputs = signupInputs(page);
    await inputs.name.press('Tab');
    await inputs.lastName.press('Tab');
    await inputs.email.press('Tab');
    await inputs.password.press('Tab');
    await inputs.repeatPassword.press('Tab');

    await expect(errorMessagesFor(page, 'name')).toHaveText('Name required');
    await expect(errorMessagesFor(page, 'lastName')).toHaveText('Last name required');
    await expect(errorMessagesFor(page, 'email')).toHaveText('Email required');
    await expect(errorMessagesFor(page, 'password')).toHaveText('Password required');
    await expect(errorMessagesFor(page, 'repeatPassword')).toHaveText('Re-enter password required');

    for (const field of ['name', 'lastName', 'email', 'password', 'repeatPassword'] as const) {
      await expect(inputs[field]).toHaveClass(/is-invalid/);
    }
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows a length error when Name is shorter than 2 characters', async ({ page }) => {
    await fillAndBlur(page, { name: 'A' });

    await expect(errorMessagesFor(page, 'name')).toHaveText(
      'Name has to be from 2 to 20 characters long',
    );
    await expect(signupInputs(page).name).toHaveClass(/is-invalid/);
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows an "invalid" error when Name contains digits', async ({ page }) => {
    await fillAndBlur(page, { name: 'Anna4' });

    await expect(errorMessagesFor(page, 'name')).toHaveText('Name is invalid');
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows a length error when Name is longer than 20 characters', async ({ page }) => {
    await fillAndBlur(page, { name: 'A'.repeat(21) });

    await expect(errorMessagesFor(page, 'name')).toHaveText(
      'Name has to be from 2 to 20 characters long',
    );
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('does not trim surrounding spaces in Name, contrary to the written requirement', async ({ page }) => {
    // The spec says the Name field should ignore/trim surrounding spaces, but the
    // live app flags a space-padded value as invalid instead of trimming it first.
    await fillAndBlur(page, { name: '  Anna  ' });

    await expect(errorMessagesFor(page, 'name')).toHaveText('Name is invalid');
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows a length error when Last name is shorter than 2 characters', async ({ page }) => {
    await fillAndBlur(page, { lastName: 'B' });

    await expect(errorMessagesFor(page, 'lastName')).toHaveText(
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(signupInputs(page).lastName).toHaveClass(/is-invalid/);
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows a length error when Last name is longer than 20 characters', async ({ page }) => {
    await fillAndBlur(page, { lastName: 'B'.repeat(21) });

    await expect(errorMessagesFor(page, 'lastName')).toHaveText(
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows an "invalid" error when Last name contains digits', async ({ page }) => {
    await fillAndBlur(page, { lastName: 'Smith4' });

    await expect(errorMessagesFor(page, 'lastName')).toHaveText('Last name is invalid');
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('shows an "incorrect" error for a malformed email address', async ({ page }) => {
    await fillAndBlur(page, { email: 'not-an-email' });

    await expect(errorMessagesFor(page, 'email')).toHaveText('Email is incorrect');
    await expect(signupInputs(page).email).toHaveClass(/is-invalid/);
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  const weakPasswords: Array<[string, string]> = [
    ['short1A', 'is shorter than 8 characters'],
    ['Aa1' + 'a'.repeat(13), 'is longer than 15 characters'],
    ['alllowercase1', 'has no capital letter'],
    ['ALLUPPERCASE1', 'has no small letter'],
    ['NoDigitsHere', 'has no digit'],
  ];

  for (const [password, reason] of weakPasswords) {
    test(`rejects a password that ${reason}`, async ({ page }) => {
      await fillAndBlur(page, { password });

      await expect(errorMessagesFor(page, 'password')).toHaveText(
        'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter',
      );
      await expect(signupInputs(page).password).toHaveClass(/is-invalid/);
      await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
    });
  }

  test('shows a "do not match" error when Re-enter password differs from Password', async ({ page }) => {
    await fillAndBlur(page, { password: 'ValidPass1', repeatPassword: 'Other1234' });

    await expect(errorMessagesFor(page, 'repeatPassword')).toHaveText('Passwords do not match');
    await expect(signupInputs(page).repeatPassword).toHaveClass(/is-invalid/);
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('keeps the Register button disabled until every field becomes valid', async ({ page }) => {
    const data = validSignupData();
    const registerButton = page.getByRole('button', { name: 'Register' });

    await fillSignup(page, { name: data.name });
    await expect(registerButton).toBeDisabled();

    await fillSignup(page, { lastName: data.lastName });
    await expect(registerButton).toBeDisabled();

    await fillSignup(page, { email: data.email });
    await expect(registerButton).toBeDisabled();

    await fillSignup(page, { password: data.password });
    await expect(registerButton).toBeDisabled();

    await fillSignup(page, { repeatPassword: data.repeatPassword });
    await expect(registerButton).toBeEnabled();
  });

  test('rejects registration with an email that is already taken', async ({ page }) => {
    const data = validSignupData();
    const registerButton = page.getByRole('button', { name: 'Register' });

    await fillAndBlur(page, data);
    await registerButton.click();
    await expect(page).toHaveURL(/\/panel\/garage/);

    await page.getByText('Log out', { exact: true }).click();
    await openSignupModal(page);

    await fillAndBlur(page, data);
    await registerButton.click();

    await expect(page.locator('app-signup-form .alert-danger')).toHaveText('User already exists');
    await expect(page).not.toHaveURL(/\/panel\/garage/);
  });
});
