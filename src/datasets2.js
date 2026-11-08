// More free datasets for the Datasets library (/datasets).
// Reference data uses official codes (ISO 3166, ISO 4217, ISO 639-1, IATA, CSS).
// "Mock" data is made up, for testing and demos only.

export const COUNTRIES = [
  { name: 'Argentina', iso2: 'AR', iso3: 'ARG', capital: 'Buenos Aires', continent: 'South America', currency: 'ARS' },
  { name: 'Australia', iso2: 'AU', iso3: 'AUS', capital: 'Canberra', continent: 'Oceania', currency: 'AUD' },
  { name: 'Austria', iso2: 'AT', iso3: 'AUT', capital: 'Vienna', continent: 'Europe', currency: 'EUR' },
  { name: 'Bangladesh', iso2: 'BD', iso3: 'BGD', capital: 'Dhaka', continent: 'Asia', currency: 'BDT' },
  { name: 'Belgium', iso2: 'BE', iso3: 'BEL', capital: 'Brussels', continent: 'Europe', currency: 'EUR' },
  { name: 'Brazil', iso2: 'BR', iso3: 'BRA', capital: 'Brasília', continent: 'South America', currency: 'BRL' },
  { name: 'Canada', iso2: 'CA', iso3: 'CAN', capital: 'Ottawa', continent: 'North America', currency: 'CAD' },
  { name: 'Chile', iso2: 'CL', iso3: 'CHL', capital: 'Santiago', continent: 'South America', currency: 'CLP' },
  { name: 'China', iso2: 'CN', iso3: 'CHN', capital: 'Beijing', continent: 'Asia', currency: 'CNY' },
  { name: 'Colombia', iso2: 'CO', iso3: 'COL', capital: 'Bogotá', continent: 'South America', currency: 'COP' },
  { name: 'Denmark', iso2: 'DK', iso3: 'DNK', capital: 'Copenhagen', continent: 'Europe', currency: 'DKK' },
  { name: 'Egypt', iso2: 'EG', iso3: 'EGY', capital: 'Cairo', continent: 'Africa', currency: 'EGP' },
  { name: 'Finland', iso2: 'FI', iso3: 'FIN', capital: 'Helsinki', continent: 'Europe', currency: 'EUR' },
  { name: 'France', iso2: 'FR', iso3: 'FRA', capital: 'Paris', continent: 'Europe', currency: 'EUR' },
  { name: 'Germany', iso2: 'DE', iso3: 'DEU', capital: 'Berlin', continent: 'Europe', currency: 'EUR' },
  { name: 'Greece', iso2: 'GR', iso3: 'GRC', capital: 'Athens', continent: 'Europe', currency: 'EUR' },
  { name: 'India', iso2: 'IN', iso3: 'IND', capital: 'New Delhi', continent: 'Asia', currency: 'INR' },
  { name: 'Indonesia', iso2: 'ID', iso3: 'IDN', capital: 'Jakarta', continent: 'Asia', currency: 'IDR' },
  { name: 'Ireland', iso2: 'IE', iso3: 'IRL', capital: 'Dublin', continent: 'Europe', currency: 'EUR' },
  { name: 'Italy', iso2: 'IT', iso3: 'ITA', capital: 'Rome', continent: 'Europe', currency: 'EUR' },
  { name: 'Japan', iso2: 'JP', iso3: 'JPN', capital: 'Tokyo', continent: 'Asia', currency: 'JPY' },
  { name: 'Kenya', iso2: 'KE', iso3: 'KEN', capital: 'Nairobi', continent: 'Africa', currency: 'KES' },
  { name: 'Malaysia', iso2: 'MY', iso3: 'MYS', capital: 'Kuala Lumpur', continent: 'Asia', currency: 'MYR' },
  { name: 'Mexico', iso2: 'MX', iso3: 'MEX', capital: 'Mexico City', continent: 'North America', currency: 'MXN' },
  { name: 'Morocco', iso2: 'MA', iso3: 'MAR', capital: 'Rabat', continent: 'Africa', currency: 'MAD' },
  { name: 'Netherlands', iso2: 'NL', iso3: 'NLD', capital: 'Amsterdam', continent: 'Europe', currency: 'EUR' },
  { name: 'New Zealand', iso2: 'NZ', iso3: 'NZL', capital: 'Wellington', continent: 'Oceania', currency: 'NZD' },
  { name: 'Nigeria', iso2: 'NG', iso3: 'NGA', capital: 'Abuja', continent: 'Africa', currency: 'NGN' },
  { name: 'Norway', iso2: 'NO', iso3: 'NOR', capital: 'Oslo', continent: 'Europe', currency: 'NOK' },
  { name: 'Pakistan', iso2: 'PK', iso3: 'PAK', capital: 'Islamabad', continent: 'Asia', currency: 'PKR' },
  { name: 'Philippines', iso2: 'PH', iso3: 'PHL', capital: 'Manila', continent: 'Asia', currency: 'PHP' },
  { name: 'Poland', iso2: 'PL', iso3: 'POL', capital: 'Warsaw', continent: 'Europe', currency: 'PLN' },
  { name: 'Portugal', iso2: 'PT', iso3: 'PRT', capital: 'Lisbon', continent: 'Europe', currency: 'EUR' },
  { name: 'Qatar', iso2: 'QA', iso3: 'QAT', capital: 'Doha', continent: 'Asia', currency: 'QAR' },
  { name: 'Saudi Arabia', iso2: 'SA', iso3: 'SAU', capital: 'Riyadh', continent: 'Asia', currency: 'SAR' },
  { name: 'Singapore', iso2: 'SG', iso3: 'SGP', capital: 'Singapore', continent: 'Asia', currency: 'SGD' },
  { name: 'South Africa', iso2: 'ZA', iso3: 'ZAF', capital: 'Pretoria', continent: 'Africa', currency: 'ZAR' },
  { name: 'South Korea', iso2: 'KR', iso3: 'KOR', capital: 'Seoul', continent: 'Asia', currency: 'KRW' },
  { name: 'Spain', iso2: 'ES', iso3: 'ESP', capital: 'Madrid', continent: 'Europe', currency: 'EUR' },
  { name: 'Sweden', iso2: 'SE', iso3: 'SWE', capital: 'Stockholm', continent: 'Europe', currency: 'SEK' },
  { name: 'Switzerland', iso2: 'CH', iso3: 'CHE', capital: 'Bern', continent: 'Europe', currency: 'CHF' },
  { name: 'Thailand', iso2: 'TH', iso3: 'THA', capital: 'Bangkok', continent: 'Asia', currency: 'THB' },
  { name: 'Turkey', iso2: 'TR', iso3: 'TUR', capital: 'Ankara', continent: 'Asia', currency: 'TRY' },
  { name: 'Ukraine', iso2: 'UA', iso3: 'UKR', capital: 'Kyiv', continent: 'Europe', currency: 'UAH' },
  { name: 'United Arab Emirates', iso2: 'AE', iso3: 'ARE', capital: 'Abu Dhabi', continent: 'Asia', currency: 'AED' },
  { name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', capital: 'London', continent: 'Europe', currency: 'GBP' },
  { name: 'United States', iso2: 'US', iso3: 'USA', capital: 'Washington, D.C.', continent: 'North America', currency: 'USD' },
  { name: 'Vietnam', iso2: 'VN', iso3: 'VNM', capital: 'Hanoi', continent: 'Asia', currency: 'VND' },
]

export const US_STATES = [
  ['Alabama', 'AL', 'Montgomery'], ['Alaska', 'AK', 'Juneau'], ['Arizona', 'AZ', 'Phoenix'], ['Arkansas', 'AR', 'Little Rock'],
  ['California', 'CA', 'Sacramento'], ['Colorado', 'CO', 'Denver'], ['Connecticut', 'CT', 'Hartford'], ['Delaware', 'DE', 'Dover'],
  ['Florida', 'FL', 'Tallahassee'], ['Georgia', 'GA', 'Atlanta'], ['Hawaii', 'HI', 'Honolulu'], ['Idaho', 'ID', 'Boise'],
  ['Illinois', 'IL', 'Springfield'], ['Indiana', 'IN', 'Indianapolis'], ['Iowa', 'IA', 'Des Moines'], ['Kansas', 'KS', 'Topeka'],
  ['Kentucky', 'KY', 'Frankfort'], ['Louisiana', 'LA', 'Baton Rouge'], ['Maine', 'ME', 'Augusta'], ['Maryland', 'MD', 'Annapolis'],
  ['Massachusetts', 'MA', 'Boston'], ['Michigan', 'MI', 'Lansing'], ['Minnesota', 'MN', 'Saint Paul'], ['Mississippi', 'MS', 'Jackson'],
  ['Missouri', 'MO', 'Jefferson City'], ['Montana', 'MT', 'Helena'], ['Nebraska', 'NE', 'Lincoln'], ['Nevada', 'NV', 'Carson City'],
  ['New Hampshire', 'NH', 'Concord'], ['New Jersey', 'NJ', 'Trenton'], ['New Mexico', 'NM', 'Santa Fe'], ['New York', 'NY', 'Albany'],
  ['North Carolina', 'NC', 'Raleigh'], ['North Dakota', 'ND', 'Bismarck'], ['Ohio', 'OH', 'Columbus'], ['Oklahoma', 'OK', 'Oklahoma City'],
  ['Oregon', 'OR', 'Salem'], ['Pennsylvania', 'PA', 'Harrisburg'], ['Rhode Island', 'RI', 'Providence'], ['South Carolina', 'SC', 'Columbia'],
  ['South Dakota', 'SD', 'Pierre'], ['Tennessee', 'TN', 'Nashville'], ['Texas', 'TX', 'Austin'], ['Utah', 'UT', 'Salt Lake City'],
  ['Vermont', 'VT', 'Montpelier'], ['Virginia', 'VA', 'Richmond'], ['Washington', 'WA', 'Olympia'], ['West Virginia', 'WV', 'Charleston'],
  ['Wisconsin', 'WI', 'Madison'], ['Wyoming', 'WY', 'Cheyenne'],
].map(([name, code, capital]) => ({ name, code, capital }))

export const AIRPORTS = [
  ['ATL', 'Hartsfield-Jackson Atlanta International Airport', 'Atlanta', 'United States'],
  ['LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States'],
  ['JFK', 'John F. Kennedy International Airport', 'New York', 'United States'],
  ['ORD', "O'Hare International Airport", 'Chicago', 'United States'],
  ['DFW', 'Dallas Fort Worth International Airport', 'Dallas', 'United States'],
  ['YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada'],
  ['MEX', 'Mexico City International Airport', 'Mexico City', 'Mexico'],
  ['GRU', 'São Paulo/Guarulhos International Airport', 'São Paulo', 'Brazil'],
  ['LHR', 'Heathrow Airport', 'London', 'United Kingdom'],
  ['LGW', 'Gatwick Airport', 'London', 'United Kingdom'],
  ['CDG', 'Charles de Gaulle Airport', 'Paris', 'France'],
  ['AMS', 'Amsterdam Airport Schiphol', 'Amsterdam', 'Netherlands'],
  ['FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany'],
  ['MAD', 'Adolfo Suárez Madrid–Barajas Airport', 'Madrid', 'Spain'],
  ['FCO', 'Leonardo da Vinci–Fiumicino Airport', 'Rome', 'Italy'],
  ['IST', 'Istanbul Airport', 'Istanbul', 'Turkey'],
  ['DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates'],
  ['DOH', 'Hamad International Airport', 'Doha', 'Qatar'],
  ['JED', 'King Abdulaziz International Airport', 'Jeddah', 'Saudi Arabia'],
  ['KHI', 'Jinnah International Airport', 'Karachi', 'Pakistan'],
  ['LHE', 'Allama Iqbal International Airport', 'Lahore', 'Pakistan'],
  ['ISB', 'Islamabad International Airport', 'Islamabad', 'Pakistan'],
  ['DEL', 'Indira Gandhi International Airport', 'Delhi', 'India'],
  ['BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India'],
  ['SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore'],
  ['HKG', 'Hong Kong International Airport', 'Hong Kong', 'China'],
  ['PEK', 'Beijing Capital International Airport', 'Beijing', 'China'],
  ['HND', 'Haneda Airport', 'Tokyo', 'Japan'],
  ['ICN', 'Incheon International Airport', 'Seoul', 'South Korea'],
  ['SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia'],
].map(([iata, name, city, country]) => ({ iata, name, city, country }))

// CSS named colors (exact values from the CSS Color specification).
export const CSS_COLORS = [
  ['black', '#000000'], ['white', '#ffffff'], ['gray', '#808080'], ['silver', '#c0c0c0'], ['red', '#ff0000'],
  ['maroon', '#800000'], ['crimson', '#dc143c'], ['tomato', '#ff6347'], ['coral', '#ff7f50'], ['orange', '#ffa500'],
  ['darkorange', '#ff8c00'], ['gold', '#ffd700'], ['yellow', '#ffff00'], ['khaki', '#f0e68c'], ['olive', '#808000'],
  ['lime', '#00ff00'], ['green', '#008000'], ['forestgreen', '#228b22'], ['seagreen', '#2e8b57'], ['teal', '#008080'],
  ['cyan', '#00ffff'], ['turquoise', '#40e0d0'], ['skyblue', '#87ceeb'], ['dodgerblue', '#1e90ff'], ['blue', '#0000ff'],
  ['navy', '#000080'], ['royalblue', '#4169e1'], ['indigo', '#4b0082'], ['purple', '#800080'], ['violet', '#ee82ee'],
  ['magenta', '#ff00ff'], ['orchid', '#da70d6'], ['pink', '#ffc0cb'], ['hotpink', '#ff69b4'], ['brown', '#a52a2a'],
  ['chocolate', '#d2691e'], ['tan', '#d2b48c'], ['beige', '#f5f5dc'], ['ivory', '#fffff0'], ['lavender', '#e6e6fa'],
].map(([name, hex]) => ({
  name,
  hex,
  rgb: [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)],
}))

