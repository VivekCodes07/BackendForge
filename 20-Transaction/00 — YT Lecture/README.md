# MongoDB Transactions

> I am teaching myself MongoDB Transactions.
>
> My goal here is not to memorize MongoDB syntax. I want to understand **why transactions exist, what problem they solve, how commit/abort work, and where sessions fit into the picture.**

---

## 1. Why Do I Need Transactions?

A transaction is useful when I have **multiple database operations that together represent one logical action**.

The classic example is a bank transfer.

Suppose:

```text
Vivek     = ₹5000
Abhishek  = ₹2000
```

I want to transfer ₹500 from Vivek to Abhishek.

That logically means two operations:

```text
1. Deduct ₹500 from Vivek
2. Add ₹500 to Abhishek
```

The problem is that the application can fail between these two operations.

Without a transaction:

```text
Vivek ₹5000
Abhishek ₹2000

      |
      | Deduct ₹500
      v

Vivek ₹4500
Abhishek ₹2000

      |
      | Server crashes
      v

STOP
```

Now ₹500 has disappeared.

This is exactly the kind of problem transactions are designed to prevent.

---

# 2. The Main Idea of a Transaction

I should think of a transaction as:

> **A group of database operations that should be treated as one unit.**

Either:

```text
ALL operations succeed
        ↓
     COMMIT
        ↓
Changes become permanent
```

or:

```text
Something fails
        ↓
      ABORT
        ↓
Changes are rolled back
```

The important word here is **atomicity**.

---

# 3. Atomicity

Atomicity means:

> **Either all operations in a transaction happen, or none of them happen.**

For my bank transfer:

```text
Transaction
│
├── Deduct ₹500 from Vivek
│
└── Add ₹500 to Abhishek
```

I don't want this:

```text
Vivek       ₹4500
Abhishek    ₹2000

❌ Partial transaction
```

I want:

```text
SUCCESS:

Vivek       ₹4500
Abhishek    ₹2500
```

or, if something fails:

```text
FAILURE:

Vivek       ₹5000
Abhishek    ₹2000
```

There should be no half-completed transfer.

---

# 4. Without a Transaction

First, I want to understand the problem without using transactions.

```javascript
use("Bank");

// Initial data
db.accounts.insertMany([
    {
        _id: 1,
        name: "Vivek",
        balance: 5000
    },
    {
        _id: 2,
        name: "Abhishek",
        balance: 2000
    }
]);
```

Now imagine transferring ₹500:

```javascript
try {
    db.accounts.updateOne(
        { name: "Vivek" },
        { $inc: { balance: -500 } }
    );

    console.log("$500 deducted from Vivek's account");

    // Simulating a failure
    throw new Error("Server crashed!");

    db.accounts.updateOne(
        { name: "Abhishek" },
        { $inc: { balance: 500 } }
    );

    console.log("$500 credited to Abhishek's account");

} catch (error) {
    console.log(error.message);
}
```

If I check the accounts:

```javascript
db.accounts.find();
```

I may get:

```text
Vivek       4500
Abhishek    2000
```

The first operation happened, but the second operation never happened.

So:

```text
₹500 was deducted
        +
₹500 was never credited
        =
Inconsistent state
```

This is the problem transactions solve.

---

# 5. Transaction Lifecycle

A transaction has a simple mental model:

```text
START
  |
  v
Perform operations
  |
  +------------------+
  |                  |
  v                  v
SUCCESS            FAILURE
  |                  |
  v                  v
COMMIT             ABORT
  |                  |
  v                  v
Permanent          Rollback
changes            changes
```

I should remember:

```text
startTransaction()
        ↓
operations
        ↓
commitTransaction()
```

or:

```text
startTransaction()
        ↓
operations
        ↓
abortTransaction()
```

---

# 6. COMMIT

`commit` means:

> "Everything worked. Make the transaction's changes permanent."

Conceptually:

```text
START TRANSACTION

Deduct ₹500
Credit ₹500

        ↓

COMMIT

        ↓

Changes are permanent
```

After commit:

```text
Vivek       ₹4500
Abhishek    ₹2500
```

The transaction is successfully completed.

---

# 7. ABORT

`abort` means:

> "Something went wrong. Cancel this transaction and roll back its changes."

Example:

```text
START TRANSACTION

Deduct ₹500
        ↓
Something goes wrong
        ↓
ABORT
```

The database returns to the state before the transaction:

```text
Vivek       ₹5000
Abhishek    ₹2000
```

The deduction is undone.

---

# 8. The Important Part I Initially Missed: Session

When I first saw MongoDB transaction code, I saw something like:

```javascript
const session = db.getMongo().startSession();

const accounts = session.getDatabase("Bank").accounts;

session.startTransaction();
```

At first, `session` can look confusing.

I don't need to deeply study sessions yet.

For now, I should remember this mental model:

```text
SESSION
   |
   | associates database operations
   | with the transaction
   v
TRANSACTION
```

In simple words:

> **The session is the mechanism MongoDB uses to keep track of the operations belonging to my transaction.**

I should not think of `session.startTransaction()` as:

> "Turn on transactions globally for my database."

It is more like:

> "Start a transaction for this session."

Therefore, transaction operations need to be executed through that session.

---

# 9. Why `db.accounts` and `accounts` Are Different Here

This was an important lesson.

Suppose I write:

```javascript
const session = db.getMongo().startSession();

const accounts = session.getDatabase("Bank").accounts;
```

Now I have:

```text
db.accounts
    ↓
Normal database collection handle

accounts
    ↓
Collection handle associated with my session
```

So this:

```javascript
db.accounts.updateOne(...)
```

is not the same as this:

```javascript
accounts.updateOne(...)
```

When working with the transaction session, I should use the session-associated collection:

```javascript
accounts.updateOne(...)
```

This is why my earlier code did not roll back.

I had started a transaction, but my update was being performed using:

```javascript
db.accounts.updateOne(...)
```

instead of:

```javascript
accounts.updateOne(...)
```

---

# 10. Correct Transaction Example

Here is the complete example I should understand:

```javascript
use("Bank");

const session = db.getMongo().startSession();

const accounts = session.getDatabase("Bank").accounts;

session.startTransaction();

try {

    accounts.updateOne(
        { name: "Vivek" },
        { $inc: { balance: -500 } }
    );

    console.log("$500 deducted from Vivek's account");

    accounts.updateOne(
        { name: "Abhishek" },
        { $inc: { balance: 500 } }
    );

    console.log("$500 credited to Abhishek's account");

    session.commitTransaction();

} catch (error) {

    session.abortTransaction();

    console.log(error.message);

} finally {

    session.endSession();
}

db.accounts.find();
```

The important flow is:

```text
Create Session
      ↓
Start Transaction
      ↓
Deduct from Vivek
      ↓
Credit Abhishek
      ↓
Everything successful?
      ↓
     YES
      ↓
    COMMIT
```

If something fails:

```text
Create Session
      ↓
Start Transaction
      ↓
Deduct from Vivek
      ↓
ERROR
      ↓
    ABORT
      ↓
Rollback
```

---

# 11. Testing Rollback

I can deliberately create an error to see the transaction roll back.

```javascript
use("Bank");

const session = db.getMongo().startSession();

const accounts = session.getDatabase("Bank").accounts;

session.startTransaction();

try {

    accounts.updateOne(
        { name: "Vivek" },
        { $inc: { balance: -500 } }
    );

    console.log("$500 deducted from Vivek's account");

    // Simulate server failure
    throw new Error("Server crashed!");

    accounts.updateOne(
        { name: "Abhishek" },
        { $inc: { balance: 500 } }
    );

    session.commitTransaction();

} catch (error) {

    session.abortTransaction();

    console.log(error.message);

} finally {

    session.endSession();
}

db.accounts.find();
```

