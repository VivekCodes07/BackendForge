# MongoDB Transactions — Lesson 3

## Starting, Committing & Aborting a Transaction

In the previous lessons, I understood:

```text
Lesson 1
Why transactions exist
        ↓
Lesson 2
Sessions + transaction lifecycle
```

Now I want to actually understand how I would **start and control a transaction**.

The goal of this lesson is not to memorize MongoDB syntax.

The goal is to understand what my code is actually doing.

---

# 1. The Basic Idea

A transaction follows this pattern:

```text
Start Session
      ↓
Start Transaction
      ↓
Perform Database Operations
      ↓
Everything worked?
    /          \
  YES          NO
   ↓            ↓
COMMIT        ABORT
   \            /
    └────┬─────┘
         ↓
    End Session
```

If I understand this flow, most of the transaction code will make sense.

---

# 2. Starting The Session

First, I create a session:

```javascript
const session = client.startSession();
```

What am I actually doing?

I'm creating a **logical context** that MongoDB can use to associate my database operations.

Think:

```text
My Application
      ↓
   Session
      ↓
Operations
```

At this point, I have a session.

I have **not started a transaction yet**.

---

# 3. Starting The Transaction

Now I start the transaction:

```javascript
session.startTransaction();
```

Now the relationship becomes:

```text
Session
   ↓
Transaction
```

From this point onward, I can perform operations that belong to this transaction.

---

# 4. The Most Important Part — `{ session }`

Suppose I want to update an account:

```javascript
await accounts.updateOne(
    { accountId: "A" },
    { $inc: { balance: -1000 } },
    { session }
);
```

The part I really need to understand is:

```javascript
{ session }
```

I'm telling MongoDB:

> "Run this operation using this session."

That connects the operation to the transaction associated with that session.

So:

```text
SESSION
   ↓
TRANSACTION
   ↓
Operation 1
Operation 2
Operation 3
```

All related operations should use the same session.

---

# 5. Why The Same Session Matters

Imagine a bank transfer:

```text
Account A → -₹1,000
Account B → +₹1,000
```

I want both operations to belong to the same transaction.

So:

```text
             SESSION
                ↓
           TRANSACTION
                ↓
       ┌────────┴────────┐
       ↓                 ↓
   Account A          Account B
   - ₹1,000           + ₹1,000
```

If both succeed:

```text
COMMIT
```

If one fails:

```text
ABORT
```

That's the whole point.

---

# 6. Committing The Transaction

If every operation succeeds:

```javascript
await session.commitTransaction();
```

I'm telling MongoDB:

> "Everything in this transaction was successful. Commit it."

So:

```text
Operation 1 ✓
Operation 2 ✓
Operation 3 ✓
       ↓
     COMMIT
       ↓
Keep the transaction's changes
```

Commit is the successful ending of the transaction.

---

# 7. Aborting The Transaction

Now imagine:

```text
Operation 1 ✓
Operation 2 ✗
```

I don't want the first operation to remain permanently committed if both operations were supposed to represent one unit of work.

So I abort:

```javascript
await session.abortTransaction();
```

Conceptually:

```text
Operation 1 ✓
Operation 2 ✗
       ↓
     ABORT
       ↓
Discard transaction's changes
```

This is where the **Atomicity** concept from Lesson 1 becomes practical.

```text
Atomicity
    ↓
All or Nothing
```

---

# 8. The Basic Node.js Structure

Now I can put everything together:

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

At first, this might look like a lot.

But I can translate it directly into English:

```text
Start a session
      ↓
Try the transaction
      ↓
Perform the operations
      ↓
If everything works → COMMIT
      ↓
If something fails → ABORT
      ↓
Either way → End the session
```

That's all the code is doing.

---

# 9. Why `try`?

```javascript
try {
    // transaction work
}
```

I'm basically saying:

> "Try to complete this entire unit of work."

The operations inside the transaction may succeed or fail.

So I need a way to handle both situations.

---

# 10. Why `catch`?

```javascript
catch (error) {
    await session.abortTransaction();
}
```

If one of my operations throws an error:

```text
Operation fails
      ↓
catch
      ↓
ABORT
```

