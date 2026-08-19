# MongoDB Transactions — Lesson 7

## Putting Everything Together — A Real Transaction

This is my final lesson on MongoDB Transactions.

Until now, I've learned the individual pieces:

```text id="7q5p1r"
Lesson 1 → Why Transactions?
Lesson 2 → Sessions
Lesson 3 → Commit / Abort
Lesson 4 → Read & Write Concern
Lesson 5 → Isolation & Concurrency
Lesson 6 → Errors, Retries & Best Practices
```

Now I want to answer the most important question:

> **Can I actually use all of this together in a real backend scenario?**

Instead of learning another concept, I'm going to build one complete example.

---

# 1. The Problem I'm Going To Solve

Imagine I have an online store.

A customer wants to buy a product.

My backend needs to do three things:

```text id="5k8x2r"
1. Reduce product stock
2. Create the order
3. Record the payment
```

For example:

```text id="7b4n9m"
Product:
iPhone
Stock = 5
```

Customer buys one.

I want:

```text id="c7d3w2"
Stock: 5 → 4

Order:
Created ✓

Payment:
Recorded ✓
```

But what if something fails?

Suppose:

```text id="8z5m1q"
Stock reduced ✓
Order created ✓
Payment record failed ✗
```

Now my database could be in an inconsistent state.

That's exactly the kind of problem a transaction can help me solve.

---

# 2. What Should Happen?

I want these operations to behave as one unit:

```text id="a9p2x7"
┌─────────────────────────────┐
│        TRANSACTION          │
│                             │
│ Reduce Stock                │
│ Create Order                │
│ Record Payment              │
│                             │
└─────────────────────────────┘
              │
        ┌─────┴─────┐
        ↓           ↓
      SUCCESS      FAILURE
        ↓           ↓
     COMMIT       ABORT
```

If everything succeeds:

```text id="m5k3s8"
COMMIT
```

If something fails:

```text id="r2v7n1"
ABORT
```

So I don't end up with half of the operation completed.

---

# 3. My Collections

For this example, imagine I have three collections:

```text id="x8q4m2"
products
orders
payments
```

A product:

```javascript id="0j4b8s"
{
    _id: ObjectId("..."),
    name: "iPhone",
    price: 80000,
    stock: 5
}
```

An order:

```javascript id="5p2n7c"
{
    _id: ObjectId("..."),
    userId: "user123",
    productId: ObjectId("..."),
    quantity: 1,
    total: 80000
}
```

A payment:

```javascript id="q9v3k6"
{
    _id: ObjectId("..."),
    orderId: ObjectId("..."),
    amount: 80000,
    status: "success"
}
```

Now I have a realistic reason to use a transaction.

---

# 4. Before The Transaction

Suppose the database currently looks like:

```text id="7m4x2q"
Product
--------
iPhone
Stock = 5
```

No order exists yet.

No payment exists yet.

The customer clicks:

```text id="1p6s9d"
BUY NOW
```

My backend receives the request.

---

# 5. Step 1 — Start A Session

I begin with:

```javascript id="6r8w2m"
const session = client.startSession();
```

Remember:

> A session gives my operations a context that can be used for the transaction.

So:

```text id="q5n8v1"
Application
     ↓
Session
```

---

# 6. Step 2 — Start The Transaction

Now:

```javascript id="4m7x9k"
session.startTransaction();
```

My flow becomes:

```text id="t3p8q2"
Application
     ↓
Session
     ↓
Transaction
```

Now I'm ready to perform the related database operations.

---

# 7. Step 3 — Check The Product

First, I need to know whether the product exists and has enough stock.

Conceptually:

```javascript id="w8j2n5"
const product = await products.findOne(
    { _id: productId },
    { session }
);
```

I might then check:

```javascript id="9q4m7x"
if (!product) {
    throw new Error("Product not found");
}

if (product.stock < quantity) {
    throw new Error("Not enough stock");
}
```

Notice the important part:

```javascript id="1n6p3r"
{ session }
```

The operation belongs to the transaction.

---

# 8. Step 4 — Reduce The Stock

Now I reduce the stock:

```javascript id="7x3m9q"
await products.updateOne(
    { _id: productId },
    { $inc: { stock: -quantity } },
    { session }
);
```

