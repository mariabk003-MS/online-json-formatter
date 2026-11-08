// The five Datasets pages. Each shows free JSON data with Copy / Download.
import { DatasetPage } from './ArticlePage.jsx'
import {
  HTTP_STATUS_CODES,
  PROGRAMMING_LANGUAGES,
  FILE_EXTENSIONS,
  PACKAGE_JSON_TEMPLATE,
  TSCONFIG_TEMPLATE,
} from './datasets.js'

export function HttpStatusCodesPage() {
  const groups = ['Informational', 'Success', 'Redirection', 'Client Error', 'Server Error']
  return (
    <DatasetPage
      h1="HTTP Status Codes List in JSON"
      intro={`All ${HTTP_STATUS_CODES.length} standard HTTP status codes with their names, categories and plain-English meanings, as free JSON to copy or download.`}
      data={HTTP_STATUS_CODES}
      fileName="http-status-codes.json"
      faqKey="http-status-codes-json"
      related={[
        ['/json-to-csv', 'Turn this list into CSV'],
        ['/json-to-typescript', 'Generate TypeScript types'],
        ['/json-path', 'Query it with JSONPath'],
        ['/programming-languages-json', 'Programming languages JSON'],
      ]}
    >
      <h2>What the Status Code Groups Mean</h2>
      <ul>
        <li><strong>1xx Informational</strong>: the request was received and is still being processed.</li>
        <li><strong>2xx Success</strong>: the request worked.</li>
        <li><strong>3xx Redirection</strong>: the client must go to another URL.</li>
        <li><strong>4xx Client Error</strong>: something is wrong with the request.</li>
        <li><strong>5xx Server Error</strong>: the server failed to handle a valid request.</li>
      </ul>
      {groups.map((group) => (
        <div key={group}>
          <h3>{group}</h3>
          <table>
            <thead>
              <tr><th>Code</th><th>Name</th><th>Meaning</th></tr>
            </thead>
            <tbody>
              {HTTP_STATUS_CODES.filter((s) => s.category === group).map((s) => (
                <tr key={s.code}><td>{s.code}</td><td>{s.name}</td><td>{s.description}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </DatasetPage>
  )
}

export function ProgrammingLanguagesPage() {
  return (
    <DatasetPage
      h1="Programming Languages List in JSON"
      intro={`${PROGRAMMING_LANGUAGES.length} popular programming languages with the year they first appeared, their creators, typing and file extensions, as free JSON.`}
      data={PROGRAMMING_LANGUAGES}
      fileName="programming-languages.json"
      faqKey="programming-languages-json"
      related={[
        ['/file-extensions-json', 'File extensions & MIME types JSON'],
        ['/json-to-excel', 'Download as Excel'],
        ['/json-sorter', 'Sort the JSON'],
        ['/http-status-codes-json', 'HTTP status codes JSON'],
      ]}
    >
      <h2>About This Dataset</h2>
      <p>
        Use this list for dropdown menus, test data, quizzes, charts or demos.
        Each item has <code>name</code>, <code>firstAppeared</code> (year),
        <code> createdBy</code>, <code>typing</code> (static or dynamic) and
        <code> extensions</code>.
      </p>
      <table>
        <thead>
          <tr><th>Language</th><th>First appeared</th><th>Created by</th><th>Typing</th></tr>
        </thead>
        <tbody>
          {[...PROGRAMMING_LANGUAGES]
            .sort((a, b) => a.firstAppeared - b.firstAppeared)
            .map((lang) => (
              <tr key={lang.name}>
                <td>{lang.name}</td>
                <td>{lang.firstAppeared}</td>
                <td>{lang.createdBy}</td>
                <td>{lang.typing}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </DatasetPage>
  )
}

export function FileExtensionsPage() {
  return (
    <DatasetPage
      h1="File Extensions and MIME Types List (JSON)"
      intro={`${FILE_EXTENSIONS.length} common file extensions with their MIME types (content types) and categories, as free JSON for servers, uploads and downloads.`}
      data={FILE_EXTENSIONS}
      fileName="file-extensions-mime-types.json"
      faqKey="file-extensions-json"
      related={[
        ['/programming-languages-json', 'Programming languages JSON'],
        ['/json-to-csv', 'Convert to CSV'],
        ['/json-path', 'Query with JSONPath'],
        ['/how-to-open-json-file', 'How to open a JSON file'],
      ]}
    >
      <h2>How to Use This List</h2>
      <p>
        Servers send a MIME type in the <code>Content-Type</code> header so the
        browser knows how to handle a file. Use this list to set the right type
        for downloads, check uploads or build a file picker.
      </p>
      <table>
        <thead>
          <tr><th>Extension</th><th>MIME type</th><th>Description</th></tr>
        </thead>
        <tbody>
          {FILE_EXTENSIONS.map((item) => (
            <tr key={item.extension}>
              <td>{item.extension}</td>
              <td><code>{item.mimeType}</code></td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DatasetPage>
  )
}

const PACKAGE_FIELDS = [
  ['name', 'The package name. Lowercase, no spaces; must be unique if you publish to npm.'],
  ['version', 'The version, using semantic versioning: MAJOR.MINOR.PATCH.'],
  ['description, keywords', 'Help people find the package on npm.'],
  ['homepage, bugs, repository', 'Links to the project website, issue tracker and source code.'],
  ['license', 'The license, for example MIT or Apache-2.0.'],
  ['type', '"module" lets you use import/export in .js files; leave it out for CommonJS (require).'],
  ['main, types, exports', 'Which files other projects load when they import your package.'],
  ['files', 'Which files are included when you publish to npm.'],
  ['engines', 'Which Node.js versions the project supports.'],
  ['scripts', 'Commands you run with npm run, like npm run build or npm test.'],
  ['dependencies', 'Packages needed to run the project.'],
  ['devDependencies', 'Packages only needed while developing, such as linters and test tools.'],
]

export function PackageJsonPage() {
  return (
    <DatasetPage
      h1="package.json Template and Example"
      intro="A clean, modern package.json template for Node.js and JavaScript projects, with every field explained in plain English. Copy it or download it."
      data={PACKAGE_JSON_TEMPLATE}
      fileName="package.json"
      faqKey="package-json-template"
      related={[
        ['/tsconfig-json-template', 'tsconfig.json template'],
        ['/json-validator', 'Validate your package.json'],
        ['/json-comments', 'Can JSON have comments?'],
        ['/', 'JSON Formatter'],
      ]}
    >
      <h2>What Each Field Means</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>What it is for</th></tr>
        </thead>
        <tbody>
          {PACKAGE_FIELDS.map(([field, text]) => (
            <tr key={field}><td><code>{field}</code></td><td>{text}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Tips</h2>
      <ul>
        <li>Run <code>npm init -y</code> to create a basic package.json, then copy the fields you need from this template.</li>
        <li>Add packages with <code>npm install name</code> or <code>npm install -D name</code> instead of editing versions by hand.</li>
        <li>package.json must be valid JSON: no comments and no trailing commas. Check it with our <a href="/json-validator">JSON Validator</a>.</li>
      </ul>
    </DatasetPage>
  )
}

const TSCONFIG_OPTIONS = [
  ['target', 'The JavaScript version to output. ES2022 works in Node.js 18+ and modern browsers.'],
  ['module, moduleResolution', 'NodeNext follows how Node.js loads ES modules and CommonJS. For a Vite or webpack app, use "ESNext" and "Bundler".'],
  ['lib', 'Which built-in type definitions are available. Add "DOM" for browser code.'],
  ['outDir, rootDir', 'Where the compiled files go, and where your source files are.'],
  ['strict', 'Turns on all strict type checks. Strongly recommended.'],
  ['esModuleInterop', 'Makes importing CommonJS packages with import work smoothly.'],
  ['skipLibCheck', 'Skips type checking of .d.ts files in node_modules, for faster builds.'],
  ['forceConsistentCasingInFileNames', 'Catches imports that differ only in upper/lower case.'],
  ['resolveJsonModule', 'Lets you import .json files.'],
  ['declaration, sourceMap', 'Writes .d.ts type files and source maps for debugging.'],
  ['noUncheckedIndexedAccess', 'Treats array and object lookups as possibly undefined, which prevents many bugs.'],
  ['include, exclude', 'Which folders TypeScript checks and which it ignores.'],
]

export function TsconfigPage() {
  return (
    <DatasetPage
      h1="tsconfig.json Template and Recommended Settings"
      intro="A recommended tsconfig.json for modern TypeScript projects on Node.js, with every option explained. Copy it or download it."
      data={TSCONFIG_TEMPLATE}
      fileName="tsconfig.json"
      faqKey="tsconfig-json-template"
      related={[
        ['/package-json-template', 'package.json template'],
        ['/json-to-typescript', 'JSON to TypeScript'],
        ['/json-comments', 'JSON comments and JSONC'],
        ['/', 'JSON Formatter'],
      ]}
    >
      <h2>What Each Option Does</h2>
      <table>
        <thead>
          <tr><th>Option</th><th>What it does</th></tr>
        </thead>
        <tbody>
          {TSCONFIG_OPTIONS.map(([option, text]) => (
            <tr key={option}><td><code>{option}</code></td><td>{text}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Tips</h2>
      <ul>
        <li>Run <code>npx tsc --init</code> to create a tsconfig.json with every option listed as a comment.</li>
        <li>Check the compiled settings with <code>npx tsc --showConfig</code>.</li>
        <li>
          tsconfig.json may contain comments (it is read as JSONC), but plain JSON
          like this template works with every tool. Read more in our{' '}
          <a href="/json-comments">JSON comments guide</a>.
        </li>
      </ul>
    </DatasetPage>
  )
}
