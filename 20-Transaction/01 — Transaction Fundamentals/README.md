# MongoDB Transactions — Lesson 1

## Transaction Fundamentals

Before learning MongoDB transaction syntax, I first need to understand **why transactions exist at all**.

If I understand the problem properly, the syntax will become much easier later.

---

# 1. The Problem I Am Trying To Solve

Imagine I am building an e-commerce backend.

A user clicks:

```text
BUY NOW
```

My backend might need to do several things:

```text
1. Create the order
2. Reduce product stock
3. Record the payment
```

These operations are related.

The customer doesn't really want:

```text
Order created       ✓
Stock reduced       ✓
Payment failed      ✗
```

to leave my database in some weird half-finished state.

What I actually want is:

```text
Everything succeeds
       ↓
    COMMIT
```

or:

```text
Something fails
       ↓
    ABORT
       ↓
Discard the transaction's changes
```

That's the problem transactions solve.

---

# 2. My Simple Definition

I can define a transaction as:

> **A transaction is a group of database operations that I want to treat as one logical unit of work.**

The key word is:

```text
ONE
LOGICAL
UNIT
```

For example:

```text
Transfer ₹1000

        TRANSACTION
             │
       ┌─────┴─────┐
       ▼           ▼
  Remove ₹1000   Add ₹1000
    from A         to B
```

These two operations together represent **one money transfer**.

I don't want one to permanently succeed while the other permanently fails.

---

# 3. The "All Or Nothing" Idea

This is the first thing I should remember.

Suppose my transaction contains:

```text
Operation A
Operation B
Operation C
```

I want:

```text
A ✓
B ✓
C ✓
 ↓
COMMIT
```

But if:

```text
A ✓
B ✓
C ✗
```

I don't want:

```text
A ✓
B ✓
C ✗
```

to become my final database state.

Instead:

```text
C fails
   ↓
ABORT
   ↓
Transaction changes are discarded
```

So my mental shortcut is:

```text
TRANSACTION
     │
     ├── Everything succeeds → COMMIT
     │
     └── Something fails     → ABORT
```

---

# 4. Real Example — Bank Transfer

This is probably the easiest example for me to remember.

Suppose:

```text
Account A = ₹10,000
Account B = ₹5,000
```

I transfer:

```text
₹1,000
```

Two things must happen:

```text
A → -₹1,000
B → +₹1,000
```

Before:

```text
A = ₹10,000
B = ₹5,000
```

After:

```text
A = ₹9,000
B = ₹6,000
```

The total is still:

```text
₹15,000
```

Everything is good.

But imagine this:

```text
A → -₹1,000 ✓
B → +₹1,000 ✗
```

Now I would have:

```text
A = ₹9,000
B = ₹5,000
```

Where did the ₹1,000 go?

It disappeared.

That's exactly the kind of problem transactions help prevent.

---

# 5. Transaction = One Unit Of Work

This gives me a very important way of thinking.

I shouldn't ask:

> "Do I have multiple queries?"

I should ask:

> **"Do these operations together represent one unit of work?"**

For example:

```text
Bank Transfer
   │
   ├── Debit A
   └── Credit B
```

Yes.

These belong together.

Another example:

```text
Order Processing
   │
   ├── Create order
   ├── Reduce inventory
   └── Record related state
```

Depending on the design, these may need to succeed together.

So:

```text
Related operations
        ↓
One logical unit
        ↓
Potential transaction
```

---

# 6. ACID

Whenever I hear **database transaction**, I should immediately think:

```text
ACID
```

It means:

```text
A → Atomicity
C → Consistency
I → Isolation
D → Durability
```

These are the four properties associated with reliable transactions.

I don't want to memorize the words without understanding them.

---

# 7. Atomicity

Atomicity means:

> **The transaction behaves as one indivisible unit.**

My easiest memory trick:

```text
ALL
OR
NOTHING
```

Example:

```text
Operation 1 ✓
Operation 2 ✓
Operation 3 ✗
```

The transaction should not simply leave the first two operations permanently committed as part of that failed transaction.

Instead:

```text
FAIL
 ↓
ABORT
 ↓
Transaction changes rolled back
```

So:

```text
Atomicity = All or Nothing
```

---

# 8. Consistency

Consistency means that a successful transaction takes the database from one valid state to another valid state according to the application's/database's rules.

For example:

```text
Account A = ₹10,000
Account B = ₹5,000
```

Transfer:

```text
₹1,000
```

After:

```text
A = ₹9,000
B = ₹6,000
```

The total remains:

```text
₹15,000
```

The system's business rules remain satisfied.

So my shortcut is:

```text
Consistency
     ↓
Valid State
     ↓
Valid State
```

A transaction isn't supposed to magically fix bad business logic.

If my application itself performs an invalid operation that violates a required rule, I still need proper validation and database constraints.

---

# 9. Isolation

Now I reach the interesting part.

Imagine there is only:

```text
iPhone stock = 1
```

At almost the same time:

```text
Customer A → buys 1
Customer B → buys 1
```

Two transactions are running concurrently.

I don't want them to improperly interfere with each other and both think:

```text
Stock = 1
```

is available for them.

Isolation deals with:

> **How concurrent transactions interact with each other.**

My shortcut:

```text
Isolation
    ↓
Concurrent Transactions
    ↓
Controlled Interaction
```

I'll study this much more deeply in later lessons.

---

# 10. Durability

Suppose everything succeeds:

```text
Transaction
    ↓
COMMIT ✓
```

Then the server crashes.

I don't want the committed transaction to simply vanish.

Durability means:

> **Once a transaction is committed, its changes are intended to survive failures according to the database's durability guarantees.**

My shortcut:

```text
COMMIT
  ↓
Changes persist
```

---

# 11. ACID — My Memory Trick

I can remember ACID like this:

```text
A → All or Nothing
C → Valid State
I → Safe Concurrency
D → Survives Commit
```

Or:

```text
       ACID
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
 A      C      I       D
 │      │      │       │
All   Valid   Safe   Survive
or    state   concurrent commit
nothing       work
```

---

# 12. MongoDB And Single Documents

Now comes an important MongoDB-specific point.

MongoDB already provides **atomicity for operations on a single document**.

For example, if I update one document:

```javascript
db.users.updateOne(
    { _id: 1 },
    { $set: { balance: 5000 } }
)
```

I don't automatically need a multi-document transaction just because I am performing an update.

The operation on that single document is atomic.

---

# 13. Then Why Do I Need Transactions?

Because real applications often have related data spread across multiple documents or collections.

For example:

```text
users
   │
   └── User document

orders
   │
   └── Order document

inventory
   │
   └── Product document
```

Now imagine:

```text
Create Order
      +
Reduce Inventory
```

These are two different pieces of data.

If the order succeeds but inventory update fails, I may have an inconsistent business state.

That's where a multi-document transaction can become useful.

---

# 14. Single Document vs Multi-Document

My mental distinction:

### One document

```text
Update one document
       ↓
MongoDB provides
document-level atomicity
```

### Multiple documents

```text
Document A
    +
Document B
    +
Document C
    ↓
Need them to behave
as one unit?
    ↓
Transaction may be appropriate
```

This distinction is extremely important.

---

# 15. A Transaction Does NOT Mean "No Errors"

I should not misunderstand transactions.

A transaction does NOT mean:

```text
Nothing can fail.
```

Errors can still happen:

```text
Network error
Write conflict
Timeout
Server failure
Application error
```

What the transaction gives me is a mechanism to prevent a failed transaction from simply becoming a partially committed unit of work.

So:

```text
Transaction
     ↓
Doesn't prevent all failures
     ↓
Helps handle failures safely
```

---

# 16. The Basic Transaction Lifecycle

For now, I don't need to know MongoDB's exact API.

I just need to understand this:

```text
        START
          │
          ▼
    Begin Transaction
          │
          ▼
     Operation 1
          │
          ▼
     Operation 2
          │
          ▼
     Operation 3
          │
       ┌──┴──┐
       │     │
    Success Failure
       │     │
       ▼     ▼
    COMMIT  ABORT
       │     │
       ▼     ▼
    Keep   Discard
   changes changes
```

