# MongoDB Database Safety — Lesson 2

## Creating Backups with `mongodump`

In the previous lesson, I learned **why backups matter**.

Now I want to actually do it.

My goal for this lesson is simple:

> **Take my MongoDB database and create a backup that I can later restore.**

The main tool I'll learn today is:

```bash
mongodump
```

---

# 1. What Is `mongodump`?

`mongodump` is a MongoDB command-line tool used to create a **binary backup** of MongoDB data.

My mental model is:

```text
MongoDB
   ↓
mongodump
   ↓
Backup files
```

So instead of thinking:

> "`mongodump` is just another MongoDB command."

I want to think:

> **"`mongodump` takes my MongoDB data and turns it into a backup I can use later for recovery."**

---

# 2. Where Does `mongodump` Come From?

One important thing:

`mongodump` is **not a command I run inside `mongosh`**.

This:

```javascript
db.users.find()
```

belongs inside:

```text
mongosh
```

But:

```bash
mongodump
```

belongs in my:

```text
Terminal / PowerShell / Command Prompt
```

So I need to remember:

```text
mongosh
   ↓
Talk to MongoDB using MongoDB shell commands


mongodump
   ↓
Create a backup from the operating system terminal
```

---

# 3. First, Check Whether I Have `mongodump`

Before using it, I can check:

```bash
mongodump --version
```

If it's installed correctly, I should get a version.

For example:

```text
mongodump version: 100.x.x
```

If my terminal says something like:

```text
'mongodump' is not recognized...
```

then the MongoDB Database Tools aren't installed or aren't available in my PATH.

---

# 4. The Simplest Backup

Suppose I'm running MongoDB locally:

```text
mongodb://localhost:27017
```

I can create a dump with:

```bash
mongodump --uri="mongodb://localhost:27017"
```

Now the important thing is:

> **What did this actually do?**

Conceptually:

```text
localhost:27017
      ↓
MongoDB
      ↓
mongodump
      ↓
Reads database data
      ↓
Creates backup directory
```

---

# 5. Where Does The Backup Go?

By default, `mongodump` creates a directory named:

```text
dump
```

So after running:

```bash
mongodump --uri="mongodb://localhost:27017"
```

I may get something like:

```text
dump/
├── database1/
│   ├── users.bson
│   └── users.metadata.json
│
├── database2/
│   ├── products.bson
│   └── products.metadata.json
```

The exact contents depend on the databases and collections being backed up.

---

# 6. What Is `.bson`?

This is an important new file type.

MongoDB stores documents internally using **BSON**.

BSON means:

> **Binary JSON**

So I might see:

```text
users.bson
products.bson
orders.bson
```

These aren't files that I normally open and read like:

```json
{
    "name": "Vivek"
}
```

They're binary backup files intended to be used by MongoDB tools.

My mental model:

```text
MongoDB documents
       ↓
   BSON backup
       ↓
mongorestore
       ↓
MongoDB
```

---

# 7. What Are `.metadata.json` Files?

I might also see:

```text
users.metadata.json
```

These files contain metadata associated with the collection.

Think:

```text
.bson
   ↓
Actual document data

.metadata.json
   ↓
Collection metadata
```

I don't need to memorize every field inside these files.

I just need to know that a `mongodump` backup isn't simply a pile of JSON documents.

---

# 8. Backing Up One Database

I don't always want to back up every database.

Suppose I have:

```text
MongoDB
├── admin
├── config
├── Bank
└── Shop
```

If I only want:

```text
Bank
```

I can specify the database:

```bash
mongodump \
  --uri="mongodb://localhost:27017" \
  --db=Bank
```

On Windows PowerShell, I can also write it on one line:

```powershell
mongodump --uri="mongodb://localhost:27017" --db=Bank
```

Now my mental model is:

```text
MongoDB
   ↓
Bank database
   ↓
mongodump
   ↓
dump/
   ↓
Bank/
```

---

# 9. Backing Up A Specific Collection

I can also narrow the backup down to a particular collection.

For example:

```bash
mongodump \
  --uri="mongodb://localhost:27017" \
  --db=Bank \
  --collection=accounts
```

Now:

```text
Bank
  ↓
accounts
  ↓
Backup
```

This is useful when I don't need the entire database.

---

# 10. Choosing Where The Backup Goes

I don't have to use the default `dump` directory.

I can specify the output directory using:

```bash
--out
```

For example:

```bash
mongodump \
  --uri="mongodb://localhost:27017" \
  --db=Bank \
  --out="./backups"
```

