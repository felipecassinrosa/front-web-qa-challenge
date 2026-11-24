export interface RegistrationUserData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  country?: string;
  bio?: string;
  acceptTerms: boolean;
}

let userSequence = 0;

/**
 * Gera massa de dados fictícia, isolada e segura para o Registration Form.
 */
export function buildValidRegistrationUser(
  overrides: Partial<RegistrationUserData> = {},
): RegistrationUserData {
  userSequence += 1;
  const uniqueTag = `${Date.now()}-${userSequence}`;

  return {
    fullName: `Marina QA ${userSequence}`,
    email: `marina.qa.${uniqueTag}@example.com`,
    password: `QaPlayLab!${userSequence}234`,
    phone: '+55 11 99999-0000',
    dob: '1994-05-15',
    country: 'Brazil',
    bio: 'QA Engineer validating registration flows with controlled test data.',
    acceptTerms: true,
    ...overrides,
  };
}

export const INVALID_REGISTRATION_DATA = {
  malformedEmail: 'email-invalido-sem-dominio',
  shortPassword: '123',
};

export const USERS_TABLE_SEED = {
  initialTotalEntries: 15,
  defaultRowsPerPage: 5,
  expectedHeaders: ['ID', 'Name', 'Email', 'Role', 'Status', 'Actions'],
  existingUser: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    status: 'active',
  },
  pageTwoFirstUser: 'Fiona Apple',
  nonExistentQuery: 'UsuarioInexistenteQa999',
};
