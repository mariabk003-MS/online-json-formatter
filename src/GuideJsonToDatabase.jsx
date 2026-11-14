import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonToDatabase() {
  return (
    <ArticlePage
      h1="How to Import JSON into a Database (MySQL, PostgreSQL, SQLite)"
      intro="Three ways to get a JSON file into a SQL table: generate INSERT statements, let the database read the JSON itself, or load it with a short script. Copy-ready examples for MySQL, PostgreSQL and SQLite."
      updated="November 14, 2026"
      faqKey="import-json-into-database"
      related={[
        ['/json-to-sql', 'JSON to SQL'],
        ['/sql-to-json', 'SQL to JSON'],
        ['/json-to-csv-python', 'JSON to CSV in Python'],
        ['/json-validator', 'JSON Validator'],
      ]}
    >
      <h2>The Example Data</h2>
      <p>All examples load this JSON array into a <code>users</code> table:</p>
      <Code label="users.json">{`[
  { "id": 1, "name": "Emily Clark", "city": "London" },
  { "id": 2, "name": "James Smith", "city": "Leeds" }
]`}</Code>
      <Code label="Table">{`CREATE TABLE users (
  id   INTEGER PRIMARY KEY,
  name VARCHAR(100),
  city VARCHAR(100)
);`}</Code>

      <h2>Method 1: Generate INSERT Statements (Any Database)</h2>
      <p>
        The quickest way for a one-off import is to turn the JSON into plain
        SQL. Paste it into the <a href="/json-to-sql">JSON to SQL</a> converter, pick
        MySQL, PostgreSQL, SQLite or SQL Server, and run the result:
      </p>
      <Code label="SQL">{`INSERT INTO "users" ("id", "name", "city") VALUES
  (1, 'Emily Clark', 'London'),
  (2, 'James Smith', 'Leeds');`}</Code>
      <p>
        It can also write the <code>CREATE TABLE</code> statement for you, with
        column types picked from your data. Good for test data, seed files and
        small exports.
      </p>

      <h2>Method 2: Let the Database Read the JSON</h2>
      <p>
        Modern databases understand JSON themselves, so you can insert straight
        from a JSON string without converting it first.
      </p>

      <h3>PostgreSQL</h3>
      <Code label="PostgreSQL">{`INSERT INTO users (id, name, city)
SELECT id, name, city
FROM json_populate_recordset(NULL::users,
  '[{"id":1,"name":"Emily Clark","city":"London"},
    {"id":2,"name":"James Smith","city":"Leeds"}]');`}</Code>
      <p>
        <code>json_populate_recordset</code> matches the JSON keys to the table&apos;s
        column names, so the keys must be spelled the same way.
      </p>

      <h3>MySQL 8</h3>
      <Code label="MySQL">{`SET @json = '[{"id":1,"name":"Emily Clark","city":"London"},
              {"id":2,"name":"James Smith","city":"Leeds"}]';

INSERT INTO users (id, name, city)
SELECT jt.id, jt.name, jt.city
FROM JSON_TABLE(@json, '$[*]' COLUMNS (
  id   INT          PATH '$.id',
  name VARCHAR(100) PATH '$.name',
  city VARCHAR(100) PATH '$.city'
)) AS jt;`}</Code>
      <p><code>JSON_TABLE</code> needs MySQL 8.0 or newer.</p>

      <h3>SQLite</h3>
      <Code label="SQLite">{`INSERT INTO users (id, name, city)
SELECT json_extract(value, '$.id'),
       json_extract(value, '$.name'),
       json_extract(value, '$.city')
FROM json_each('[{"id":1,"name":"Emily Clark","city":"London"},
                 {"id":2,"name":"James Smith","city":"Leeds"}]');`}</Code>
      <p>
        <code>json_each</code> turns every item of the array into a row, and
        <code> json_extract</code> picks a field out of it.
      </p>

      <h2>Method 3: Load It with a Script</h2>
      <p>
        For files you import regularly, a few lines of Python are the most
        reliable choice. This example uses SQLite, which is built into Python;
        the same pattern works with MySQL or PostgreSQL drivers.
      </p>
      <Code label="Python">{`import json, sqlite3

with open("users.json", encoding="utf-8") as f:
    rows = json.load(f)

con = sqlite3.connect("app.db")
con.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, city TEXT)")
con.executemany("INSERT INTO users (id, name, city) VALUES (:id, :name, :city)", rows)
con.commit()`}</Code>
      <p>
        The <code>:id</code>, <code>:name</code> and <code>:city</code> placeholders
        let the driver escape every value safely, so quotes in names like
        O&apos;Neil never break the query.
      </p>

      <h2>Or Store the Whole JSON in One Column</h2>
      <p>
        If the data has no fixed shape, keep it as JSON and query it later.
        PostgreSQL&apos;s <code>jsonb</code> type is the best choice for this:
      </p>
      <Code label="PostgreSQL">{`CREATE TABLE events (id serial PRIMARY KEY, data jsonb);

INSERT INTO events (data) VALUES ('{"type": "signup", "user": {"city": "London"}}');

SELECT data->'user'->>'city' AS city FROM events;   -- London`}</Code>
      <p>
        MySQL has a <code>JSON</code> column type, and SQLite stores JSON as text
        that its JSON functions can read.
      </p>

      <h2>Tips</h2>
      <ul>
        <li><strong>Validate first.</strong> One trailing comma stops the whole import. Check the file with the <a href="/json-validator">JSON Validator</a>, or fix it with <a href="/json-repair">JSON Repair</a>.</li>
        <li><strong>Flatten nested objects</strong> into columns like <code>address_city</code>, or keep them in a JSON column.</li>
        <li><strong>Use a transaction</strong> for big files, so a failed row does not leave half the data imported.</li>
        <li><strong>Never build SQL by gluing strings together</strong> from user data; use placeholders as shown above.</li>
        <li>Need the opposite? Turn INSERT statements back into JSON with <a href="/sql-to-json">SQL to JSON</a>.</li>
      </ul>
    </ArticlePage>
  )
}

export default GuideJsonToDatabase