export const CURRENCIES = [
  ['USD', 'US Dollar', '$'], ['EUR', 'Euro', '€'], ['GBP', 'Pound Sterling', '£'], ['JPY', 'Japanese Yen', '¥'],
  ['CNY', 'Chinese Yuan Renminbi', '¥'], ['INR', 'Indian Rupee', '₹'], ['PKR', 'Pakistani Rupee', 'Rs'], ['AUD', 'Australian Dollar', '$'],
  ['CAD', 'Canadian Dollar', '$'], ['CHF', 'Swiss Franc', 'CHF'], ['SEK', 'Swedish Krona', 'kr'], ['NOK', 'Norwegian Krone', 'kr'],
  ['DKK', 'Danish Krone', 'kr'], ['NZD', 'New Zealand Dollar', '$'], ['SGD', 'Singapore Dollar', '$'], ['HKD', 'Hong Kong Dollar', '$'],
  ['KRW', 'South Korean Won', '₩'], ['BRL', 'Brazilian Real', 'R$'], ['MXN', 'Mexican Peso', '$'], ['ZAR', 'South African Rand', 'R'],
  ['AED', 'UAE Dirham', 'د.إ'], ['SAR', 'Saudi Riyal', '﷼'], ['TRY', 'Turkish Lira', '₺'], ['RUB', 'Russian Ruble', '₽'],
  ['PLN', 'Polish Zloty', 'zł'], ['THB', 'Thai Baht', '฿'], ['IDR', 'Indonesian Rupiah', 'Rp'], ['MYR', 'Malaysian Ringgit', 'RM'],
  ['PHP', 'Philippine Peso', '₱'], ['NGN', 'Nigerian Naira', '₦'], ['EGP', 'Egyptian Pound', 'E£'], ['BDT', 'Bangladeshi Taka', '৳'],
].map(([code, name, symbol]) => ({ code, name, symbol }))

