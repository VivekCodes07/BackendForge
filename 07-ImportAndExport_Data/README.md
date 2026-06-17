# 📦 MongoDB Import & Export (My Learning Notes)

> These are my personal notes while learning MongoDB Import and Export.
>
> Goal:
>
> * Understand **why** import/export exists
> * Learn the commands used in real projects
> * Know common mistakes and how to fix them
> * Be able to migrate, backup, restore, and share MongoDB data confidently

---

# 🤔 Why Do We Need Import & Export?

Imagine I'm working on an E-Commerce application.

My MongoDB database contains:

```text
ecommerce
│
├── users
├── products
├── orders
└── payments
```

In real projects, data doesn't always originate inside MongoDB.

Sometimes data comes from:

* Excel files
* CSV files
* JSON files
* Another database
* Third-party APIs

So we need a way to:

### Import

Bring external data into MongoDB.

```text
JSON / CSV
     ↓
 mongoimport
     ↓
 MongoDB
```

### Export

Take data out of MongoDB.

```text
MongoDB
   ↓
mongoexport
   ↓
JSON / CSV
```

---

# 🌎 Real-World Use Cases

## Scenario 1: Product Migration

Business team sends:

```csv
id,name,price
1,iPhone 16,90000
2,Samsung S26,85000
3,Pixel 10,80000
```

Developer imports it into MongoDB.

---

## Scenario 2: Backup Before Deployment

Before deploying a new feature:

```text
MongoDB
   ↓
mongoexport
   ↓
backup.json
```

If deployment breaks something:

```text
backup.json
   ↓
mongoimport
   ↓
MongoDB Restored
```

---

## Scenario 3: Sharing Data

Manager asks:

> "Send me all active users in Excel."

Developer exports data to CSV.

---

# 📥 Importing Data

Import means:

> File → MongoDB

---

# JSON Format #1 (JSON Array)

