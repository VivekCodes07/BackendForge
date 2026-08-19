# MongoDB Transactions — Lesson 5

## Transaction Isolation & Concurrency

Until now, I've mostly been thinking about **one transaction at a time**.

But a real backend doesn't work like that.

If 10,000 users are using my application, MongoDB could be handling thousands of operations at the same time.

So now I have a new question:

> **What happens when two transactions want to work with the same data at almost the same time?**

That's what this lesson is about.

---

# 1. First, What Is Concurrency?

Concurrency simply means:

> **Multiple operations are happening around the same time.**

For example:

```text
Transaction A ────────────────
             ↑
Transaction B ────────────────
```

They overlap.

This is completely normal in a backend application.

Imagine Amazon has only **one product left**.

At almost the same moment:

```text
Customer A → BUY
Customer B → BUY
```

Both requests can reach my backend.

Now I have a problem.

---

# 2. The Problem With Two Transactions

Suppose:

```text
Stock = 1
```

Then:

```text
Transaction A → reads Stock = 1
Transaction B → reads Stock = 1
```

Both think:

```text
"Great, the product is available."
```

Now both try to purchase it.

If I don't handle concurrency properly, I could accidentally sell one product twice.

This is why concurrency matters.

---

# 3. Where Does Isolation Come In?

Remember ACID?

```text
A → Atomicity
C → Consistency
I → Isolation
D → Durability
```

I've already learned Atomicity:

> **All operations succeed or none of them do.**

Now I'm focusing on:

> **Isolation**

A simple way I remember it:

```text
Atomicity
    ↓
"Does my transaction happen completely?"

Isolation
    ↓
"How does my transaction interact
with other transactions?"
```

That's the difference.

---

# 4. Transaction A vs Transaction B

Imagine:

```text
Transaction A
    ↓
Read
    ↓
Modify
    ↓
Commit
```

while at the same time:

```text
Transaction B
    ↓
Read
    ↓
Modify
    ↓
Commit
```

So:

```text
Time →

A:  READ ─── MODIFY ─── COMMIT
B:      READ ─── MODIFY ─── COMMIT
```

Their execution overlaps.

MongoDB needs rules for how they interact.

Those rules are part of **isolation and concurrency control**.

---

# 5. The Big Question

Whenever I think about concurrent transactions, I should ask:

> **"What does Transaction B see while Transaction A is still working?"**

For example:

Transaction A changes:

```text
Stock = 10
```

to:

```text
Stock = 9
```

but A hasn't committed yet.

What should Transaction B see?

```text
Stock = 10?
```

or:

```text
Stock = 9?
```

This is the kind of question transaction isolation helps me reason about.

---

# 6. Uncommitted Changes

Suppose Transaction A does:

```text
Stock: 10 → 9
```

but hasn't committed.

That change is still part of A's transaction.

Conceptually:

```text
Transaction A
     ↓
Stock = 9
     ↓
Not committed yet
```

I don't want another transaction to simply assume:

> "9 is definitely the final value."

Because A could still:

```text
COMMIT
```

or:

```text
ABORT
```

If A aborts:

```text
Stock = 10
```

again.

So my mental rule is:

> **Another transaction shouldn't casually treat unfinished transactional changes as committed truth.**

---

# 7. Snapshot — The Useful Mental Model

This connects to the previous lesson.

I learned about:

```text
readConcern: "snapshot"
```

For transactions, I can think of a snapshot as:

> **A consistent view of the data for my transaction's reads.**

Imagine the database looks like this when my transaction starts:

```text
Stock = 10
Price = ₹500
User = Vivek
```

My transaction gets a consistent view:

```text
Transaction
     ↓
  Snapshot
     ↓
Stock = 10
Price = ₹500
User = Vivek
```

Meanwhile, another transaction may be changing data.

My transaction doesn't simply see a random mixture of every change happening around it.

That's why the snapshot concept is useful.

---

# 8. Why Is This Useful?

Imagine I'm checking out on an e-commerce website.

My transaction might need to:

```text
1. Check stock
2. Create order
3. Reduce stock
```

I want these operations to make sense together.

I don't want:

```text
Check stock → sees 1

another transaction changes stock

Reduce stock → suddenly works with a completely
               different state
```

I want predictable transactional behavior.

That's where consistent reads become important.

---

# 9. Now The More Interesting Problem — Write Conflicts

Reading is only half the story.

