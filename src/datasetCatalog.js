// Every dataset shown in the Datasets library (/datasets).
// "page" links to a dataset's own page with an explanation, when it has one.
import { HTTP_STATUS_CODES, PROGRAMMING_LANGUAGES, FILE_EXTENSIONS, PACKAGE_JSON_TEMPLATE, TSCONFIG_TEMPLATE } from './datasets.js'
import {
  COUNTRIES, US_STATES, AIRPORTS, CSS_COLORS, CURRENCIES, LANGUAGES, PRETTIER_CONFIG, ESLINTRC_CONFIG, VSCODE_SETTINGS,
  MOCK_USERS, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_TODOS, MOCK_POSTS, TEST_ALL_TYPES, TEST_DEEP_NESTING,
} from './datasets2.js'

export const DATASET_CATEGORIES = ['Geographic', 'Reference', 'Configuration', 'API Mocks', 'Testing']

export const DATASET_CATALOG = [
  { id: 'countries', title: 'Countries', category: 'Geographic', fileName: 'countries.json', data: COUNTRIES, description: 'Countries with ISO 3166 two- and three-letter codes, capitals, continents and currency codes.' },
  { id: 'us-states', title: 'US States', category: 'Geographic', fileName: 'us-states.json', data: US_STATES, description: 'All 50 US states with their two-letter postal codes and capital cities.' },
  { id: 'airports', title: 'World Airports', category: 'Geographic', fileName: 'airports.json', data: AIRPORTS, description: 'Major international airports with IATA codes, full names, cities and countries.' },
  { id: 'http-status-codes', title: 'HTTP Status Codes', category: 'Reference', fileName: 'http-status-codes.json', data: HTTP_STATUS_CODES, page: '/http-status-codes-json', description: 'Every standard HTTP status code with its name, category and a plain-English meaning.' },
  { id: 'programming-languages', title: 'Programming Languages', category: 'Reference', fileName: 'programming-languages.json', data: PROGRAMMING_LANGUAGES, page: '/programming-languages-json', description: 'Popular languages with the year they first appeared, creators, typing and file extensions.' },
  { id: 'file-extensions', title: 'File Extensions & MIME Types', category: 'Reference', fileName: 'file-extensions-mime-types.json', data: FILE_EXTENSIONS, page: '/file-extensions-json', description: 'Common file extensions with their MIME types (content types) and categories.' },
  { id: 'css-colors', title: 'CSS Colors', category: 'Reference', fileName: 'css-colors.json', data: CSS_COLORS, description: 'Common CSS named colors with exact hex codes and RGB values.' },
  { id: 'currencies', title: 'Currencies', category: 'Reference', fileName: 'currencies.json', data: CURRENCIES, description: 'World currencies with ISO 4217 codes, names and symbols.' },
  { id: 'languages', title: 'Languages', category: 'Reference', fileName: 'languages.json', data: LANGUAGES, description: 'Languages with ISO 639-1 codes, English names and native names.' },
  { id: 'package-json', title: 'package.json Template', category: 'Configuration', fileName: 'package.json', data: PACKAGE_JSON_TEMPLATE, page: '/package-json-template', description: 'A modern package.json for Node.js projects, with scripts, exports and engines.' },
  { id: 'tsconfig', title: 'tsconfig.json Template', category: 'Configuration', fileName: 'tsconfig.json', data: TSCONFIG_TEMPLATE, page: '/tsconfig-json-template', description: 'Recommended strict TypeScript compiler settings for Node.js projects.' },
  { id: 'prettier', title: 'Prettier Config', category: 'Configuration', fileName: '.prettierrc.json', data: PRETTIER_CONFIG, description: 'A popular .prettierrc setup: no semicolons, single quotes, 100-character lines.' },
  { id: 'eslintrc', title: 'ESLint Config (.eslintrc.json)', category: 'Configuration', fileName: '.eslintrc.json', data: ESLINTRC_CONFIG, description: 'A legacy-format ESLint config for React projects. Newer ESLint versions use eslint.config.js instead.' },
  { id: 'vscode-settings', title: 'VS Code Settings', category: 'Configuration', fileName: 'settings.json', data: VSCODE_SETTINGS, description: 'Workspace settings for VS Code: format on save, Prettier, ESLint fixes and clean line endings.' },
  { id: 'mock-users', title: 'Mock Users', category: 'API Mocks', fileName: 'users.json', data: MOCK_USERS, description: 'Ten made-up users with names, emails, ages, cities, roles and timestamps for testing.' },
  { id: 'mock-products', title: 'Mock Products', category: 'API Mocks', fileName: 'products.json', data: MOCK_PRODUCTS, description: 'Ten made-up shop products with prices, stock levels, categories and ratings.' },
  { id: 'mock-orders', title: 'Mock Orders', category: 'API Mocks', fileName: 'orders.json', data: MOCK_ORDERS, description: 'Made-up orders with nested line items, totals and statuses, for testing nested data.' },
  { id: 'mock-todos', title: 'Mock Todos', category: 'API Mocks', fileName: 'todos.json', data: MOCK_TODOS, description: 'A simple made-up todo list with users and completed flags, ideal for tutorials.' },
  { id: 'mock-posts', title: 'Mock Blog Posts', category: 'API Mocks', fileName: 'posts.json', data: MOCK_POSTS, description: 'Made-up blog posts with slugs, authors, tags and published flags.' },
  { id: 'all-types', title: 'All JSON Data Types', category: 'Testing', fileName: 'all-types.json', data: TEST_ALL_TYPES, description: 'One object with every JSON type and edge case: unicode, escapes, empty values and nesting.' },
  { id: 'deep-nesting', title: 'Deeply Nested JSON', category: 'Testing', fileName: 'deep-nesting.json', data: TEST_DEEP_NESTING, description: 'An object nested ten levels deep, for testing parsers, viewers and recursion.' },
]
