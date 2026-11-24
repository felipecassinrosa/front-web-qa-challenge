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

/** Mensagens de validação exibidas pelo Registration Form (validação JS customizada, form com `novalidate`). */
export const REGISTRATION_MESSAGES = {
  success: 'Registration successful! Welcome aboard.',
  fullNameRequired: 'Name is required',
  invalidEmail: 'Valid email is required',
  shortPassword: 'Password must be at least 8 characters',
  termsRequired: 'You must accept the terms',
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
  firstUserAlphabetically: 'Alice Johnson',
  lastUserAlphabetically: 'Oscar Wilde',
  maxRowsPerPage: 15,
  nonExistentQuery: 'UsuarioInexistenteQa999',
};

export const DELAYED_DROPDOWN_SEED = {
  placeholderBeforeLoad: 'Click button to load...',
  loadingText: 'Loading options...',
  expectedCategories: ['Electronics', 'Clothing', 'Books', 'Sports & Outdoors', 'Home & Garden'],
  categoryToSelect: 'Books',
};

/**
 * Regras de negócio estáveis da Dynamic Table: a ordem de colunas/linhas e os valores numéricos
 * são aleatórios a cada carga, mas a relação fruta → cor/estação e as faixas numéricas são fixas.
 */
export const DYNAMIC_FRUIT_TABLE_RULES = {
  expectedColumns: ['Fruit', 'Color', 'Weight (g)', 'Price (₹/kg)', 'Season', 'Stock'],
  fruits: {
    Mango: { color: 'Yellow', season: 'Summer' },
    Apple: { color: 'Red', season: 'Winter' },
    Banana: { color: 'Green', season: 'All Year' },
    Grapes: { color: 'Purple', season: 'Monsoon' },
    Orange: { color: 'Orange', season: 'Winter' },
  } as Record<string, { color: string; season: string }>,
  ranges: {
    weight: { min: 50, max: 900 },
    price: { min: 40, max: 500 },
    stock: { min: 0, max: 200 },
  },
};