export const LANGUAGES = [
  ['en', 'English', 'English'], ['es', 'Spanish', 'Español'], ['fr', 'French', 'Français'], ['de', 'German', 'Deutsch'],
  ['it', 'Italian', 'Italiano'], ['pt', 'Portuguese', 'Português'], ['nl', 'Dutch', 'Nederlands'], ['sv', 'Swedish', 'Svenska'],
  ['pl', 'Polish', 'Polski'], ['tr', 'Turkish', 'Türkçe'], ['ru', 'Russian', 'Русский'], ['uk', 'Ukrainian', 'Українська'],
  ['el', 'Greek', 'Ελληνικά'], ['ar', 'Arabic', 'العربية'], ['he', 'Hebrew', 'עברית'], ['fa', 'Persian', 'فارسی'],
  ['ur', 'Urdu', 'اردو'], ['hi', 'Hindi', 'हिन्दी'], ['bn', 'Bengali', 'বাংলা'], ['pa', 'Punjabi', 'ਪੰਜਾਬੀ'],
  ['ta', 'Tamil', 'தமிழ்'], ['zh', 'Chinese', '中文'], ['ja', 'Japanese', '日本語'], ['ko', 'Korean', '한국어'],
  ['th', 'Thai', 'ไทย'], ['vi', 'Vietnamese', 'Tiếng Việt'], ['id', 'Indonesian', 'Bahasa Indonesia'], ['ms', 'Malay', 'Bahasa Melayu'],
  ['sw', 'Swahili', 'Kiswahili'],
].map(([code, name, nativeName]) => ({ code, name, nativeName }))