Before:

```text id="5q8m2r"
Stock = 5
```

After:

```text id="2n7x4p"
Stock = 4
```

But remember:

> **The transaction hasn't committed yet.**

I'm still inside:

```text id="k6m3q9"
Transaction
```

---

# 9. Step 5 — Create The Order

Now I create the order:

```javascript id="3r8n5x"
const order = await orders.insertOne(
    {
        userId,
        productId,
        quantity,
        total: product.price * quantity
    },
    { session }
);
```

Now the transaction contains:

```text id="x4p7m2"
1. Reduce stock
2. Create order
```

Still no commit.

---

# 10. Step 6 — Create The Payment Record

Now:

```javascript id="8n2q5m"
await payments.insertOne(
    {
        orderId: order.insertedId,
        amount: product.price * quantity,
        status: "success"
    },
    { session }
);
```

Now:

```text id="7m3x9q"
Transaction
   ├── Reduce stock
   ├── Create order
   └── Create payment
```

Everything is part of the same transaction.

---

# 11. Step 7 — Commit

If everything worked:

```javascript id="4q8n2m"
await session.commitTransaction();
```

Now MongoDB is told:

> **"All of these operations succeeded. Make the transaction permanent."**

So:

```text id="w6p3r9"
Reduce stock ✓
Create order ✓
Create payment ✓
       ↓
    COMMIT
       ↓
Changes become permanent
```

---

# 12. What Does The Database Look Like Now?

Before:

```text id="j3m8q1"
Stock = 5
```

After:

```text id="p7x4n2"
Stock = 4
```

And:

```text id="c5r8m3"
Order created ✓
Payment created ✓
```

Everything succeeded together.

---

# 13. Now Let's Break It

This is where transactions become really interesting.

Imagine the payment operation fails:

```text id="4x9m2q"
Reduce stock ✓
Create order ✓
Create payment ✗
```

If I wasn't using a transaction, I could end up with:

```text id="s7p3m8"
Stock reduced
Order exists
Payment missing
```

Now my database tells a strange story.

The customer has an order, but the payment doesn't exist.

---

# 14. What Happens With A Transaction?

The error reaches my `catch` block:

```javascript id="8q2m5x"
catch (error) {
    await session.abortTransaction();
}
```

Now:

```text id="m4r7p1"
Reduce stock ✓
Create order ✓
Create payment ✗
        ↓
      ABORT
```

The transaction's changes are discarded.

So the database goes back to the state before the transaction.

Conceptually:

```text id="n8x3q5"
Stock = 5
No order
No payment
```

That's Atomicity in action.

---

# 15. The Complete Transaction

Now I can see the entire flow:

```javascript id="v3m8q2"
const session = client.startSession();

try {

    session.startTransaction();

    const product = await products.findOne(
        { _id: productId },
        { session }
    );

    if (!product) {
        throw new Error("Product not found");
    }

    if (product.stock < quantity) {
        throw new Error("Not enough stock");
    }

    await products.updateOne(
        { _id: productId },
        { $inc: { stock: -quantity } },
        { session }
    );

    const order = await orders.insertOne(
        {
            userId,
            productId,
            quantity,
            total: product.price * quantity
        },
        { session }
    );

    await payments.insertOne(
        {
            orderId: order.insertedId,
            amount: product.price * quantity,
            status: "success"
        },
        { session }
    );

    await session.commitTransaction();

} catch (error) {

    await session.abortTransaction();

} finally {

    await session.endSession();
}
```

Now I shouldn't look at this as a giant block of syntax.

I should read it as a story.

---

# 16. Reading The Code Like A Story

```text id="q4m7x9"
Start Session
     ↓
Start Transaction
     ↓
Find Product
     ↓
Is product valid?
     │
     ├── NO → Error → ABORT
     │
     └── YES
           ↓
       Reduce Stock
           ↓
       Create Order
           ↓
       Create Payment
           ↓
       Everything worked?
          /        \
        YES         NO
         ↓           ↓
      COMMIT       ABORT
         │           │
         └─────┬─────┘
               ↓
         End Session
```

This flow is much more important than memorizing the syntax.

---

# 17. Now Add Concurrency

But wait.

What if:

```text id="7n3p5x"
Stock = 1
```