What if two transactions both want to **modify the same document?**

For example:

```text
Transaction A
      ↓
Update Product 101

Transaction B
      ↓
Update Product 101
```

Now they are competing over the same data.

Conceptually:

```text
Transaction A ──┐
                ↓
             Product
                ↑
Transaction B ──┘
```

This is a **write conflict**.

---

# 10. What Is A Write Conflict?

A write conflict happens when concurrent operations try to make incompatible changes to the same data.

For example:

```text
Balance = ₹10,000
```

Transaction A:

```text
Withdraw ₹7,000
```

Transaction B:

```text
Withdraw ₹6,000
```

Both are trying to modify the same account.

MongoDB can't just blindly allow both to behave as though they independently owned the document.

Some form of coordination is required.

---

# 11. What Happens During A Conflict?

A transaction can encounter a conflict and fail.

Conceptually:

```text
Transaction A
      ↓
Working with document

Transaction B
      ↓
Conflicts with A
      ↓
Transaction B fails
```

Then my application may need to:

```text
Handle error
     ↓
Retry transaction
```

So I get this pattern:

```text
Transaction
     ↓
Conflict
     ↓
Failure
     ↓
Retry
```

I'll learn the retry mechanics properly in the next lesson.

For now, I just need to know **why retries exist**.

---

# 12. Lost Update — A Classic Concurrency Problem

This is one of the easiest ways to understand why concurrency can be dangerous.

Suppose:

```text
Stock = 10
```

Transaction A reads:

```text
10
```

Transaction B also reads:

```text
10
```

A calculates:

```text
10 - 1 = 9
```

B also calculates:

```text
10 - 1 = 9
```

Now imagine both write:

```text
Stock = 9
```

Final result:

```text
Stock = 9
```

But two purchases happened.

I might have expected:

```text
Stock = 8
```

One update effectively got lost.

That's a **lost update** problem.

---

# 13. Why Transactions Alone Aren't The Whole Story

I shouldn't think:

> "I used a transaction, therefore every concurrency problem automatically disappears."

No.

A transaction gives me a unit of work.

But when multiple transactions overlap, I still need to understand:

```text
Concurrency
+
Isolation
+
Conflict handling
```

So:

```text
Transaction
    ↓
Unit of work

Isolation
    ↓
Rules for interaction

Conflict handling
    ↓
What happens when they collide
```

---

# 14. Atomicity vs Isolation

These two are easy to confuse.

### Atomicity

```text
Transaction A
     ↓
Operation 1 ✓
Operation 2 ✗
     ↓
ABORT
```

Meaning:

> **Don't leave a partially completed transaction.**

### Isolation

```text
Transaction A
       ↕
Transaction B
```

Meaning:

> **Control how concurrent transactions interact.**

So:

```text
Atomicity → All or nothing

Isolation → Safe interaction between concurrent work
```

---

# 15. Isolation vs Consistency

These also sound similar.

### Consistency

The database should remain in a valid state according to its rules.

### Isolation

Concurrent transactions should interact according to the database's transaction semantics.

So I remember:

```text
Consistency
     ↓
Valid state

Isolation
     ↓
Interaction between transactions
```

---

# 16. Another Example — Bank Account

Suppose:

```text
Account balance = ₹10,000
```

Two withdrawals happen almost simultaneously.

```text
Transaction A → withdraw ₹7,000
Transaction B → withdraw ₹6,000
```

Without proper concurrency handling, both could start with the assumption:

```text
₹10,000 available
```

But together they are requesting:

```text
₹13,000
```

The database and my application need to handle this situation safely.

The important lesson isn't:

> "Transaction A always wins."

or:

> "Transaction B always wins."

The important lesson is:

> **Concurrent transactions touching the same data can conflict, and my application must be prepared for that.**

---

# 17. What I Should NOT Assume

I shouldn't assume:

```text
Transaction A starts first
        ↓
Transaction A always finishes first
```

That's not how concurrency works.

Instead:

```text
A starts
B starts
A continues
B continues
A conflicts
B commits
...
```

The actual timing can vary.

That's why backend systems need well-defined concurrency rules.

---

# 18. Real-World Example — Last Product

Imagine Amazon has:

```text
Stock = 1
```

Two customers click **Buy Now**.

```text
Customer A
    ↓
Transaction A

Customer B
    ↓
Transaction B
```

Both interact with the same inventory document.

Conceptually:

```text
                 Stock = 1
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    Transaction A          Transaction B
          │                     │
          └──────────┬──────────┘
                     ▼
                CONFLICT?
```

MongoDB's concurrency mechanisms help ensure these competing operations don't simply overwrite each other incorrectly.

But I still need to design my transaction correctly.

The database can't fix a badly designed business workflow.

---

# 19. Why Retry Logic Exists

Suppose my transaction fails because another transaction was modifying the same data.

That doesn't necessarily mean:

```text
"Never try again."
```

Sometimes it means:

```text
"Your attempt collided with another transaction."
```

So my application may do:

```text
Attempt 1
   ↓
Conflict
   ↓
Retry
   ↓
Attempt 2
   ↓
Success
```

This is why transaction retry logic is an important production concept.

---

# 20. How This Connects To Read Concern

From Lesson 4:

```text
Read Concern
     ↓
What data can my transaction see?
```

Now I can connect it with isolation:

```text
Read Concern
     ↓
Consistency of what I read

Isolation
     ↓
How concurrent transactions interact
```

And snapshot gives me a useful mental model:

```text
Transaction
     ↓
Consistent snapshot
     ↓
Predictable reads
```

---

# 21. How This Connects To Write Concern

Similarly:

```text
Write Concern
     ↓
How strongly is my write acknowledged?
```

while:

```text
Isolation
     ↓
How does my write interact with other transactions?
```

These are related concepts, but they answer different questions.

---

# 22. My Three-Question Framework

When I'm looking at a MongoDB transaction, I can ask three questions:

### Question 1

> **What operations belong together?**

That's:

```text
TRANSACTION
```

### Question 2

> **What data should my transaction see?**

That's:

```text
READ CONCERN
```

### Question 3

> **What happens when another transaction is doing something at the same time?**

That's:

```text
ISOLATION / CONCURRENCY
```

And for writes:

> **How strongly do I want the write acknowledged?**

That's:

```text
WRITE CONCERN
```

---

# 23. The Whole Picture

Now my transaction knowledge looks like this:

```text
                    TRANSACTION
                         │
              ┌──────────┴──────────┐
              │                     │
            READ                   WRITE
              │                     │
              ▼                     ▼
        READ CONCERN          WRITE CONCERN
              │                     │
       What do I see?       How is it acknowledged?
              │
              ▼
         CONCURRENCY
              │
              ▼
          ISOLATION
              │
              ▼
     How do transactions
        interact safely?
```

This is how all the concepts connect.

---

# 24. The One Thing I Really Want To Remember

I don't want to memorize a textbook definition of isolation.

I want this sentence:

> **Isolation is about how multiple transactions interact when they are running concurrently.**

That's enough to anchor the rest of the topic.

---

# 25. My Mental Model

```text
TRANSACTION
"These operations belong together."

CONCURRENCY
"Multiple transactions overlap."

ISOLATION
"How do those transactions interact?"

READ CONCERN
"What data does my transaction see?"

WRITE CONCERN
"How strongly is my write acknowledged?"

WRITE CONFLICT
"Two operations are competing over the same data."

RETRY
"Try the transaction again when a temporary conflict causes failure."
```

---

# 26. Self-Test

Before moving to Lesson 6, I should be able to answer these without looking:

### 1. What does concurrency mean?

### 2. Why can concurrency cause problems?

### 3. What does transaction isolation mean?

### 4. How is isolation different from atomicity?

### 5. What is a write conflict?

### 6. What is a lost update?

### 7. Why is snapshot useful for transaction reads?

### 8. Why can a transaction fail even though my code looks correct?

### 9. Why might I retry a failed transaction?

### 10. Can I explain this relationship?

```text
Concurrency
     ↓
Multiple transactions overlap
     ↓
Possible conflicts
     ↓
Isolation + concurrency control
     ↓
Safe transaction behavior
```

If I can explain that flow in my own words, I understand the important part of this lesson.

---

# One-Line Memory

> **Concurrency means transactions overlap; isolation controls how they interact.**

---

# Next Lesson

Now I understand **why transactions can conflict**.

The next question is:

> **What should my application actually do when a transaction fails?**

I'll learn:

```text
Transaction Error
       ↓
Should I retry?
       ↓
How many times?
       ↓
When should I stop?
       ↓
How should I structure
production transaction code?
```

## Lesson 6 — Transaction Errors, Retries & Best Practices
