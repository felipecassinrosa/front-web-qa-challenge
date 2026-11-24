import { Locator, Page } from '@playwright/test';
import { RegistrationUserData } from '@data/userData.factory';
import { BasePage } from './BasePage';

export class RegistrationFormPage extends BasePage {
  readonly form: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly dobInput: Locator;
  readonly countrySelect: Locator;
  readonly bioTextarea: Locator;
  readonly charCount: Locator;
  readonly termsCheckbox: Locator;
  readonly registerButton: Locator;
  readonly resetButton: Locator;
  readonly successBanner: Locator;

  readonly fullNameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly termsError: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByTestId('registration-form');
    this.fullNameInput = this.form.getByLabel(/Full Name/i);
    this.emailInput = this.form.getByLabel(/Email Address/i);
    this.passwordInput = this.form.getByLabel(/Password/i);
    this.phoneInput = this.form.getByLabel(/Phone Number/i);
    this.dobInput = this.form.getByLabel(/Date of Birth/i);
    this.countrySelect = this.form.getByLabel(/Country/i);
    this.bioTextarea = this.form.getByLabel(/Bio/i);
    this.charCount = this.form.getByTestId('char-count');
    this.termsCheckbox = this.form.getByTestId('check-terms');
    this.registerButton = this.form.getByRole('button', { name: 'Register', exact: true });
    this.resetButton = this.form.getByRole('button', { name: 'Reset', exact: true });
    this.successBanner = page.getByTestId('form-success');

    this.fullNameError = this.form.getByTestId('error-fullname');
    this.emailError = this.form.getByTestId('error-email');
    this.passwordError = this.form.getByTestId('error-password');
    this.termsError = this.form.getByTestId('error-terms');
  }

  async openSection(): Promise<void> {
    await this.gotoHome();
    await this.scrollToSection('forms');
  }

  async fillForm(data: RegistrationUserData): Promise<void> {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);

    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    if (data.dob) {
      await this.dobInput.fill(data.dob);
    }
    if (data.country) {
      await this.countrySelect.selectOption({ label: data.country });
    }
    if (data.bio) {
      await this.bioTextarea.fill(data.bio);
    }
    if (data.acceptTerms) {
      await this.termsCheckbox.check();
    }
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }
}