and two customers buy at almost the same time?

```text id="q8m2r6"
Customer A → Transaction A
Customer B → Transaction B
```

Now I have:

```text id="r4x9p2"
Transaction A
      ↕
Transaction B
      ↕
Same product
```

This is where Lesson 5 becomes important.

MongoDB has concurrency control, and one transaction may encounter a conflict.

My application must be prepared for the possibility that an attempt fails and may need to be retried.

---

# 18. Add Retry Thinking

My production mental model becomes:

```text id="m7q2x5"
Start Transaction
       ↓
Do Work
       ↓
Success?
   /       \
 YES       NO
  ↓         ↓
COMMIT   Retryable?
            /    \
          YES    NO
           ↓      ↓
         Retry   Fail
```

If retrying:

```text id="x5p8m3"
Abort old attempt
       ↓
Start fresh transaction
       ↓
Read current state
       ↓
Try again
```

I don't simply continue from the point where the old transaction failed.

---

# 19. Why Fresh State Matters

Imagine:

```text id="7r3m9x"
Stock = 1
```

My first transaction reads:

```text id="n4q6p2"
Stock = 1
```

Another customer successfully buys it.

Now:

```text id="c8m2x5"
Stock = 0
```

My original transaction fails.

If I retry correctly, I start a new transaction and read again:

```text id="v7p3q1"
New transaction
      ↓
Read stock
      ↓
Stock = 0
```

Now my application knows:

> "The product is no longer available."

That's much better than blindly using the old state.

---

# 20. What About External Payment APIs?

There's an important detail here.

Suppose I call a real payment provider:

```text id="q5m8x2"
MongoDB Transaction
       ↓
Create Order
       ↓
Call Payment API
       ↓
Payment succeeds
       ↓
MongoDB transaction fails
```

MongoDB can roll back its own changes.

But it cannot magically tell the payment provider:

> "Undo that payment."

So I should be careful about putting external side effects directly inside a transaction.

For this lesson, my `payments` collection represents a **database record**, not necessarily the actual external payment charge.

That distinction is important.

---

# 21. What I Have Actually Learned

Let's stop looking at individual commands.

I now understand the architecture:

```text id="q3m7x9"
                 APPLICATION
                      │
                      ▼
                   SESSION
                      │
                      ▼
                 TRANSACTION
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Stock        Order       Payment
          │           │           │
          └───────────┼───────────┘
                      ▼
               COMMIT / ABORT
```

And if concurrency causes trouble:

```text id="m8q4x2"
Transaction
     ↓
Conflict
     ↓
Error
     ↓
Retry if appropriate
     ↓
Fresh transaction
```

---

# 22. Connecting Everything I've Learned

This is the part I really want to remember.

### Atomicity

```text id="7p3m8q"
Stock
Order
Payment
  ↓
All succeed
or
all fail
```

### Session

```text id="4x8n2m"
Provides the context
for the transaction
```

### Commit

```text id="q6m3r7"
"Everything worked.
Make it permanent."
```

### Abort

```text id="n9p2x5"
"Something failed.
Discard the transaction."
```

### Read Concern

```text id="c4m8q1"
"What data should my transaction see?"
```

### Write Concern

```text id="r7x3m2"
"How strongly should my write be acknowledged?"
```

### Isolation

```text id="p5q9n4"
"How do concurrent transactions interact?"
```

### Retry

```text id="x2m7r8"
"This attempt failed in a way
that may succeed if I try again."
```

---

# 23. My Final Transaction Mental Model

If I forget everything else, I want to remember this:

```text id="v8q3m1"
                  REQUEST
                     ↓
                  SESSION
                     ↓
                TRANSACTION
                     ↓
              ┌──────┴──────┐
              ↓             ↓
            READ           WRITE
              ↓             ↓
        Read Concern   Write Concern
              │             │
              └──────┬──────┘
                     ↓
                DB OPERATIONS
                     ↓
               Everything OK?
                 /       \
               YES       NO
                ↓         ↓
             COMMIT   Is it retryable?
                          /     \
                        YES     NO
                         ↓       ↓
                       RETRY    FAIL
                         ↓
                  Fresh transaction
```

That's the entire concept.

---

# 24. When Should I Actually Use A Transaction?