Now the structure might look like:

```text
backups/
└── Bank/
    ├── accounts.bson
    └── accounts.metadata.json
```

This is useful because I can organize backups instead of letting everything go into one default directory.

---

# 11. A Backup Is Just A Copy — But A Useful One

Suppose my database contains:

```text
Bank
├── accounts
├── transactions
└── customers
```

I run:

```bash
mongodump --uri="mongodb://localhost:27017" --db=Bank --out="./backups"
```

Now I have:

```text
MongoDB
   │
   └──────► backups/
                │
                └── Bank/
```

My database is still running normally.

`mongodump` is creating a separate backup representation.

---

# 12. What If My Database Requires Authentication?

In a real environment, MongoDB may require a username and password.

For example:

```bash
mongodump \
  --uri="mongodb://username:password@localhost:27017/Bank"
```

But I should be careful about putting passwords directly into terminal commands.

Why?

Because credentials can accidentally end up in:

```text
Shell history
Terminal logs
Scripts
CI/CD configuration
```

So in production, I should use appropriate credential-handling mechanisms rather than casually hardcoding passwords.

The important lesson:

> **Backup commands need authentication when MongoDB requires it.**

---

# 13. What About MongoDB Atlas?

So far I've been imagining:

```text
localhost:27017
```

But I can also dump data from a remote MongoDB deployment if I have the appropriate connection string and permissions.

Conceptually:

```text
My Computer
     │
     │ mongodump
     ▼
MongoDB Atlas
     │
     ▼
Backup files
```

For example, the command can use a MongoDB URI:

```bash
mongodump --uri="<your-mongodb-uri>"
```

I should replace the placeholder with my actual connection string.

I should **never commit credentials or connection strings containing passwords to GitHub**.

---

# 14. What `mongodump` Is Actually Doing

This is the flow I want to understand:

```text
             MongoDB
                │
                ▼
            mongodump
                │
        ┌───────┴───────┐
        ▼               ▼
    Documents        Metadata
        │               │
        ▼               ▼
      .bson       .metadata.json
        │               │
        └───────┬───────┘
                ▼
             Backup
```

Then later:

```text
Backup
   ↓
mongorestore
   ↓
MongoDB
```

So:

```text
mongodump  → Backup
mongorestore → Restore
```

I want to remember this pair.

---

# 15. `mongodump` vs `mongorestore`

I haven't learned `mongorestore` yet, but I can already understand the relationship:

```text
           BACKUP
              │
              ▼
         mongodump
              │
              ▼
        Backup files
              │
              ▼
        mongorestore
              │
              ▼
        MongoDB again
```

So:

```text
mongodump
    ↓
"I want to save my database."

mongorestore
    ↓
"I want to bring that saved data back."
```

We'll actually perform the restore in the next lesson.

---

# 16. Why I Shouldn't Just Copy The MongoDB Data Directory

I might wonder:

> "Why don't I just copy MongoDB's data folder?"

For a running database, blindly copying the underlying database files is not the same thing as creating a proper logical backup.

MongoDB provides backup tools and backup mechanisms designed for this purpose.

For learning a straightforward logical backup:

```text
mongodump
```

is the tool I'm practicing here.

---

# 17. Backup Naming

If I'm creating backups regularly, I don't want:

```text
dump/
dump/
dump/
dump/
```

I want to know when each backup was created.

For example:

```text
backups/
├── 2026-08-20/
├── 2026-08-21/
└── 2026-08-22/
```

Or:

```text
backups/
├── backup-2026-08-20/
├── backup-2026-08-21/
└── backup-2026-08-22/
```

The exact naming scheme isn't important.

The idea is:

> **Organized backups are much easier to manage and recover from.**

---

# 18. My First Practical Exercise

Now I want to actually practice.

First, create a small database:

```javascript
use("BackupDemo");

db.users.insertMany([
    {
        name: "Vivek",
        role: "student"
    },
    {
        name: "Rahul",
        role: "developer"
    }
]);

db.products.insertMany([
    {
        name: "Laptop",
        price: 60000
    },
    {
        name: "Keyboard",
        price: 2500
    }
]);
```

Now I have:

```text
BackupDemo
├── users
└── products
```

---

# 19. Verify My Data

Inside `mongosh`:

```javascript
use("BackupDemo");

db.users.find();

db.products.find();
```

I should make sure the data actually exists before backing it up.

My flow:

```text
Create data
    ↓
Verify data
    ↓
Create backup
```