This prevents me from simply leaving the transaction unfinished.

---

# 11. Why `finally`?

```javascript
finally {
    await session.endSession();
}
```

`finally` runs regardless of whether the transaction succeeded or failed.

So it is a good place for cleanup.

My mental model:

```text
try
 ↓
Do the work

catch
 ↓
Handle failure

finally
 ↓
Clean up
```

---

# 12. Complete Bank Transfer Example

Let's use the easiest example to understand why this matters.

Suppose:

```text
Account A = ₹10,000
Account B = ₹5,000
```

I want to transfer:

```text
₹1,000
```

The transaction needs to perform:

```text
A → -₹1,000
B → +₹1,000
```

Code:

```javascript
const session = client.startSession();

try {
    session.startTransaction();

    await accounts.updateOne(
        { accountId: "A" },
        { $inc: { balance: -1000 } },
        { session }
    );

    await accounts.updateOne(
        { accountId: "B" },
        { $inc: { balance: 1000 } },
        { session }
    );

    await session.commitTransaction();

} catch (error) {

    await session.abortTransaction();

} finally {

    await session.endSession();
}
```

Now I can read the code as a story:

```text
Create session
     ↓
Start transaction
     ↓
Remove ₹1,000 from A
     ↓
Add ₹1,000 to B
     ↓
Everything worked
     ↓
COMMIT
     ↓
End session
```

---

# 13. What If The Second Operation Fails?

Imagine:

```text
A → -₹1,000 ✓
B → +₹1,000 ✗
```

The error takes me here:

```javascript
catch (error) {
    await session.abortTransaction();
}
```

So:

```text
Second operation fails
        ↓
      catch
        ↓
      ABORT
        ↓
Transaction changes discarded
```

I don't want to end up with:

```text
A = ₹9,000
B = ₹5,000
```

because that would mean ₹1,000 effectively disappeared.

Instead, the transaction protects the logical unit of work.

---

# 14. Transaction Boundary

This is another concept I want to remember.

A transaction creates a boundary around a group of operations:

```text
┌─────────────────────────────┐
│         TRANSACTION         │
│                             │
│  Operation 1                │
│  Operation 2                │
│  Operation 3                │
│                             │
└─────────────────────────────┘
              ↓
        COMMIT / ABORT
```

The operations inside this boundary participate in the transaction.

---

# 15. A Common Mistake

Imagine I write:

```javascript
session.startTransaction();

await orders.insertOne(order, { session });

await inventory.updateOne(
    { productId: 101 },
    { $inc: { stock: -1 } }
);
```

Look carefully.

The first operation has:

```javascript
{ session }
```

The second one doesn't.

That means I didn't correctly associate the second operation with the transaction's session.

What I intended:

```text
Transaction
   ├── Create Order
   └── Update Inventory
```

But my code isn't expressing that correctly.

So my rule is:

> **Every database operation that should participate in the transaction must use the same session.**

---

# 16. Another Common Mistake — Forgetting Commit

Starting a transaction doesn't automatically commit it.

For example:

```javascript
session.startTransaction();

await operation1({ session });
await operation2({ session });
```

I still need to finish it.

If everything worked:

```javascript
await session.commitTransaction();
```

Otherwise:

```javascript
await session.abortTransaction();
```

So I should always think:

```text
START
  ↓
WORK
  ↓
FINISH
```

And finishing means:

```text
COMMIT
or
ABORT
```

---

# 17. Another Common Mistake — Forgetting `endSession()`

After I'm finished:

```javascript
await session.endSession();
```

This is cleanup.

So my complete chain is:

```text
startSession()
      ↓
startTransaction()
      ↓
operations
      ↓
commit / abort
      ↓
endSession()
```

I don't want to confuse:

```text
commitTransaction()
```

with:

```text
endSession()
```

They have different jobs.

### Commit

Finishes the transaction successfully.

### Abort

Stops the transaction without committing its changes.

### End Session

Finishes the session context.

---

# 18. Commit vs Abort vs End Session

I can remember them like this:

| Method                | What I am saying                                        |
| --------------------- | ------------------------------------------------------- |
| `startTransaction()`  | "Begin this unit of work."                              |
| `commitTransaction()` | "Everything succeeded. Keep it."                        |
| `abortTransaction()`  | "Something failed. Discard this transaction's changes." |
| `endSession()`        | "I'm finished with this session."                       |

This distinction is important.

---

# 19. MongoDB Transaction ≠ External Rollback

A MongoDB transaction can roll back MongoDB operations that belong to that transaction.

But it cannot magically undo things outside MongoDB.

For example:

```text
MongoDB Transaction
       +
Stripe API
       +
Email
```

Suppose:

```text
MongoDB changes ✓
Stripe payment ✓
MongoDB later fails
```

Aborting the MongoDB transaction does **not** automatically tell Stripe:

```text
"Undo that payment."
```

So:

```text
MongoDB transaction
        ↓
Controls MongoDB transactional operations
```

It doesn't automatically control every action my backend performs.

This becomes important when designing real backend systems.

---

# 20. Real Backend Example

Suppose I have:

```text
POST /orders
```

A customer buys a product.

My backend might need to:

```text
1. Check inventory
2. Create order
3. Reduce inventory
```

I could think of the flow as:

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
Reduce Inventory
      ↓
Everything worked?
    /          \
  YES          NO
   ↓            ↓
COMMIT        ABORT
   \            /
    └────┬─────┘
         ↓
    End Session
```

Now the transaction isn't just some MongoDB feature.

I can see the actual **business problem** it is protecting.

---

# 21. The Most Important Question

Before using a transaction, I should ask:

> **"If one operation succeeds and another fails, would I be okay with the first operation remaining committed?"**

If:

```text
NO
```

then a transaction may be appropriate.

For example:

```text
Debit Wallet
     +
Create Payment Record
```

If the debit succeeds but the payment record fails, I probably don't want to leave the system in that state.

That is a good candidate for transactional thinking.

---

# 22. My Mental Model

I want this picture in my head:

```text
                    SESSION
                       │
                       ▼
                START TRANSACTION
                       │
                       ▼
                  OPERATIONS
                       │
                ┌──────┴──────┐
                ▼             ▼
             SUCCESS        FAILURE
                │             │
                ▼             ▼
             COMMIT         ABORT
                │             │
                └──────┬──────┘
                       ▼
                  END SESSION
```

If I understand this diagram, I understand the basic transaction API flow.

---

# 23. What I Should Remember

If I forget everything else from this lesson:

```text
1. Start a session.

2. Start a transaction inside that session.

3. Perform related operations using the same session.

4. If everything succeeds → COMMIT.

5. If something fails → ABORT.

6. End the session when finished.
```

My memory chain:

```text
startSession()
      ↓
startTransaction()
      ↓
operations({ session })
      ↓
commit / abort
      ↓
endSession()
```

---

# 24. Self-Test

Before moving forward, I should be able to explain these without looking at my notes:

### 1. Why do I start a session?

### 2. Why do I start a transaction inside the session?

### 3. Why do transaction operations use `{ session }`?

### 4. What does `commitTransaction()` mean?

### 5. What does `abortTransaction()` mean?

### 6. Why do I use `try/catch/finally`?

### 7. Why do I call `endSession()`?

### 8. What happens if one operation fails?

### 9. What happens if I forget to pass the session to an operation?

### 10. Can a MongoDB transaction automatically undo an external API call?

If I can explain this flow:

```text
Session
   ↓
Transaction
   ↓
Operations
   ↓
 ┌───────┐
 ↓       ↓
COMMIT  ABORT
   \     /
    \   /
     ↓
End Session
```

then I understand Lesson 3.

---

# One-Line Memory

> **Start the session, start the transaction, do all related work with that session, commit if everything works, abort if something fails, and clean up the session.**

---

# Next Lesson

Now I know how to actually control a transaction.

But there is a bigger question:

> **What happens when two or more transactions are running at the same time?**

For example:

```text
Transaction A
      ↓
Reading / Writing

Transaction B
      ↓
Reading / Writing
```

Can they see each other's changes?

Can they interfere with each other?

What happens when both try to modify the same data?

That takes me into:

## Lesson 4 — Read/Write Concerns & Transaction Isolation
