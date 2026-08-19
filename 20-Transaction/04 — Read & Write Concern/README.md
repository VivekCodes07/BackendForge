# MongoDB Transactions — Lesson 4

## Read Concern & Write Concern

So far, I know how a transaction works:

```text
Session
   ↓
Transaction
   ↓
Operations
   ↓
COMMIT / ABORT
```

But now I have a new question:

> **When my transaction reads something, how trustworthy is that data? And when I write something, how sure am I that MongoDB actually stored it safely?**

That's where **Read Concern** and **Write Concern** come in.

---

# 1. First, Don't Mix Them Up

I can remember them with one simple question.

### Read Concern

> **"What data am I allowed to see?"**

### Write Concern

> **"How much confirmation do I need that my write was accepted/safely acknowledged?"**

So:

```text
READ CONCERN
     ↓
What can I TRUST when reading?

WRITE CONCERN
     ↓
How much do I TRUST the write?
```

That's the foundation.

---

# 2. A Simple Real-World Analogy

Imagine I order something from Amazon.

I check my order:

```text
"Where is my package?"
```

That's a **read**.

I place an order:

```text
"Buy this product."
```

That's a **write**.

Now imagine I ask two different questions.

### While reading:

> "Should I see data that might still be changing?"

That's related to **Read Concern**.

### After writing:

> "How sure should I be that this order has been safely acknowledged?"

That's related to **Write Concern**.

So:

```text
Read  → Read Concern
Write → Write Concern
```

That's much easier to remember than memorizing definitions.

---

# 3. Why Do I Even Need These?

At first, I might think:

> "Why can't MongoDB just read the latest data and write the data? Done."

Because distributed databases aren't always that simple.

MongoDB can have:

```text
Primary
   ↓
Secondaries
```

And data has to move through the system.

So there can be questions like:

```text
"Which version of the data should I see?"
```

and:

```text
"How many members should acknowledge my write?"
```

Those are very different questions.

---

# 4. Read Concern — "What Am I Allowed To See?"

Let's focus on reads first.

Suppose my transaction reads:

```text
Product stock = 10
```

But another operation is changing that stock.

I need some guarantee about **what version of the data I'm seeing**.

That's what Read Concern helps define.

Think:

```text
Database
   │
   ├── Old version
   ├── Current version
   └── Changing version
          ↓
    Read Concern
          ↓
    What can I see?
```

So Read Concern is basically about the **visibility and consistency of data I read**.

---

# 5. The Important Read Concern Levels

For now, I don't need to memorize every MongoDB option.

I mainly need to understand the important ideas.

MongoDB commonly provides levels such as:

```text
local
available
majority
linearizable
snapshot
```

The names look scary.

They're not.

The key is understanding what problem each one is trying to solve.

---

# 6. `local`

Think:

> **"Give me the data currently available here."**

It's more focused on availability than the strongest consistency guarantees.

Very simplified:

```text
Give me what this MongoDB member currently has.
```

So I can remember:

```text
local
 ↓
"What do you have available right now?"
```

---

# 7. `majority`

Now I ask for something stronger.

> **"I want data that has been acknowledged by a majority of the replica set."**

Think:

```text
Primary
   │
   ├── Secondary ✓
   └── Secondary ✓
          ↓
       Majority
```

This is useful when I care more about seeing data that has reached a stronger level of durability/consistency.

The word **majority** is the key.

```text
majority
   ↓
More members agree
   ↓
Stronger guarantee
```

---

# 8. `snapshot`

This one becomes especially interesting for transactions.

Think of it like:

> **"Give my transaction a consistent view of the data."**

Imagine I start reading:

```text
Transaction starts
       ↓
Data snapshot
       ↓
My reads see a consistent view
```

Instead of my transaction feeling like it's looking at a database that is constantly changing underneath it, the reads can be based on a consistent snapshot.

Mental model:

```text
Transaction
     ↓
Snapshot
     ↓
Consistent view
```

This is why `snapshot` is an important concept when studying transactions.

---

# 9. Why Does This Matter?

Imagine I'm processing an order.

At the beginning I read:

```text
Stock = 10
```

Then another operation changes it.

If my transaction suddenly sees a completely different state halfway through the operation, things can get complicated.

I want predictable behavior.

So:

```text
Read Concern
      ↓
Controls the consistency/visibility
of the data my transaction reads
```

---

# 10. Now Write Concern

Let's switch sides.

Read Concern asks:

> **"What am I allowed to see?"**

Write Concern asks:

> **"How much confirmation do I want after writing?"**

Suppose I do:

```javascript
db.orders.insertOne(order)
```

MongoDB receives my write.

But I might care about:

```text
"Has the primary received it?"
```

or:

```text
"Has a majority of the replica set acknowledged it?"
```

Those are different levels of assurance.

---

# 11. Write Concern Mental Model

Think:

```text
Application
     ↓
   Write
     ↓
 MongoDB
     ↓
How much confirmation?
     ↓
Write Concern
```

So Write Concern is basically about **acknowledgement and durability requirements for writes**.

---

# 12. `w`

One important Write Concern option is:

```text
w
```

It controls how many members need to acknowledge the write.

For example:

```text
w: 1
```

means I want acknowledgement from the primary.

Conceptually:

```text
Application
     ↓
Primary
     ↓
ACK ✓
```

---

# 13. `w: "majority"`

Now:

```text
w: "majority"
```

means I want acknowledgement from a majority of the replica set.

For example:

```text
Primary ✓
Secondary ✓
Secondary ✗
```

If there are three voting members:

```text
2 / 3
```

is a majority.

So:

```text
w: "majority"
      ↓
Wait for majority acknowledgement
```

This gives me a stronger durability guarantee than simply waiting for the primary.

