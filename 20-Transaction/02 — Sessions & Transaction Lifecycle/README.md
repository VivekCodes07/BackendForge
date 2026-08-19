# MongoDB Transactions — Lesson 2

## Sessions & Transaction Lifecycle

In Lesson 1, I understood **why transactions exist**.

I know that when multiple database operations belong to one logical piece of work, I may want them to behave like one unit:

```text
Everything succeeds → COMMIT
Something fails     → ABORT
```

But now I have another question:

> **How does MongoDB know which operations belong to the same transaction?**

This is where **sessions** come in.

---

# 1. The Big Picture

The relationship I need to understand is:

```text
Session
   ↓
Transaction
   ↓
Multiple Operations
```

Or more visually:

```text
             SESSION
                │
                ▼
          TRANSACTION
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
    Operation Operation Operation
        1        2        3
```

So my first important realization is:

> **A transaction runs inside a session.**

---

# 2. What Is A Session?

I can think of a MongoDB session as a **context** for a sequence of database operations.

Instead of thinking about the technical definition first, I can imagine this:

```text
My Backend
    │
    │ "I'm starting a session."
    ▼
  Session
    │
    ├── Operation
    ├── Operation
    └── Operation
```

The session gives MongoDB context about the operations I'm performing.

This becomes especially important when those operations are part of a transaction.

---

# 3. Session Is NOT The Same As Transaction

This is probably the most important distinction in this lesson.

I should NOT think:

```text
Session = Transaction
```

Instead:

```text
SESSION
   │
   └── can contain a transaction
             │
             ├── Operation 1
             ├── Operation 2
             └── Operation 3
```

So:

> **Session = context**

while:

> **Transaction = one logical unit of database work**

That's the difference I want to remember.

---

# 4. A Simple Analogy

Imagine I go to a bank.

My entire interaction with the bank is one session:

```text
Bank Interaction
       ↓
    Session
```

During that interaction, I perform a specific operation:

```text
Transfer ₹1,000
```

That transfer is the transaction:

```text
Session
   ↓
Transfer ₹1,000
   ↓
Transaction
```

The analogy isn't a perfect representation of MongoDB internals, but it gives me the right mental model:

```text
Session → Context
Transaction → Unit of Work
```

---

# 5. Why Does MongoDB Need A Session?

Suppose I want these three operations to belong to one transaction:

```text
1. Create Order
2. Reduce Inventory
3. Update Payment State
```

I don't want MongoDB to see them as three completely unrelated operations.

I want:

```text
Create Order
      +
Reduce Inventory
      +
Update Payment State
      ↓
ONE TRANSACTION
```

The session provides the context that connects those operations to the transaction.

So I can visualize:

```text
                SESSION
                   │
                   ▼
             TRANSACTION
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     Order      Inventory   Payment
```

---

# 6. The Complete Transaction Lifecycle

Now I can finally see the complete flow.

```text
START SESSION
      ↓
START TRANSACTION
      ↓
PERFORM OPERATIONS
      ↓
EVERYTHING OK?
     / \
   YES  NO
    │    │
    ▼    ▼
 COMMIT ABORT
    │    │
    └──┬─┘
       ▼
  END SESSION
```

This is the core flow of the entire lesson.

I want to understand each step.

---

# 7. Step 1 — Start The Session

My application first creates a session.

Conceptually:

```text
Application
     ↓
Start Session
     ↓
Session Created
```

At this point:

```text
Session = active
Transaction = not started yet
```

So I shouldn't immediately think:

> "The transaction has started."

No.

I've only created the context in which the transaction can run.

---

# 8. Step 2 — Start The Transaction

Now I start the transaction inside that session.

```text
Session
   ↓
Start Transaction
   ↓
Active Transaction
```

Now the relationship becomes:

```text
Session
   └── Active Transaction
```

The operations I perform as part of this transaction need to use this session.

---

# 9. Step 3 — Perform Database Operations

Now I perform my actual work.

For example, an online order:

```text
Transaction
     │
     ├── Check Inventory
     ├── Create Order
     └── Update Inventory
```

The important part is:

```text
Same Session
      ↓
Same Transaction
      ↓
Related Operations
```

This is what allows MongoDB to treat them as one unit.

---

# 10. Step 4 — Everything Succeeds

Suppose:

```text
Check Inventory ✓
Create Order    ✓
Update Stock    ✓
```

Everything worked.

So I commit:

```text
COMMIT
```

Conceptually:

```text
Transaction
     │
     ├── Operation 1 ✓
     ├── Operation 2 ✓
     └── Operation 3 ✓
              │
              ▼
           COMMIT
```

The transaction successfully completes.

---

# 11. Step 4 — Something Fails

Now imagine:

```text
Check Inventory ✓
Create Order    ✓
Update Stock    ✗
```

I don't want the successful operations to leave the database in a partially completed state.

So:

```text
Operation fails
      ↓
    ABORT
      ↓
Transaction changes are rolled back
```

The flow becomes:

```text
Operation 1 ✓
Operation 2 ✓
Operation 3 ✗
       ↓
     ABORT
       ↓
Discard transaction's changes
```

This connects directly to the **Atomicity** concept from Lesson 1.

---

# 12. Step 5 — End The Session

Once I'm finished with the transaction:

```text
COMMIT / ABORT
       ↓
END SESSION
```

So the complete lifecycle is:

```text
Start Session
      ↓
Start Transaction
      ↓
Perform Operations
      ↓
Commit / Abort
      ↓
End Session
```

That's the lifecycle I want in my head.

---

# 13. What Does `{ session }` Actually Mean?

This is where the concept starts becoming useful in code.

Suppose I have:

```javascript
await orders.insertOne(order, { session });
```

The important part is:

```javascript
{ session }
```

I'm essentially telling MongoDB:

> **"Run this operation using this session's context."**

So I can visualize:

```text
session
   │
   ├── insert order
   ├── update inventory
   └── update payment
```

All of those operations are associated with the same session.

---

# 14. Why Every Transaction Operation Needs The Correct Session

Suppose I have:

```text
Transaction
     │
     ├── Create Order
     ├── Update Inventory
     └── Update Payment
```

I want all three operations connected to the same session:

```text
             SESSION
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
      Order  Inventory  Payment
```

If I accidentally execute an operation without the intended session:

```text
SESSION
   │
   ├── Order ✓
   ├── Inventory ✓
   │
   └── Payment
         ↑
   Wrong context
```

then that operation isn't participating in the transaction the way I intended.

So my rule is:

> **Every database operation that should participate in the transaction must use the transaction's session.**

---

# 15. The Node.js Structure

I don't need to memorize the syntax yet, but I want to recognize the structure.

```javascript
const session = client.startSession();

try {

    session.startTransaction();

    // Database operation
    // Database operation
    // Database operation

    await session.commitTransaction();

} catch (error) {

    await session.abortTransaction();

} finally {

    await session.endSession();
}
```

When I look at this, I should immediately see:

```text
startSession()
      ↓
startTransaction()
      ↓
operations
      ↓
commitTransaction()
      ↓
endSession()
```

And if something fails:

```text
catch
  ↓
abortTransaction()
```

The syntax isn't the main lesson yet.

The **flow** is.

---

# 16. The Flow Inside My Backend

Suppose I have:

```text
POST /orders
```

The request comes into my backend.

Then:

```text
HTTP Request
     ↓
Start Session
     ↓
Start Transaction
     ↓
Check Inventory
     ↓
Create Order
     ↓
Update Inventory
     ↓
Everything successful?
    / \
  YES  NO
   │    │
   ▼    ▼
COMMIT ABORT
   │    │
   └──┬─┘
      ▼
 End Session
```

So when I eventually use transactions in a real Node.js backend, I can understand what the code is actually doing instead of blindly copying it.

---

# 17. Session vs Database Connection

Another thing I don't want to confuse:

```text
Session ≠ Connection
```

Very simply:

### Connection

Think:

```text
Application
     ↓
Communication
     ↓
MongoDB
```

It's about communicating with the database.

### Session

Think:

```text
Session
    ↓
Logical context
    ↓
Operations
```

It's about maintaining context for a sequence of operations.

This is a simplified mental model, but it's enough for me at this stage.

---

# 18. Transaction States

A transaction has a lifecycle.

I can imagine:

```text
No Active Transaction
          ↓
     Transaction
       Started
          ↓
       Active
          ↓
    ┌─────┴─────┐
    ▼           ▼
 COMMITTED    ABORTED
```

So:

```text
START
  ↓
ACTIVE
  ↓
COMMITTED
```

or:

```text
START
  ↓
ACTIVE
  ↓
ABORTED
```

A transaction doesn't remain active forever.

---

# 19. Complete Example — Bank Transfer

Suppose:

```text
Account A = ₹10,000
Account B = ₹5,000
```

I want to transfer:

```text
₹1,000
```

My backend could conceptually do:

```text
Start Session
      ↓
Start Transaction
      ↓
A = A - ₹1,000
      ↓
B = B + ₹1,000
      ↓
Everything okay?
     / \
   YES  NO
    │    │
    ▼    ▼
 COMMIT ABORT
    │    │
    └──┬─┘
       ▼
 End Session
```

If both operations succeed:

```text
A = ₹9,000
B = ₹6,000
```

If the second operation fails:

```text
ABORT
```

and the transaction's changes are rolled back.

---

# 20. The Most Important Relationship

I want this picture permanently in my head:

```text
                    SESSION
                       │
                       │
                       ▼
                 TRANSACTION
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Operation 1  Operation 2  Operation 3
          │            │            │
          └────────────┼────────────┘
                       ▼
                ┌──────┴──────┐
                ▼             ▼
             COMMIT         ABORT
```

That's basically the entire lesson.

---

# 21. A Common Mistake

I might eventually write something like:

```javascript
session.startTransaction();

await collection1.insertOne(data1);

await collection2.updateOne(
    filter,
    update
);
```

and forget to pass the session to the operations.

The important thing I need to remember is:

```javascript
{ session }
```

must be associated with the operations that are intended to participate in the transaction.

So conceptually:

```text
Start Transaction
      ↓
Use SAME session
      ↓
Operation 1
      ↓
Use SAME session
      ↓
Operation 2
      ↓
Use SAME session
      ↓
Commit / Abort
```

---

# 22. What I Understand Now

After this lesson, I should no longer see:

```javascript
session.startTransaction();
```

as some random MongoDB command.

I should understand:

```text
Session
   ↓
provides context

Transaction
   ↓
groups related operations

Operations
   ↓
use the session

Commit
   ↓
success

Abort
   ↓
failure

End Session
   ↓
finished
```

---

# 23. My Final Mental Model

If I have to explain this lesson to myself in one paragraph:

> **A MongoDB session provides a logical context for database operations. A transaction runs inside that session and groups multiple operations into one unit of work. I start a session, start a transaction, perform the required operations using that session, and then either commit if everything succeeds or abort if something fails. After I'm finished, I end the session.**

The whole thing:

```text
START SESSION
      ↓
START TRANSACTION
      ↓
OPERATIONS
      ↓
 ┌────┴────┐
 ▼         ▼
SUCCESS   FAILURE
 │         │
 ▼         ▼
COMMIT    ABORT
 └────┬────┘
      ▼
END SESSION
```

---

# What I Should Remember

If I forget everything else from this lesson, I want these points:

```text
1. Session = logical context

2. Transaction runs inside a session

3. Session ≠ Transaction

4. Transaction operations use the same session

5. Success → COMMIT

6. Failure → ABORT

7. Finished → END SESSION
```

And my favorite one-line memory trick:

> **Session gives me the context; transaction gives me the unit of work.**

---

# Self-Test

Before moving to Lesson 3, I should be able to answer these without looking:

### 1. What is a MongoDB session?

### 2. Is a session the same thing as a transaction?

### 3. Why does a transaction run inside a session?

### 4. Why do I pass `{ session }` to database operations?

### 5. What happens when I commit?

### 6. What happens when I abort?

### 7. What is the complete transaction lifecycle?

### 8. What happens if I accidentally execute an operation without the transaction's session?

### 9. What is the difference between a connection and a session?

### 10. Can I have a session without an active transaction?

If I can explain this without looking:

```text
Session
   ↓
Transaction
   ↓
Operations
   ↓
Commit / Abort
   ↓
End Session
```

then I understand the foundation of MongoDB transaction sessions.

---

# Next Lesson

Now I know **why transactions exist** and **how sessions provide their context**.

So now I'm ready to actually use them.

## Lesson 3 — Starting, Committing & Aborting Transactions

This is where I'll move from:

```text
"I understand transactions"
```

to:

```text
"I can actually write one."
```
