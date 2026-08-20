# MongoDB Database Safety — Lesson 3

## Restoring Data with `mongorestore`

In the previous lesson, I learned how to create a MongoDB backup using:

```text id="9quv0v"
mongodump
```

So I now have:

```text id="b4s7k2"
MongoDB
   ↓
mongodump
   ↓
Backup
```

But a backup isn't useful if I don't know how to bring the data back.

So today's question is:

> **How do I restore my MongoDB database from a backup?**

The tool I'll learn is:

```bash id="e7p3k9"
mongorestore
```

My mental model is simple:

```text id="4q8m2x"
Backup
   ↓
mongorestore
   ↓
MongoDB
```

---

# 1. `mongodump` and `mongorestore` Are A Pair

I want to remember these together:

```text id="h3x9q7"
mongodump
    ↓
CREATE BACKUP


mongorestore
    ↓
RESTORE BACKUP
```

So:

```text id="8m2p5r"
MongoDB
   ↓
mongodump
   ↓
Backup files
   ↓
mongorestore
   ↓
MongoDB
```

This is the complete basic backup/restore cycle.

---

# 2. `mongorestore` Is Not A `mongosh` Command

Just like `mongodump`, I run `mongorestore` from my:

```text id="n6r2x8"
Terminal
PowerShell
Command Prompt
```

Not inside:

```text id="j7p4m1"
mongosh
```

So:

```text id="q3x8m5"
mongosh
   ↓
Work with MongoDB


mongorestore
   ↓
Restore backup files
```

---

# 3. Before Restoring, I Need A Backup

I can't restore something that doesn't exist.

My starting point is:

```text id="v8m3q2"
Backup
└── BackupDemo/
    ├── users.bson
    ├── users.metadata.json
    ├── products.bson
    └── products.metadata.json
```

This is what I created in Lesson 2 using:

```bash id="r5n7x1"
mongodump
```

Now I'm going to use:

```bash id="j9m4q6"
mongorestore
```

to bring it back.

---

# 4. The Simplest Restore

Suppose my backup is located in:

```text id="6x2p9m"
./backups
```

I can restore it with:

```bash id="3k7q1w"
mongorestore --uri="mongodb://localhost:27017" ./backups
```

Conceptually:

```text id="v4m8q2"
./backups
    ↓
mongorestore
    ↓
localhost:27017
    ↓
MongoDB
```

MongoDB now receives the data from the backup.

---

# 5. Restoring A Specific Database

Suppose my backup contains:

```text id="n7x3m5"
backups/
└── BackupDemo/
```

I can restore that database:

```bash id="1q8p4z"
mongorestore \
  --uri="mongodb://localhost:27017" \
  --db=BackupDemo \
  ./backups/BackupDemo
```

On PowerShell, I can write:

```powershell id="8w3m6r"
mongorestore --uri="mongodb://localhost:27017" --db=BackupDemo ./backups/BackupDemo
```

The flow is:

```text id="m4q9x2"
BackupDemo backup
       ↓
mongorestore
       ↓
BackupDemo database
```

---

# 6. Let's Understand The Restore Process

I don't want to think of `mongorestore` as magic.

The basic flow is:

```text id="p8m3x7"
Backup directory
      ↓
Read BSON files
      ↓
Read metadata
      ↓
Connect to MongoDB
      ↓
Write the data
      ↓
Collections restored
```

So:

```text id="x4q7m2"
.bson
  ↓
Documents

.metadata.json
  ↓
Collection metadata
```

Together, these help reconstruct the database.

---

# 7. Practical Example

Suppose I had:

```text id="q9m2x5"
BackupDemo
├── users
│   ├── Vivek
│   └── Rahul
│
└── products
    ├── Laptop
    └── Keyboard
```

I created a backup:

```bash id="r8p3m6"
mongodump --uri="mongodb://localhost:27017" --db=BackupDemo --out="./backups"
```

Now:

```text id="4m7x2q"
backups/
└── BackupDemo/
    ├── users.bson
    ├── users.metadata.json
    ├── products.bson
    └── products.metadata.json
```

Now imagine something happens to my database.

The data disappears.

```text id="7q3m8x"
BackupDemo
    X
```

This is where my backup becomes useful.

---

# 8. The Recovery

I run:

```bash id="5m2q8r"
mongorestore --uri="mongodb://localhost:27017" ./backups/BackupDemo
```

MongoDB reads the backup.

Conceptually:

```text id="p4x7m1"
Backup
  ↓
mongorestore
  ↓
users restored
  ↓
products restored
  ↓
BackupDemo recovered
```

Now I can verify it using `mongosh`.

```javascript id="k8q3m5"
use("BackupDemo");

show collections;
```

