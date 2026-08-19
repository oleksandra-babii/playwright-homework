/** All emails created by these tests share this prefix so real users are never mixed up with autotest accounts. */
const AUTOTEST_EMAIL_PREFIX = 'autotest';

export function uniqueAutotestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${AUTOTEST_EMAIL_PREFIX}_${timestamp}_${random}@test.com`;
}

export function validSignupData(email = uniqueAutotestEmail()) {
  const password = 'ValidPass1';
  return {
    name: 'Oleksandra',
    lastName: 'Tester',
    email,
    password,
    repeatPassword: password,
  };
}