Expected result:

```text
Vivek       ₹5000
Abhishek    ₹2000
```

Even though this happened temporarily inside the transaction:

```text
Vivek
₹5000 → ₹4500
```

the abort causes the transaction to roll back.

So the final database state becomes:

```text
Vivek
₹5000
```

---

# 12. Why Does MongoDB Roll It Back?

The transaction provides an isolated set of changes that are not treated as permanently committed until I call:

```javascript
session.commitTransaction();
```

If I call:

```javascript
session.abortTransaction();
```

MongoDB discards the transaction's changes.

So I should mentally separate:

```text
Change made inside transaction
        ≠
Permanent database change
```

until the transaction is committed.

---

# 13. A Better Real-World Example

Bank transfer is only one example.

Transactions are useful whenever multiple operations together represent one logical action.

### E-commerce order

Suppose a customer buys a product.

I may need to:

```text
1. Create order
2. Reduce inventory
3. Create payment record
4. Update customer's order history
```

If step 1 succeeds but step 2 fails, I may not want a partially-created order.

Conceptually:

```text
START TRANSACTION
        |
        ├── Create order
        |
        ├── Reduce stock
        |
        ├── Record payment
        |
        └── Update order history
        |
        v
      COMMIT
```

If something fails:

```text
        ↓
      ABORT
        ↓
Rollback everything
```

---

# 14. Transactions vs Single Document Atomicity

This is extremely important.

MongoDB already provides atomicity for operations on a **single document**.

For example:

```javascript
db.accounts.updateOne(
    { name: "Vivek" },
    { $inc: { balance: -500 } }
);
```

This operation itself is atomic for that document.

The problem appears when I need multiple operations/documents to behave as one unit.

For example:

```text
Document 1
Vivek
₹5000

Document 2
Abhishek
₹2000
```

I need to update both documents as one logical operation.

That is where a multi-document transaction becomes useful.

Mental model:

```text
Single document
      ↓
MongoDB already provides atomic document operations

Multiple documents
      ↓
If they must succeed/fail together
      ↓
Consider a transaction
```

---

# 15. ACID

Transactions are commonly explained using the **ACID** properties.

I should know what each one means.

## A — Atomicity

All or nothing.

```text
Everything succeeds
       OR
Everything rolls back
```

## C — Consistency

The database should move from one valid state to another valid state.

For my bank example:

Before:

```text
Vivek       ₹5000
Abhishek    ₹2000

Total = ₹7000
```

After successful transfer:

```text
Vivek       ₹4500
Abhishek    ₹2500

Total = ₹7000
```

The total money remains consistent.

## I — Isolation

Operations inside a transaction should be isolated from conflicting operations according to the database's transaction/isolation rules.

The important beginner-level idea:

> One transaction should not create an inconsistent intermediate state that other operations can incorrectly treat as the final result.

## D — Durability

After a successful commit, the changes are intended to survive failures according to MongoDB's durability/write-concern guarantees.

So:

```text
COMMIT
  ↓
Changes become durable
```

---

# 16. The Most Important Mental Model

I should visualize a transaction like a temporary workspace:

```text
              TRANSACTION
                  |
        +---------+---------+
        |                   |
        v                   v
   Deduct ₹500          Credit ₹500
        |                   |
        +---------+---------+
                  |
                  v
              COMMIT
                  |
                  v
         Permanent changes
```

If something fails:

```text
              TRANSACTION
                  |
        +---------+---------+
        |                   |
        v                   v
   Deduct ₹500          ERROR
        |
        v
      ABORT
        |
        v
     ROLLBACK
        |
        v
 Original state restored
```

---

# 17. `try/catch/finally` Pattern

I should understand why this structure is commonly used:

```javascript
try {

    // Transaction operations

} catch (error) {

    // Abort transaction

} finally {

    // End session
}
```

The idea is:

```text
try
 ↓
Try all database operations

catch
 ↓
Something failed
 ↓
Abort

finally
 ↓
Clean up the session
```

A successful transaction looks like:

```javascript
try {

    // Operations

    session.commitTransaction();

} catch (error) {

    session.abortTransaction();

} finally {

    session.endSession();

}
```

`finally` is useful because I want the session cleaned up whether the transaction succeeds or fails.

---

# 18. What I Should NOT Confuse

### `commit` vs `abort`

```text
commit = keep the transaction's changes

abort  = discard the transaction's changes
```

### Transaction vs Session

```text
Transaction
    =
The unit of work

Session
    =
The mechanism through which MongoDB associates
operations with that transaction
```

### Transaction vs Update

An update is just an operation:

```javascript
updateOne(...)
```

A transaction is a group of operations that should be treated as one logical unit.

---

# 19. Common Mistake

This is wrong for the transaction code I am learning:

```javascript
const session = db.getMongo().startSession();

const accounts = session.getDatabase("Bank").accounts;

session.startTransaction();

try {

    db.accounts.updateOne(...);

    session.commitTransaction();

} catch (error) {

    session.abortTransaction();

}
```

Why?

Because I created a session-bound collection:

```javascript
const accounts = session.getDatabase("Bank").accounts;
```

but then ignored it.

I should perform the transaction operation through:

```javascript
accounts.updateOne(...);
```

instead.

---

# 20. Transaction Flow I Should Memorize

```text
                SESSION
                   |
                   v
          START TRANSACTION
                   |
                   v
          Perform operations
                   |
             +-----+-----+
             |           |
          Success      Failure
             |           |
             v           v
           COMMIT       ABORT
             |           |
             v           v
        Keep changes   Rollback
```

Or even shorter:

```text
START
  ↓
WORK
  ↓
SUCCESS? ── YES ──→ COMMIT
  |
  NO
  ↓
ABORT
```

---

# 21. My Current Understanding

At this stage, I should be able to explain this without looking at documentation:

> A MongoDB transaction allows me to group multiple database operations into one logical unit. If every operation succeeds, I commit the transaction and the changes become permanent. If something fails, I abort the transaction and MongoDB rolls back the transaction's changes. MongoDB uses sessions to associate operations with a particular transaction. I don't need to deeply understand sessions yet; I only need to know that transaction operations must be performed through the appropriate session.

---

# 22. Quick Revision

### Why do transactions exist?

To prevent partially completed operations when multiple database changes must succeed or fail together.

### What is atomicity?

All operations succeed or none of them become permanent.

### What is `commit`?

Make the transaction's changes permanent.

### What is `abort`?

Cancel the transaction and roll back its changes.

### What is a session?

The mechanism MongoDB uses to associate database operations with a transaction.

### Why can't I blindly use `db.accounts`?

Because the transaction is associated with a session. I need to perform the transaction operations through the session-associated database/collection.

### When are transactions useful?

When multiple operations/documents must behave as one logical unit.

### Does every MongoDB operation require a transaction?

No.

Single-document operations are already atomic. I should use transactions when I need multiple operations to succeed or fail together.

---

# 23. Final Mental Picture

This is what I want permanently in my head:

```text
                REAL-WORLD ACTION
                 "Transfer ₹500"
                       |
                       v
                TRANSACTION
                       |
          +------------+------------+
          |                         |
          v                         v
   Deduct from Vivek        Credit Abhishek
          |                         |
          +------------+------------+
                       |
                 Did everything
                    succeed?
                  /           \
                YES            NO
                 |              |
                 v              v
              COMMIT          ABORT
                 |              |
                 v              v
          Keep all changes   Rollback all
                              changes
```

And behind the scenes:

```text
              SESSION
                 |
                 v
            TRANSACTION
                 |
                 v
          Database operations
```

That is the core of MongoDB Transactions that I need to understand right now.

I can study **MongoDB Sessions** separately later. I should not let the session API distract me from understanding the actual transaction concept.