Now that I've finished the theory, I should not start putting transactions everywhere.

I should ask:

> **"Do these operations need to succeed or fail together?"**

If yes:

```text id="8m3q7x"
Transaction may make sense.
```

For example:

```text id="5p9r2m"
Create order
+
Reduce inventory
```

If reducing inventory succeeds but creating the order fails, I probably don't want that state.

Good transaction candidate.

---

# 25. When Might I Not Need One?

Suppose I simply want to update:

```text id="3x7m8q"
User's lastLogin
```

That's one straightforward operation.

I don't automatically need a multi-operation transaction just because MongoDB supports transactions.

So:

```text id="q4m2p9"
Simple independent operation
        ↓
Probably no transaction needed
```

while:

```text id="n7x3m5"
Multiple related operations
        ↓
Must succeed/fail together
        ↓
Transaction may be appropriate
```

---

# 26. My Transaction Checklist

Before I use a transaction, I can ask:

```text id="r8m2q5"
1. Do these operations belong together?

2. What happens if operation #2 fails
   after operation #1 succeeds?

3. Do I need atomicity here?

4. Could concurrent requests modify
   the same data?

5. What should my transaction be able to read?

6. How should my writes be acknowledged?

7. Could this transaction encounter
   a temporary conflict?

8. If it fails, should I retry?

9. Is the retry bounded?

10. Am I accidentally putting external
    side effects inside the transaction?
```

If I can answer these questions, I'm thinking about transactions like a backend developer rather than just memorizing MongoDB syntax.

---

# 27. Final Self-Test

Before I consider MongoDB Transactions complete, I should be able to explain this scenario without looking at my notes:

> A customer buys a product. My backend needs to reduce inventory and create an order. Two customers may try to buy the same product at the same time. One transaction may encounter a conflict. Explain how I would handle the entire operation.

My answer should sound roughly like:

```text id="k3m8q1"
Start a session
      ↓
Start a transaction
      ↓
Read/check inventory
      ↓
Update inventory
      ↓
Create order
      ↓
If everything succeeds
      ↓
COMMIT

If a temporary transaction conflict occurs
      ↓
ABORT failed attempt
      ↓
Start a fresh transaction
      ↓
Read current state again
      ↓
Retry a limited number of times

If the error isn't retryable
      ↓
Fail properly
```

If I can explain that flow in my own words, I understand MongoDB Transactions.

---

# 28. What I Can Now Say About MongoDB Transactions

Before this section, I might have thought:

> "Transactions are just `startTransaction()` and `commitTransaction()`."

Now I understand that they're much bigger than that.

I understand:

```text id="p7x3m9"
WHY
 ↓
Atomicity & ACID

HOW
 ↓
Sessions
 ↓
Start
 ↓
Commit / Abort

WHAT DO I SEE?
 ↓
Read Concern

HOW IS MY WRITE ACKNOWLEDGED?
 ↓
Write Concern

WHAT IF OTHER TRANSACTIONS
RUN AT THE SAME TIME?
 ↓
Isolation & Concurrency

WHAT IF SOMETHING FAILS?
 ↓
Errors & Retries

HOW DO I USE ALL OF THIS?
 ↓
Real transaction workflow
```

That's the complete picture.

---

# Final Memory

I want to remember MongoDB Transactions as one sentence:

> **A transaction groups related database operations into one unit, uses a session to manage that work, commits everything when it succeeds, aborts when it fails, handles concurrency carefully, and may retry temporary failures from a fresh transaction.**

---

# MongoDB Transactions — Completed

```text id="z4m8q2"
✓ Lesson 1 — Transaction Fundamentals & ACID
✓ Lesson 2 — Sessions & Transaction Lifecycle
✓ Lesson 3 — Commit & Abort
✓ Lesson 4 — Read & Write Concern
✓ Lesson 5 — Isolation & Concurrency
✓ Lesson 6 — Errors, Retries & Best Practices
✓ Lesson 7 — Practical Transaction
```

I can now move on from **MongoDB Transactions**.

The important thing is not that I memorized every MongoDB option.

The important thing is that I can look at a backend operation and ask:

> **"Do these operations need to succeed together, and what could happen if something goes wrong halfway through?"**

That's when I know I actually understand transactions.