File:

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "isActive": false
  }
]
```

Notice:

```json
[
```

The file starts with an array.

### Import Command (Windows PowerShell)

```powershell
mongoimport --db myDb --collection users --file users.json --jsonArray
```

### Result

```text
2 document(s) imported successfully
```

---

# 🚨 Mistake I Made

I ran:

```powershell
mongoimport --db myDb --collection users --file users.json
```

And got:

```text
cannot decode array into a primitive
```

### Why?

Because my file was:

```json
[
  {}
]
```

which is a JSON Array.

MongoDB needed:

```powershell
--jsonArray
```

### Correct Command

```powershell
mongoimport --db myDb --collection users --file users.json --jsonArray
```

Lesson learned:

> If the file starts with `[`, use `--jsonArray`.

---

# JSON Format #2 (NDJSON)

MongoDB's default format.

File:

```json
{"id":1,"name":"John"}
{"id":2,"name":"Jane"}
{"id":3,"name":"Alex"}
```

Notice:

* No square brackets
* One document per line

Import:

```powershell
mongoimport --db myDb --collection users --file users.json
```

No `--jsonArray` required.

---

# Verify Imported Data

Open Mongo Shell:

```powershell
mongosh
```

Switch Database:

```javascript
use myDb
```

View Documents:

```javascript
db.users.find()
```

Pretty Print:

```javascript
db.users.find().pretty()
```

Count Documents:

```javascript
db.users.countDocuments()
```

---

# Why MongoDB Adds _id

My JSON:

```json
{
  "id": 1,
  "name": "John"
}
```

After import:

```json
{
  "_id": ObjectId("..."),
  "id": 1,
  "name": "John"
}
```

MongoDB automatically creates:

```javascript
_id
```

because every document needs a unique identifier.

### Remember

```text
id   → My custom field

_id  → MongoDB primary key
```

---

# Why Documents Appear Unordered

This confused me initially.

I imported:

```json
[
  { "id": 1 },
  { "id": 2 },
  { "id": 3 }
]
```

Expected:

```text
1
2
3
```

But MongoDB showed a different order.

### Reality

MongoDB does NOT guarantee order.

Never assume:

```javascript
db.users.find()
```

returns ordered data.

---

# Always Sort

Ascending:

```javascript
db.users.find().sort({ id: 1 })
```

Output:

```text
1
2
3
4
5
```

Descending:

```javascript
db.users.find().sort({ id: -1 })
```

Output:

```text
5
4
3
2
1
```

### Rule

If order matters:

```javascript
.sort()
```

must be used.

---

# Import CSV Files

Suppose I receive:

```csv
id,name,email
1,John,john@gmail.com
2,Jane,jane@gmail.com
```

Import:

```powershell
mongoimport --db myDb --collection users --type csv --headerline --file users.csv
```

### Meaning

| Option       | Purpose                         |
| ------------ | ------------------------------- |
| --type csv   | File format                     |
| --headerline | First row contains column names |

---

# Exporting Data

Export means:

> MongoDB → File

---

# Export Entire Collection

```powershell
mongoexport --db myDb --collection users --out users.json
```

---

# Export As JSON Array

Recommended.

```powershell
mongoexport --db myDb --collection users --jsonArray --out users.json
```

Output:

```json
[
  {
    "_id": "...",
    "name": "John"
  }
]
```

---

# Export to CSV

```powershell
mongoexport --db myDb --collection users --type csv --fields id,name,email --out users.csv
```

Generated:

```csv
id,name,email
1,John,john@gmail.com
2,Jane,jane@gmail.com
```

Perfect for Excel.

---

# Export Specific Documents

Only active users:

```powershell
mongoexport --db myDb --collection users --query "{""isActive"":true}" --jsonArray --out activeUsers.json
```

Windows PowerShell requires careful quoting.

---

# Replace Existing Collection

Import fresh data:

```powershell
mongoimport --db myDb --collection users --file users.json --jsonArray --drop
```

### What Happens?

```javascript
db.users.drop()
```

runs internally first.

Then import begins.

Use carefully.

---

# Upsert During Import

Suppose:

```json
{
  "id": 1,
  "name": "John Doe"
}
```

already exists.

Instead of creating duplicates:

```powershell
mongoimport --db myDb --collection users --file users.json --jsonArray --mode upsert --upsertFields id
```

MongoDB will:

* Update existing documents
* Insert new documents

Very common in production ETL pipelines.

---

# Import vs Export

| Tool        | Purpose        |
| ----------- | -------------- |
| mongoimport | File → MongoDB |
| mongoexport | MongoDB → File |

---

# Backup vs Restore

These are different from import/export.

### Backup

```powershell
mongodump --db myDb --out backup
```

Creates BSON backup files.

---

### Restore

```powershell
mongorestore --db myDb backup\myDb
```

Restores database.

---

# What Companies Actually Use

| Task                  | Tool                      |
| --------------------- | ------------------------- |
| Excel → MongoDB       | mongoimport               |
| JSON → MongoDB        | mongoimport               |
| Generate Reports      | mongoexport               |
| Share Data            | mongoexport               |
| Backup Production     | mongodump                 |
| Restore Production    | mongorestore              |
| Environment Migration | mongoexport + mongoimport |

---

# My Import/Export Checklist

Before Import:

* [ ] Is MongoDB running?
* [ ] Am I in the correct directory?
* [ ] Is the file JSON or CSV?
* [ ] If JSON starts with `[`, did I use `--jsonArray`?

Before Export:

* [ ] Correct database?
* [ ] Correct collection?
* [ ] Need all documents or filtered data?
* [ ] JSON or CSV?

---

# Commands I Should Memorize

Import JSON Array:

```powershell
mongoimport --db myDb --collection users --file users.json --jsonArray
```

Import CSV:

```powershell
mongoimport --db myDb --collection users --type csv --headerline --file users.csv
```

Export JSON:

```powershell
mongoexport --db myDb --collection users --jsonArray --out users.json
```

Export CSV:

```powershell
mongoexport --db myDb --collection users --type csv --fields id,name,email --out users.csv
```

Backup Database:

```powershell
mongodump --db myDb --out backup
```

Restore Database:

```powershell
mongorestore --db myDb backup\myDb
```

---

# Final Takeaways

✅ Import = File → MongoDB

✅ Export = MongoDB → File

✅ JSON Arrays require `--jsonArray`

✅ MongoDB automatically creates `_id`

✅ Never rely on document order

✅ Use `.sort()` whenever order matters

✅ CSV files require `--type csv --headerline`

✅ `mongoexport` is for sharing data

✅ `mongodump` is for backups

✅ `mongorestore` is for restoration

---

> Future Me:
>
> Most import/export problems are not MongoDB problems. They are usually file format problems. Always inspect the JSON/CSV file first.