Then:

```javascript id="n4x7p2"
db.users.find();

db.products.find();
```

If the documents are back:

```text id="j5m9q3"
Backup
  ↓
Restore
  ↓
Data recovered ✓
```

That's the whole point of today's lesson.

---

# 9. Restore Is Not Just For Disasters

I might think:

> "I only restore when my server crashes."

Not necessarily.

Restore can also be useful for:

```text id="w7m3q9"
Testing
Development
Migration
Recovery
Creating a copy of data
```

For example, I might have production data backed up and want to restore a copy into a testing environment.

```text id="r2x8m5"
Production Backup
       ↓
mongorestore
       ↓
Testing MongoDB
```

This lets me test things against realistic data without touching production.

Of course, sensitive production data must be handled carefully.

---

# 10. What If The Database Already Exists?

This is where I need to be careful.

Suppose:

```text id="6q3m8x"
MongoDB
└── BackupDemo
      ├── users
      └── products
```

and I try to restore the same data again.

MongoDB may encounter documents that already exist.

So I need to understand that:

> **Restore doesn't necessarily mean "delete everything and recreate the database."**

The exact behavior depends on the options I'm using and the state of the target database.

This is why I should be careful when restoring into a database that already contains data.

---

# 11. `--drop`

One particularly useful option is:

```bash id="7m2q9x"
--drop
```

It tells `mongorestore` to drop the collections being restored before restoring them.

For example:

```bash id="k4p8m2"
mongorestore \
  --uri="mongodb://localhost:27017" \
  --drop \
  ./backups/BackupDemo
```

Conceptually:

```text id="q9m3x7"
Existing collection
       ↓
     DROP
       ↓
Restore backup
       ↓
Clean restored collection
```

This can be useful when I want the target collection to match the backup rather than mixing old and restored data.

But:

> **`--drop` is destructive.**

I should never casually run it against an important production database.

---

# 12. The Danger Of `--drop`

Imagine I have:

```text id="x7m2q9"
Production Database
```

and I accidentally run:

```bash id="r3p8m5"
mongorestore --drop ...
```

Now existing collections can be dropped before restoration.

So my mental rule is:

```text id="q4x9m2"
--drop
   ↓
Useful
   +
Dangerous
```

Before using it, I should know exactly which database I'm restoring into.

---

# 13. Restore Into A Different Database

Sometimes I don't want to overwrite my current database.

Maybe I want:

```text id="8m3q7x"
BackupDemo
```

to become:

```text id="2p9x4m"
BackupDemo_Test
```

This can be useful when practicing restoration.

MongoDB Database Tools provide options for controlling the target namespace/database during restore.

The important idea is:

```text id="7q3m8x"
Production Backup
       ↓
Restore
       ↓
Test Database
```

This is often safer for learning because I can inspect the restored data without touching my original database.

---

# 14. Restore A Specific Collection

I don't always have to restore everything.

Suppose:

```text id="3x7m9q"
BackupDemo/
├── users.bson
├── products.bson
└── orders.bson
```

Maybe I only need:

```text id="m8q2x5"
users
```

I can use the appropriate restore options to limit what gets restored.

The broader idea is:

> **I can control what part of a backup I restore.**

I don't need to treat the backup as an all-or-nothing object.

---

# 15. Authentication

Just like `mongodump`, `mongorestore` may need authentication.

For example:

```bash id="p5x8m3"
mongorestore \
  --uri="mongodb://username:password@localhost:27017" \
  ./backups
```

But again:

> **I should never casually put real passwords into commands that might end up in shell history or Git.**

For learning on my local MongoDB setup, authentication may not be enabled.

For production, authentication and authorization are essential.

---

# 16. Local MongoDB Example

If I'm using:

```text id="4m7x9q"
localhost:27017
```

and have:

```text id="k3p8m2"
backups/
└── BackupDemo/
```

my basic restore is:

```bash id="r7x2m9"
mongorestore --uri="mongodb://localhost:27017" ./backups/BackupDemo
```

Then I verify:

```javascript id="q5m8x3"
use("BackupDemo");

show collections;

db.users.find();

db.products.find();
```

This is the practical workflow I want to remember.

---

# 17. The Full Backup → Failure → Restore Exercise

Now I can simulate a mini disaster recovery scenario.

### Step 1 — Create data

```javascript id="x8m3q2"
use("BackupDemo");

db.users.insertMany([
    { name: "Vivek", role: "student" },
    { name: "Rahul", role: "developer" }
]);
```

---

### Step 2 — Create a backup

From the terminal:

```bash id="m4q7x9"
mongodump \
  --uri="mongodb://localhost:27017" \
  --db=BackupDemo \
  --out="./backups"
```

