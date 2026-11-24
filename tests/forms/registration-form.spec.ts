import {
  INVALID_REGISTRATION_DATA,
  REGISTRATION_MESSAGES,
  buildValidRegistrationUser,
} from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';

test.describe('Formulário de Cadastro — Registration Form', () => {
  test(
    'FRM-E2E-01: deve limpar o formulário no reset e cadastrar usuário com dados válidos',
    { tag: ['@smoke', '@forms', '@mobile'] },
    async ({ registrationFormPage: form }) => {
      await form.openSection();

      await test.step('Preencher, aplicar reset e validar que todos os campos voltam ao estado inicial', async () => {
        await form.fillForm(buildValidRegistrationUser());
        await expect(form.charCount).not.toHaveText('0/200');

        await form.reset();

        await expect(form.fullNameInput).toHaveValue('');
        await expect(form.emailInput).toHaveValue('');
        await expect(form.passwordInput).toHaveValue('');
        await expect(form.countrySelect).toHaveValue('');
        await expect(form.bioTextarea).toHaveValue('');
        await expect(form.termsCheckbox).not.toBeChecked();
        await expect(form.charCount).toHaveText('0/200');
      });

      await test.step('Submeter dados válidos gerados pela factory e validar a confirmação', async () => {
        const user = buildValidRegistrationUser();
        await form.fillForm(user);
        await expect(form.charCount).toHaveText(`${user.bio!.length}/200`);

        await form.submit();

        await expect(form.successBanner).toBeVisible();
        await expect(form.successBanner).toHaveText(REGISTRATION_MESSAGES.success);
        // Após o sucesso o PlayLab substitui o formulário pela mensagem de confirmação.
        await expect(form.form).toBeHidden();
        await attachEvidence('cadastro-sucesso', form.successBanner);
      });
    },
  );

  test(
    'FRM-NEG-01: deve bloquear a submissão e exibir mensagens específicas para dados inválidos',
    { tag: ['@forms', '@negative'] },
    async ({ registrationFormPage: form }) => {
      await form.openSection();

      await test.step('Submeter o formulário vazio e validar mensagens dos campos obrigatórios', async () => {
        await form.submit();

        await expect(form.fullNameError).toHaveText(REGISTRATION_MESSAGES.fullNameRequired);
        await expect(form.emailError).toHaveText(REGISTRATION_MESSAGES.invalidEmail);
        await expect(form.passwordError).toHaveText(REGISTRATION_MESSAGES.shortPassword);
        await expect(form.termsError).toHaveText(REGISTRATION_MESSAGES.termsRequired);
        await expect(form.successBanner).toBeHidden();
      });

      await test.step('Corrigir apenas o nome e manter e-mail e senha inválidos', async () => {
        await form.fillForm(
          buildValidRegistrationUser({
            email: INVALID_REGISTRATION_DATA.malformedEmail,
            password: INVALID_REGISTRATION_DATA.shortPassword,
            acceptTerms: false,
          }),
        );
        await form.submit();

        // O erro do campo corrigido some; os demais continuam bloqueando a submissão.
        await expect(form.fullNameError).toBeEmpty();
        await expect(form.emailError).toHaveText(REGISTRATION_MESSAGES.invalidEmail);
        await expect(form.passwordError).toHaveText(REGISTRATION_MESSAGES.shortPassword);
        await expect(form.termsError).toHaveText(REGISTRATION_MESSAGES.termsRequired);
        await expect(form.successBanner).toBeHidden();
        await expect(form.form).toBeVisible();
        await attachEvidence('mensagens-de-validacao', form.form);
      });
    },
  );
});