---

# 20. Create The Backup

Now leave `mongosh` and use my terminal.

Run:

```bash
mongodump \
  --uri="mongodb://localhost:27017" \
  --db=BackupDemo \
  --out="./backups"
```

On PowerShell, I can simply use:

```powershell
mongodump --uri="mongodb://localhost:27017" --db=BackupDemo --out="./backups"
```

Now I should get:

```text
backups/
└── BackupDemo/
    ├── users.bson
    ├── users.metadata.json
    ├── products.bson
    └── products.metadata.json
```

---

# 21. Verify The Backup Exists

I don't want to blindly assume:

> "The command ran, so the backup must be fine."

I should inspect the directory.

I want to see something like:

```text
backups/
└── BackupDemo/
    ├── users.bson
    ├── users.metadata.json
    ├── products.bson
    └── products.metadata.json
```

Now I know:

```text
MongoDB
   ↓
mongodump
   ↓
Backup files exist
```

---

# 22. A Small Experiment

Now I can make the lesson more interesting.

Before deleting anything, I have:

```text
BackupDemo
├── users
└── products
```

I create the backup.

Then I can verify that the backup directory exists.

**Don't delete your only copy of important data.**

For this learning exercise, I can work with disposable sample data.

The point is to understand:

```text
Original database
       +
Backup
```

rather than relying on the backup without checking it.

---

# 23. What I Should NOT Do

### Don't commit backups to Git

I don't want:

```text
my-project/
├── src/
├── package.json
└── backups/
```

with a large database dump committed to GitHub.

Backups can contain:

```text
Users
Passwords
Emails
Orders
Private information
```

depending on the database.

So backups need proper security.

---

### Don't expose credentials

Avoid:

```bash
mongodump --uri="mongodb://admin:MyPassword123@..."
```

inside source code or committed scripts.

---

### Don't store the only backup beside the database

Bad:

```text
MongoDB Server
    ├── Database
    └── Only Backup
```

If the server/storage fails:

```text
Database + Backup
       ↓
      LOST
```

---

# 24. Backup Security

This is something I should take seriously.

A backup can be almost as sensitive as the database itself.

Imagine my database contains:

```text
users
emails
orders
payments
```

My backup contains copies of that information.

So:

```text
Database security
        +
Backup security
```

are both important.

A backup should be stored with appropriate:

```text
Access control
Encryption
Storage security
Retention policy
```

I don't need to implement all of this in this lesson.

I just need to understand why it matters.

---

# 25. What I've Learned Today

I can now explain:

### `mongodump`

> A MongoDB Database Tools utility used to create a logical backup.

### `.bson`

> Binary representation of MongoDB documents used in the dump.

### `.metadata.json`

> Metadata associated with dumped collections.

### `--db`

> Selects a specific database to dump.

### `--collection`

> Selects a specific collection.

### `--out`

> Specifies where the dump should be written.

---

# 26. My Mental Model

I don't want to memorize the flags individually.

I want this:

```text
                 MongoDB
                    │
                    ▼
                mongodump
                    │
                    ▼
              Backup directory
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       .bson             metadata
          │                   │
          └─────────┬─────────┘
                    ▼
              Recovery Copy
```

And later:

```text
Recovery Copy
      ↓
mongorestore
      ↓
MongoDB
```

---

# 27. Self-Test

Before moving to the next lesson, I should be able to answer:

### 1. What is `mongodump`?

### 2. Is `mongodump` run inside `mongosh`?

### 3. What is BSON?

### 4. What does `--db` do?

### 5. What does `--collection` do?

### 6. What does `--out` do?

### 7. Where does `mongodump` normally create its output?

### 8. Why shouldn't I store my only backup on the same machine as my database?

### 9. Why should backups be protected like production data?

### 10. What's the relationship between `mongodump` and `mongorestore`?

If I can explain:

> **`mongodump` takes MongoDB data and creates a backup representation that I can later use with `mongorestore` to recover the database.**

then I understand the core of this lesson.

---

# One-Line Memory

> **`mongodump` = take my MongoDB data and create a backup I can recover later.**

---

# What Comes Next?

I've successfully created a backup.

Now I have the other half of the problem:

> **"What if my database is gone? How do I put this backup back into MongoDB?"**

That's exactly what I'll learn next.

```text
mongodump
   ↓
BACKUP
   ↓
mongorestore
   ↓
RESTORE
```

## Lesson 3 — Restoring MongoDB Data with `mongorestore`