---

# 14. `j`

Another Write Concern option is:

```text
j
```

It relates to whether the write has been written to the journal.

Very simplified:

```text
Write
  ↓
Journal
  ↓
More durable acknowledgement
```

I don't need to dive deeply into MongoDB's storage engine internals yet.

The important memory point is:

> **`j` is about journal acknowledgement.**

---

# 15. Read Concern vs Write Concern

This is the comparison I absolutely want to remember:

|               | Read Concern             | Write Concern                           |
| ------------- | ------------------------ | --------------------------------------- |
| Main question | What data can I see?     | How much acknowledgement do I need?     |
| Applies to    | Reads                    | Writes                                  |
| Main idea     | Consistency / visibility | Acknowledgement / durability            |
| Memory trick  | "What can I trust?"      | "Did my write get safely acknowledged?" |

So:

```text
READ
  ↓
Read Concern
  ↓
"What am I seeing?"

WRITE
  ↓
Write Concern
  ↓
"How sure am I about this write?"
```

---

# 16. Now Bring Transactions Into The Picture

This is where things become interesting.

A transaction isn't isolated from all these concerns.

I can have:

```text
Transaction
     │
     ├── Read Concern
     │
     └── Write Concern
```

So when designing a transaction, I'm not only thinking:

```text
"Should I commit?"
```

I can also think:

```text
"How consistent should my reads be?"
"How strongly should my writes be acknowledged?"
```

---

# 17. A Transaction Example

Imagine an e-commerce checkout.

Customer buys the last available product.

My transaction might do:

```text
Read inventory
      ↓
Stock = 1
      ↓
Create order
      ↓
Reduce stock
      ↓
Commit
```

Now imagine another customer is trying to buy the same product at nearly the same time.

Suddenly I care a lot about:

```text
"What version of inventory am I reading?"
```

That's where read consistency becomes important.

And after I write the new stock value:

```text
"How safely has that write been acknowledged?"
```

That's where write concern matters.

---

# 18. One Important Clarification

Read Concern and Write Concern are **not the same thing as transactions**.

Don't think:

```text
Read Concern = Transaction
Write Concern = Transaction
```

Instead:

```text
Transaction
   │
   ├── Groups operations
   │
   ├── Read Concern
   │      ↓
   │   Read consistency
   │
   └── Write Concern
          ↓
       Write acknowledgement
```

They solve different problems.

---

# 19. The Mental Model I Want

Imagine I'm running a restaurant.

### Read Concern

I'm asking the kitchen:

> "What is the current confirmed state of this order?"

### Write Concern

I'm asking:

> "When I submit this order change, how much confirmation do I need that it has been recorded?"

### Transaction

I'm saying:

> "These five changes belong to one order operation. Treat them as one unit."

So:

```text
Transaction
   ↓
"These operations belong together."

Read Concern
   ↓
"What data should I trust?"

Write Concern
   ↓
"How much acknowledgement do I require?"
```

That separation makes the whole topic much easier.

---

# 20. What I Should NOT Do Yet

I don't need to memorize complicated combinations like:

```text
readConcern: { level: "snapshot" }
writeConcern: { w: "majority", j: true }
```

just for the sake of memorization.

I first want to understand the questions behind them.

When I see:

```javascript
readConcern
```

I should think:

> **"How consistent should my reads be?"**

When I see:

```javascript
writeConcern
```

I should think:

> **"How much acknowledgement/durability do I require for my writes?"**

That mental connection is more valuable than memorizing syntax.

---

# 21. The Whole Picture

Now I can see how everything I've learned fits together:

```text
                 TRANSACTION
                      │
          ┌───────────┴───────────┐
          │                       │
        READ                    WRITE
          │                       │
          ▼                       ▼
   READ CONCERN             WRITE CONCERN
          │                       │
          ▼                       ▼
 "What data do I see?"   "How much acknowledgement?"
```

And finally:

```text
                 TRANSACTION
                      │
                      ▼
                COMMIT / ABORT
```

---

# 22. The Most Important Memory Trick

I want these three questions permanently connected:

```text
TRANSACTION
"Which operations belong together?"

READ CONCERN
"What data should I see?"

WRITE CONCERN
"How much acknowledgement do I need?"
```

That's it.

If I remember those three questions, the terminology becomes much easier.

---

# 23. Self-Test

Before moving to the next lesson, I should be able to answer:

### 1. What problem does Read Concern solve?

### 2. What problem does Write Concern solve?

### 3. What is the difference between `local` and `majority` at a high level?

### 4. Why is `snapshot` useful for transactions?

### 5. What does `w` represent?

### 6. What does `w: "majority"` mean?

### 7. What is `j` related to?

### 8. Are Read Concern and Write Concern the same thing as a transaction?

### 9. Why might an e-commerce transaction care about read consistency?

### 10. Can I explain the difference between these three?

```text
Transaction
Read Concern
Write Concern
```

If I can say:

> **Transaction decides which operations belong together. Read Concern influences what my transaction can reliably see. Write Concern influences how strongly my writes need to be acknowledged.**

then I've understood the main idea.

---

# One-Line Memory

> **Transaction = what belongs together. Read Concern = what I see. Write Concern = how strongly my write is acknowledged.**

---

# Next Lesson

Now I know:

```text
Transaction
    ↓
Read Concern
    ↓
Write Concern
```

But there's still a big question.

What happens when:

```text
Transaction A
      ↓
changes some data

Transaction B
      ↓
tries to read/write the same data
```

at almost the exact same time?

Can they interfere?

Can they see each other's changes?

What happens when two transactions fight over the same document?

That's where I'll learn:

# Lesson 5 — Transaction Isolation & Concurrency

This is where MongoDB transactions start becoming really interesting.