This is the fundamental lifecycle.

---

# 17. Transaction From A Backend Perspective

Imagine my backend receives:

```text
POST /orders
```

The user wants to buy something.

My backend might logically do:

```text
Request
   ↓
Start Transaction
   ↓
Check inventory
   ↓
Create order
   ↓
Update inventory
   ↓
Everything okay?
   │
 ┌─┴──────┐
 ▼        ▼
YES       NO
 │        │
 ▼        ▼
COMMIT   ABORT
```

This is how I should start thinking about transactions as a backend developer.

Not:

> "Transaction = some MongoDB command."

Instead:

> **Transaction = a way to protect a business operation that involves multiple related database changes.**

---

# 18. When Should I Use A Transaction?

My rule:

> **I should consider a transaction when multiple database changes represent one logical operation and partial completion would leave the application in an unacceptable state.**

Examples:

```text
Bank transfer
Order + inventory
Seat booking
Wallet transfer
Payment-related state changes
```

But I shouldn't automatically use transactions everywhere.

---

# 19. Why Not Use Transactions Everywhere?

Because transactions aren't free.

They can introduce:

```text
More coordination
More resource usage
More complexity
Potential contention
```

So I should not think:

```text
Every database operation
        ↓
Transaction
```

Instead:

```text
Do these operations
need to succeed/fail together?
        │
   ┌────┴────┐
   │         │
  YES        NO
   │         │
   ▼         ▼
Transaction  Normal operations
```

That's a much better backend mindset.

---

# 20. My Final Mental Model

If someone asks me:

> **"What is a transaction?"**

I should be able to answer:

> **A transaction is a group of related database operations that I treat as one logical unit of work. If everything succeeds, I commit the transaction. If something goes wrong, I abort it so the transaction doesn't leave behind a partially completed result. Transactions are commonly described using the ACID properties: Atomicity, Consistency, Isolation, and Durability.**

My mental picture:

```text
                 TRANSACTION
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Query 1     Query 2     Query 3
          │           │           │
          └───────────┼───────────┘
                      │
                Everything OK?
                 ┌────┴────┐
                 ▼         ▼
               YES         NO
                 │         │
                 ▼         ▼
              COMMIT     ABORT
                 │         │
                 ▼         ▼
            Keep work   Discard work
```

And:

```text
ACID

A → All or Nothing
C → Valid State
I → Safe Concurrency
D → Survives Commit
```

---

# What I Should Remember

If I forget everything else from this lesson, I want to remember these five things:

```text
1. Transaction = One logical unit of work

2. Commit = Keep the transaction's changes

3. Abort = Discard the transaction's changes

4. Atomicity = All or Nothing

5. MongoDB already provides atomicity
   for single-document operations
```

And the most important question I should ask myself is:

> **"If one of these operations fails, would I be okay with the others remaining committed?"**

If the answer is **NO**, that's a strong signal that I need to think about a transaction.

---

# Self-Test

Before moving to Lesson 2, I should be able to explain:

### 1. What problem do transactions solve?

### 2. What does "All or Nothing" mean?

### 3. What are the four ACID properties?

### 4. What's the difference between Atomicity and Consistency?

### 5. What does Isolation protect me from?

### 6. What does Durability mean after a commit?

### 7. Why does MongoDB not need a multi-document transaction for every update?

### 8. When would I consider using a transaction?

### 9. Why shouldn't I blindly put every operation inside a transaction?

### 10. What happens when a transaction fails?

If I can explain this flow without looking at my notes:

```text
START
  ↓
Operations
  ↓
Success → COMMIT
Failure → ABORT
```

and explain **why** I'm doing it, then I understand the foundation of MongoDB Transactions.

---

# Next Lesson

Now that I understand **why transactions exist**, I can finally look at what's happening behind the scenes.

The next question is:

> **"Okay, but how does MongoDB actually keep track of a transaction while I'm performing multiple operations?"**

That takes me to:

**Lesson 2 — Sessions & Transaction Lifecycle**