// ---------- Configuration ----------
export const PRETTIER_CONFIG = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
}

export const ESLINTRC_CONFIG = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  rules: { 'no-unused-vars': 'warn', 'react/react-in-jsx-scope': 'off' },
}

export const VSCODE_SETTINGS = {
  'editor.formatOnSave': true,
  'editor.tabSize': 2,
  'editor.defaultFormatter': 'esbenp.prettier-vscode',
  'editor.codeActionsOnSave': { 'source.fixAll.eslint': 'explicit' },
  'files.eol': '\n',
  'files.trimTrailingWhitespace': true,
  'files.insertFinalNewline': true,
  '[json]': { 'editor.defaultFormatter': 'vscode.json-language-features' },
}

// ---------- API mocks (made-up sample data) ----------
const FIRST = ['Emily', 'James', 'Olivia', 'Harry', 'Amelia', 'Jack', 'Sophia', 'Oliver', 'Isla', 'George']
const LAST = ['Clark', 'Smith', 'Brown', 'Taylor', 'Wilson', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker']
const CITIES = ['London', 'Manchester', 'Bristol', 'Leeds', 'Liverpool', 'Edinburgh', 'Cardiff', 'Glasgow', 'Oxford', 'Cambridge']

export const MOCK_USERS = FIRST.map((first, i) => ({
  id: i + 1,
  firstName: first,
  lastName: LAST[i],
  email: `${first.toLowerCase()}.${LAST[i].toLowerCase()}@example.com`,
  age: 22 + ((i * 7) % 30),
  city: CITIES[i],
  role: i === 0 ? 'admin' : i % 3 === 0 ? 'editor' : 'user',
  active: i % 4 !== 3,
  createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String(((i * 3) % 27) + 1).padStart(2, '0')}T09:00:00Z`,
}))

export const MOCK_PRODUCTS = [
  ['Mechanical Keyboard', 'Electronics', 79.99, 34], ['Wireless Mouse', 'Electronics', 24.5, 120], ['USB-C Hub', 'Electronics', 39.0, 0],
  ['Desk Lamp', 'Home', 29.99, 58], ['Ergonomic Chair', 'Furniture', 249.0, 7], ['Notebook (A5)', 'Stationery', 4.99, 300],
  ['Water Bottle', 'Sports', 14.0, 85], ['Running Shoes', 'Sports', 89.95, 22], ['Coffee Mug', 'Home', 9.5, 140], ['Backpack', 'Travel', 54.0, 16],
].map(([name, category, price, stock], i) => ({
  id: `P-${1001 + i}`,
  name,
  category,
  price,
  currency: 'GBP',
  inStock: stock > 0,
  stock,
  rating: Math.round((3.6 + ((i * 0.37) % 1.4)) * 10) / 10,
}))

export const MOCK_ORDERS = [1, 2, 3, 4, 5].map((n) => {
  const items = MOCK_PRODUCTS.slice(n - 1, n + 1).map((p, i) => ({ productId: p.id, name: p.name, quantity: i + 1, price: p.price }))
  const total = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
  return {
    orderId: `A-${100 + n}`,
    userId: n,
    status: ['paid', 'shipped', 'delivered', 'cancelled', 'paid'][n - 1],
    items,
    total,
    currency: 'GBP',
    createdAt: `2026-0${n}-1${n}T14:30:00Z`,
  }
})

export const MOCK_TODOS = [
  'Write the project README', 'Fix the login bug', 'Review pull request #42', 'Update dependencies', 'Plan the next sprint',
  'Add dark mode', 'Write unit tests', 'Back up the database', 'Reply to customer emails', 'Prepare the demo',
].map((title, i) => ({ id: i + 1, userId: (i % 3) + 1, title, completed: i % 3 === 0 }))

export const MOCK_POSTS = [
  ['Getting started with JSON', 'JSON is a simple text format for storing and sharing data.'],
  ['Five common JSON mistakes', 'Trailing commas, single quotes and comments are the usual suspects.'],
  ['JSON vs YAML for config files', 'Both store the same data, but YAML is easier for people to edit.'],
  ['How to validate an API response', 'A JSON Schema describes exactly what a valid response looks like.'],
  ['Working with large JSON files', 'Stream big files instead of loading everything into memory.'],
].map(([title, body], i) => ({
  id: i + 1,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  body,
  author: `${FIRST[i]} ${LAST[i]}`,
  tags: ['json', ['basics', 'errors', 'yaml', 'schema', 'performance'][i]],
  published: i !== 4,
}))

// ---------- Testing ----------
export const TEST_ALL_TYPES = {
  string: 'Hello, World',
  emptyString: '',
  unicode: 'Café ✓ 東京 😊',
  escaped: 'Line 1\nLine 2\t"quoted" \\ backslash',
  integer: 42,
  negative: -17,
  float: 3.14159,
  exponent: 6.02e23,
  zero: 0,
  booleanTrue: true,
  booleanFalse: false,
  nullValue: null,
  emptyObject: {},
  emptyArray: [],
  mixedArray: [1, 'two', true, null, { three: 3 }, [4]],
  nested: { level1: { level2: { level3: 'deep' } } },
}

export const TEST_DEEP_NESTING = (() => {
  let value = { value: 'bottom', depth: 10 }
  for (let depth = 9; depth >= 1; depth--) value = { depth, child: value }
  return value
})()