---

### Step 3 — Verify the backup

I should see:

```text id="p3x8m2"
backups/
└── BackupDemo/
    ├── users.bson
    └── users.metadata.json
```

---

### Step 4 — Simulate data loss

For a disposable learning database:

```javascript id="7m2q5x"
use("BackupDemo");

db.users.drop();
```

Now:

```text id="x9p3m7"
users
  ↓
GONE
```

---

### Step 5 — Restore

From the terminal:

```bash id="q4m8x2"
mongorestore \
  --uri="mongodb://localhost:27017" \
  ./backups/BackupDemo
```

---

### Step 6 — Verify

Back in `mongosh`:

```javascript id="m7x3q9"
use("BackupDemo");

db.users.find();
```

If I see:

```text id="k2p8m4"
Vivek
Rahul
```

then:

```text id="j5x9q3"
Backup
  ↓
Restore
  ↓
Data recovered ✓
```

I just performed a complete recovery.

---

# 18. What Just Happened?

The entire exercise can be summarized as:

```text id="8q3m7x"
                ORIGINAL DATA
                     │
                     ▼
                 mongodump
                     │
                     ▼
                  BACKUP
                     │
                     │
               DATA DELETED
                     │
                     ▼
                mongorestore
                     │
                     ▼
                DATA BACK
```

This is the most important flow of this lesson.

---

# 19. `mongodump` vs `mongorestore`

I want this table in my memory:

| Tool             | What it does                              |
| ---------------- | ----------------------------------------- |
| `mongodump`      | Creates a backup                          |
| `mongorestore`   | Restores a backup                         |
| `.bson`          | Contains dumped document data             |
| `.metadata.json` | Contains collection metadata              |
| `--out`          | Controls backup output location           |
| `--drop`         | Drops target collections before restoring |

---

# 20. One Important Limitation

`mongodump` and `mongorestore` are useful **logical backup tools**, but they aren't automatically the perfect backup solution for every production deployment.

For example, a serious production system may need:

```text id="z7m2q9"
Frequent backups
Off-site storage
Encryption
Retention
Monitoring
Point-in-time recovery
Automated testing
Fast recovery
```

So I shouldn't conclude:

> "I know `mongodump`, therefore I know production backups."

Instead:

> **"`mongodump` and `mongorestore` teach me the fundamental backup/restore workflow."**

Later I'll learn the bigger backup strategy.

---

# 21. What If My Backup Is Very Large?

Imagine:

```text id="4q8m2x"
Database = 5 TB
```

Creating and restoring a huge logical dump can take significant time and resources.

That's one reason production MongoDB environments often use more advanced backup solutions.

For this lesson, my focus is:

```text id="m3x7q9"
Understand the basic mechanism
        ↓
Create backup
        ↓
Lose data
        ↓
Restore data
```

---

# 22. My Mental Model

I want this permanently in my head:

```text id="8m4q2x"
             BACKUP SIDE
                 │
                 ▼
             mongodump
                 │
                 ▼
            Backup Files
                 │
                 │
            DISASTER
                 │
                 ▼
             RESTORE SIDE
                 │
                 ▼
           mongorestore
                 │
                 ▼
            MongoDB
```

So:

> **`mongodump` gets my data OUT. `mongorestore` puts it BACK.**

---

# 23. Self-Test

Before moving on, I should be able to answer:

### 1. What is `mongorestore`?

### 2. Where do I run `mongorestore`?

### 3. What does it need as input?

### 4. What's the relationship between `mongodump` and `mongorestore`?

### 5. What does `--drop` do?

### 6. Why can `--drop` be dangerous?

### 7. Why might I restore a backup into a test database?

### 8. Why shouldn't I blindly restore over production?

### 9. What happens during the restore flow?

### 10. Can `mongodump` + `mongorestore` alone represent a complete production backup strategy?

If I can explain:

> **`mongorestore` reads a MongoDB dump created by `mongodump` and writes that data back into a MongoDB deployment.**

then I understand the lesson.

---

# One-Line Memory

> **`mongodump` saves my MongoDB data; `mongorestore` brings that saved data back.**

---

# What Comes Next?

I now know:

```text
Lesson 1
Why backups?
     ↓
Lesson 2
How to create backups
     ↓
Lesson 3
How to restore backups
```

Now I need to think beyond individual commands.

The next question is:

> **"How should I design a proper backup strategy for a real application?"**

That's where I'll learn about:

```text
Full backups
Incremental backups
Point-in-time recovery
Atlas backups
Retention
RPO
RTO
Off-site backups
Backup testing
```

## Lesson 4 — Real MongoDB Backup Strategies
