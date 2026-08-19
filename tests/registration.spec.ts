import { test, expect } from '@playwright/test';
import { HomePage } from './pages/homePage';
import { SignupModal } from './pages/signupModal';
import { validSignupData } from './utils/testData';

/**
 * Covers the "Register" form on https://qauto.forstudy.space/.
 * Every user created here gets an email starting with the `autotest_` prefix
 * (see utils/testData.ts) so autotest accounts can be told apart from real ones.
 */
test.describe('Registration form', () => {
  let homePage: HomePage;
  let signupModal: SignupModal;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    signupModal = new SignupModal(page);
    await homePage.open();
    await homePage.openSignupModal();
  });

  test('registers a new user when all fields are filled in correctly', async ({ page }) => {
    const data = validSignupData();

    await signupModal.fillAndBlur(data);
    await expect(signupModal.registerButton).toBeEnabled();

    await signupModal.submit();

    await expect(page).toHaveURL(/\/panel\/garage/);
    await expect(page.getByRole('heading', { name: 'Garage' })).toBeVisible();
    await expect(page.getByText('Log out', { exact: true })).toBeVisible();
  });

  test('shows a "required" error for every field and keeps Register disabled on an empty submit', async () => {
    await signupModal.nameInput.press('Tab');
    await signupModal.lastNameInput.press('Tab');
    await signupModal.emailInput.press('Tab');
    await signupModal.passwordInput.press('Tab');
    await signupModal.repeatPasswordInput.press('Tab');

    await expect(signupModal.errorMessagesFor('name')).toHaveText('Name required');
    await expect(signupModal.errorMessagesFor('lastName')).toHaveText('Last name required');
    await expect(signupModal.errorMessagesFor('email')).toHaveText('Email required');
    await expect(signupModal.errorMessagesFor('password')).toHaveText('Password required');
    await expect(signupModal.errorMessagesFor('repeatPassword')).toHaveText('Re-enter password required');

    for (const field of ['name', 'lastName', 'email', 'password', 'repeatPassword'] as const) {
      await expect(signupModal.input(field)).toHaveClass(/is-invalid/);
    }
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows a length error when Name is shorter than 2 characters', async () => {
    await signupModal.fillAndBlur({ name: 'A' });

    await expect(signupModal.errorMessagesFor('name')).toHaveText(
      'Name has to be from 2 to 20 characters long',
    );
    await expect(signupModal.nameInput).toHaveClass(/is-invalid/);
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows an "invalid" error when Name contains digits', async () => {
    await signupModal.fillAndBlur({ name: 'Anna4' });

    await expect(signupModal.errorMessagesFor('name')).toHaveText('Name is invalid');
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows a length error when Name is longer than 20 characters', async () => {
    await signupModal.fillAndBlur({ name: 'A'.repeat(21) });

    await expect(signupModal.errorMessagesFor('name')).toHaveText(
      'Name has to be from 2 to 20 characters long',
    );
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('does not trim surrounding spaces in Name, contrary to the written requirement', async () => {
    // The spec says the Name field should ignore/trim surrounding spaces, but the
    // live app flags a space-padded value as invalid instead of trimming it first.
    await signupModal.fillAndBlur({ name: '  Anna  ' });

    await expect(signupModal.errorMessagesFor('name')).toHaveText('Name is invalid');
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows a length error when Last name is shorter than 2 characters', async () => {
    await signupModal.fillAndBlur({ lastName: 'B' });

    await expect(signupModal.errorMessagesFor('lastName')).toHaveText(
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(signupModal.lastNameInput).toHaveClass(/is-invalid/);
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows a length error when Last name is longer than 20 characters', async () => {
    await signupModal.fillAndBlur({ lastName: 'B'.repeat(21) });

    await expect(signupModal.errorMessagesFor('lastName')).toHaveText(
      'Last name has to be from 2 to 20 characters long',
    );
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows an "invalid" error when Last name contains digits', async () => {
    await signupModal.fillAndBlur({ lastName: 'Smith4' });

    await expect(signupModal.errorMessagesFor('lastName')).toHaveText('Last name is invalid');
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('shows an "incorrect" error for a malformed email address', async () => {
    await signupModal.fillAndBlur({ email: 'not-an-email' });

    await expect(signupModal.errorMessagesFor('email')).toHaveText('Email is incorrect');
    await expect(signupModal.emailInput).toHaveClass(/is-invalid/);
    await expect(signupModal.registerButton).toBeDisabled();
  });

  const weakPasswords: Array<[string, string]> = [
    ['short1A', 'is shorter than 8 characters'],
    ['Aa1' + 'a'.repeat(13), 'is longer than 15 characters'],
    ['alllowercase1', 'has no capital letter'],
    ['ALLUPPERCASE1', 'has no small letter'],
    ['NoDigitsHere', 'has no digit'],
  ];

  for (const [password, reason] of weakPasswords) {
    test(`rejects a password that ${reason}`, async () => {
      await signupModal.fillAndBlur({ password });

      await expect(signupModal.errorMessagesFor('password')).toHaveText(
        'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter',
      );
      await expect(signupModal.passwordInput).toHaveClass(/is-invalid/);
      await expect(signupModal.registerButton).toBeDisabled();
    });
  }

  test('shows a "do not match" error when Re-enter password differs from Password', async () => {
    await signupModal.fillAndBlur({ password: 'ValidPass1', repeatPassword: 'Other1234' });

    await expect(signupModal.errorMessagesFor('repeatPassword')).toHaveText('Passwords do not match');
    await expect(signupModal.repeatPasswordInput).toHaveClass(/is-invalid/);
    await expect(signupModal.registerButton).toBeDisabled();
  });

  test('keeps the Register button disabled until every field becomes valid', async () => {
    const data = validSignupData();

    await signupModal.fill({ name: data.name });
    await expect(signupModal.registerButton).toBeDisabled();

    await signupModal.fill({ lastName: data.lastName });
    await expect(signupModal.registerButton).toBeDisabled();

    await signupModal.fill({ email: data.email });
    await expect(signupModal.registerButton).toBeDisabled();

    await signupModal.fill({ password: data.password });
    await expect(signupModal.registerButton).toBeDisabled();

    await signupModal.fill({ repeatPassword: data.repeatPassword });
    await expect(signupModal.registerButton).toBeEnabled();
  });

  test('rejects registration with an email that is already taken', async ({ page }) => {
    const data = validSignupData();

    await signupModal.fillAndBlur(data);
    await signupModal.submit();
    await expect(page).toHaveURL(/\/panel\/garage/);

    await page.getByText('Log out', { exact: true }).click();
    await homePage.open();
    await homePage.openSignupModal();

    await signupModal.fillAndBlur(data);
    await signupModal.submit();

    await expect(signupModal.serverError).toHaveText('User already exists');
    await expect(page).not.toHaveURL(/\/panel\/garage/);
  });
});
