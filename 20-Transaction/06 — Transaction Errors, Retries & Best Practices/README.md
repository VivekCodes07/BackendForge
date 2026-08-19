# MongoDB Transactions — Lesson 6

## Errors, Retries & Best Practices

So far, I understand the theory:

```text
Lesson 1 → Why transactions exist
Lesson 2 → Sessions & transaction lifecycle
Lesson 3 → Start / Commit / Abort
Lesson 4 → Read & Write Concern
Lesson 5 → Isolation & Concurrency
```

Now I have a very practical question:

> **What happens when my transaction doesn't go as planned?**

Because in a real backend, I can't assume:

```text
Transaction
   ↓
Everything works
   ↓
COMMIT
```

Sometimes:

```text
Transaction
   ↓
Error
   ↓
Conflict
   ↓
Timeout
   ↓
Temporary failure
```

So now I need to learn how to **handle failures properly**.

---

# 1. First Thing I Need To Understand

A transaction failing does **not automatically mean my application is broken**.

Some failures are expected in a concurrent system.

For example:

```text
Transaction A
      ↓
Updates Product

Transaction B
      ↓
Updates same Product
      ↓
Conflict
```

MongoDB may cause one transaction to fail.

My application needs to be prepared for that.

So I want this mental model:

```text
Transaction
     ↓
Something goes wrong
     ↓
Is it retryable?
   /       \
 YES       NO
  ↓         ↓
Retry      Handle failure
```

---

# 2. Not Every Error Should Be Retried

This is extremely important.

I shouldn't blindly do:

```javascript
while (true) {
    retryTransaction();
}
```

That would be terrible.

Some errors are temporary.

Some errors are permanent.

For example:

```text
Temporary conflict
        ↓
Maybe retry

Invalid data
        ↓
Retry won't help

Business rule failure
        ↓
Retry won't help
```

So the first question after an error should be:

> **"Will trying the exact same operation again have a chance of succeeding?"**

If yes, retry may make sense.

If no, stop.

---

# 3. A Simple Example

Imagine two customers are buying the last product.

```text
Stock = 1
```

Two transactions start:

```text
Transaction A
Transaction B
```

They compete for the same document.

One may succeed:

```text
A → COMMIT
```

while the other may encounter a conflict:

```text
B → ERROR
```

Now B may be able to retry using the new database state.

Conceptually:

```text
B — Attempt 1
       ↓
    Conflict
       ↓
     Retry
       ↓
B — Attempt 2
       ↓
   Fresh state
```

This is very different from an error like:

```text
"Product ID is invalid."
```

Retrying that 100 times won't magically create the product.

---

# 4. What Is A Retry?

A retry simply means:

> **Run the transaction again from the beginning.**

Not:

> "Continue from where I crashed."

This distinction matters.

Suppose:

```text
Operation 1 ✓
Operation 2 ✓
Operation 3 ✗
```

I shouldn't simply start executing Operation 3 again while keeping the old transaction state.

Instead:

```text
Abort old transaction
        ↓
Start a new transaction
        ↓
Run the whole unit of work again
```

Think:

```text
Attempt 1
   ↓
Failure
   ↓
New Attempt
   ↓
Run transaction again
```

---

# 5. Why Start Again?

Because the transaction that failed may no longer be usable.

I want a clean state.

So:

```text
Old transaction
     ↓
ABORT
     ↓
Fresh transaction
     ↓
Try again
```

This is why retry logic normally surrounds the **entire transaction**, not just one database operation.

---

# 6. The Basic Retry Shape

Conceptually:

```javascript
for (let attempt = 1; attempt <= 3; attempt++) {

    const session = client.startSession();

    try {
        session.startTransaction();

        // All transaction operations

        await session.commitTransaction();

        break;

    } catch (error) {

        // Handle / retry if appropriate

    } finally {

        await session.endSession();
    }
}
```

I don't need to memorize this exact code yet.

I need to understand the shape:

```text
Attempt
   ↓
Start session
   ↓
Start transaction
   ↓
Do all work
   ↓
Success?
 /     \
YES     NO
 ↓       ↓
Done   Retry?
          ↓
       New attempt
```

---

# 7. Why Limit The Number Of Retries?

Imagine I retry forever:

```text
Attempt 1 → Fail
Attempt 2 → Fail
Attempt 3 → Fail
Attempt 4 → Fail
...
Attempt 999999 → Fail
```

My backend could get stuck wasting resources.

So I should usually have a retry limit.

For example:

```text
Maximum attempts = 3
```

Then:

```text
Attempt 1 → Fail
Attempt 2 → Fail
Attempt 3 → Fail
        ↓
Stop
        ↓
Return error
```

The exact number depends on the application.

The important principle is:

> **Retries should be bounded.**

---

# 8. Retry Does Not Mean "Ignore Errors"

This is a mistake I don't want to make.

Bad thinking:

```text
Error?
 ↓
Retry everything
```

Better thinking:

```text
Error
 ↓
Understand the error
 ↓
Is it retryable?
 /          \
YES          NO
 ↓            ↓
Retry       Fail properly
```

This is a much more production-minded way of thinking.

---

# 9. MongoDB Transaction Error Labels

MongoDB can attach error labels that help applications understand how to react to transaction failures.

Two important concepts I should know are:

```text
TransientTransactionError
```

and:

```text
UnknownTransactionCommitResult
```

The names are long, but the ideas are actually simple.

---

# 10. `TransientTransactionError`

Think:

> **"The transaction failed because of something temporary, so retrying the transaction may succeed."**

Conceptually:

```text
Transaction
     ↓
Temporary problem
     ↓
TransientTransactionError
     ↓
Retry transaction
```

For example, a concurrency conflict may result in a retryable transaction failure.

The key word is:

```text
Transient
```

Meaning:

> Temporary.

---

# 11. `UnknownTransactionCommitResult`

This one is more interesting.

Imagine:

```text
Transaction
     ↓
All operations succeed
     ↓
COMMIT is sent
     ↓
Something goes wrong with communication
```

Now my application doesn't know:

> **"Did MongoDB actually commit it or not?"**

That's the scary part.

For example:

```text
Application
     ↓
"COMMIT"
     ↓
MongoDB
     ↓
Network problem
     ↓
Application doesn't know result
```

The transaction may have committed.

Or the application may simply not have received the response.

That's why MongoDB has the concept:

```text
UnknownTransactionCommitResult
```

The important idea is:

> **The commit result is unknown to the client.**

This is different from:

```text
Transaction definitely failed.
```

---

# 12. Why Is Unknown Commit Result Important?

Imagine I create an order:

```text
Order #1001
```

The transaction commits.

But the response gets lost.

My application sees:

```text
ERROR
```

I might incorrectly think:

> "The order wasn't created."

But MongoDB may actually have committed it.

If I blindly retry the entire business operation, I might accidentally create:

```text
Order #1001
Order #1002
```

for the same purchase.

So retrying transactions isn't just:

> "Run it again."

I also need to think about **duplicate effects**.

---

# 13. This Leads To An Important Backend Concept

I want my operations to be **idempotent** where appropriate.

In simple words:

> **Repeating the same request shouldn't accidentally perform the business action multiple times.**

For example, imagine:

```text
POST /payments
```

If my backend receives the same payment request twice, I don't want:

```text
₹1,000 charged
₹1,000 charged again
```

I want the system to recognize:

```text
"Hey, this is the same request."
```

and avoid creating a duplicate effect.

This is a broader backend design concept, but transactions make me realize why it matters.

---

# 14. Transaction Retry vs Request Retry

These are not exactly the same thing.

### Transaction retry

```text
Retry the database transaction
```

### Request retry

```text
Client sends the entire HTTP request again
```

For example:

```text
POST /orders
```

The client might retry because it didn't receive a response.

Now I could have:

```text
HTTP Request #1
       ↓
Transaction
       ↓
COMMIT
       ↓
Response lost

HTTP Request #2
       ↓
Same order request again
```

If my backend isn't designed carefully, I could create duplicate business effects.

So I need to separate:

```text
Database transaction retry
```

from:

```text
Whole API request retry
```

---

# 15. Best Practice #1 — Keep Transactions Short

This is one of the most important practical rules.

Bad idea:

```text
Start transaction
      ↓
Call external API
      ↓
Wait 5 seconds
      ↓
Do more work
      ↓
Commit
```

The longer a transaction stays open, the more opportunity there is for:

```text
Conflicts
Locks/contention
Resource usage
Timeouts
```

Instead:

```text
Prepare what I need
      ↓
Start transaction
      ↓
Do necessary DB work
      ↓
Commit
      ↓
Finish
```

My mental rule:

> **Keep the transaction as short as practical.**

---

# 16. Don't Put Unnecessary Work Inside

Suppose I need to create an order.

I don't want:

```text
START TRANSACTION

Query database
↓
Call external API
↓
Send email
↓
Wait
↓
Process image
↓
Update database
↓
COMMIT
```

That's unnecessarily long.

Instead, I want the transaction to contain the database work that actually needs transactional atomicity.

For example:

```text
START TRANSACTION
      ↓
Create Order
      ↓
Update Inventory
      ↓
COMMIT
```

Then external actions can be handled separately when appropriate.

---

# 17. Best Practice #2 — Don't Make Transactions Huge

Suppose I try to update:

```text
10,000 documents
```

inside one transaction.

Maybe that's a sign I'm using a transaction for too much work.

Transactions are meant to represent a **logical unit of work**.

So I should ask:

> **"Do these operations actually need to succeed or fail together?"**

If the answer is no, maybe they shouldn't all be inside one transaction.

---

# 18. Best Practice #3 — Always Handle Failure

I don't want:

```javascript
try {
    // transaction
}
catch {
    // nothing
}
```

I should have a clear strategy.

For example:

```text
Error
 ↓
Abort
 ↓
Check if retryable
 ↓
Retry OR return failure
```

The exact implementation can vary.

The important thing is that transaction failures are part of normal backend error handling.

---

# 19. Best Practice #4 — Don't Retry Forever

Remember:

```text
Attempt 1
Attempt 2
Attempt 3
```

is reasonable.

But:

```text
while (true)
```

is dangerous unless there is an extremely deliberate reason.

A bounded retry policy protects my application from getting stuck.

---

# 20. Best Practice #5 — Keep Business Logic Clear

I don't want transaction code to become:

```text
try
  if
    while
      try
        if
          retry
            catch
              ...
```

to the point where I don't even know what the transaction is doing.

I want the business operation to remain obvious:

```text
Start
 ↓
Create Order
 ↓
Reduce Inventory
 ↓
Commit
```

Error handling should support that flow, not hide it.

---

# 21. A Better Mental Model For Production

Now I can think of a transaction like this:

```text
                START
                  ↓
             Transaction
                  ↓
             Do DB work
                  ↓
              Success?
             /        \
           YES        NO
            ↓          ↓
         COMMIT    Is it retryable?
                     /       \
                   YES       NO
                    ↓         ↓
                  Retry     Fail
                    ↓
             New transaction
```

This is the mental model I want.

---

# 22. A Practical Order Example

Imagine my backend receives:

```text
POST /orders
```

The customer wants to buy one product.

I might do:

```text
Prepare request
      ↓
Start transaction
      ↓
Check/update inventory
      ↓
Create order
      ↓
Commit
```

Now imagine a temporary transaction conflict:

```text
Start transaction
      ↓
Inventory update
      ↓
Conflict
      ↓
Transaction fails
```

My application can potentially:

```text
Abort
 ↓
Start fresh transaction
 ↓
Read fresh state
 ↓
Try again
```

Notice something important:

> **The retry starts from fresh state.**

I'm not continuing with stale assumptions from the failed transaction.

---

# 23. Why Fresh State Matters

Suppose:

```text
Stock = 1
```

My transaction fails because another customer bought it.

If I simply reuse my old assumptions:

```text
"I already know stock = 1."
```

I might make a wrong decision.

After retrying:

```text
New transaction
     ↓
Read current database state
     ↓
Stock = 0
```

Now I know:

```text
"There's no stock left."
```

So a retry isn't just repeating code.

It's getting a **fresh transactional attempt**.

---

# 24. Transactions and External Services

I learned earlier that MongoDB transactions don't automatically roll back:

```text
Stripe
Email
Another API
File upload
```

This becomes even more important when retries are involved.

Imagine:

```text
Transaction attempt 1
       ↓
Call external service
       ↓
Transaction fails
       ↓
Retry
       ↓
Call external service again
```

Now I may have triggered the external action twice.

So I should be very careful about mixing:

```text
MongoDB transactions
+
external side effects
+
automatic retries
```

This is why production systems often use additional patterns for reliable workflows.

I don't need to master those patterns in this lesson.

I just need to recognize the danger.

---

# 25. The Big Picture

At this point, my transaction knowledge looks like:

```text
                    TRANSACTION
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      READ             WRITE          CONCURRENCY
        │                │                │
 Read Concern      Write Concern       Isolation
                                           │
                                           ▼
                                       Conflicts
                                           │
                                           ▼
                                         Errors
                                           │
                                  ┌────────┴────────┐
                                  ▼                 ▼
                               Retry             Stop
```

This is the entire journey.

---

# 26. What I Should Remember About Errors

I want these three situations separated in my head.

### Situation 1 — Transaction definitely failed

```text
Transaction
    ↓
Error
    ↓
ABORT
```

Then I decide whether retrying makes sense.

---

### Situation 2 — Temporary transaction error

```text
Transaction
    ↓
Transient error
    ↓
Retry may succeed
```

---

### Situation 3 — Commit result is unknown

```text
COMMIT sent
     ↓
Network/communication problem
     ↓
"Did it actually commit?"
```

This requires more careful handling.

I shouldn't automatically assume:

```text
Error = definitely not committed
```

---

# 27. My Memory Trick

I can remember the whole lesson with:

```text
FAILURE
   ↓
ASK:
"Can retrying actually help?"
   ↓
 YES ─────→ Retry
   │
   NO
   ↓
Handle failure
```

And:

```text
RETRY
  ↓
Abort old attempt
  ↓
Start fresh transaction
  ↓
Read fresh state
  ↓
Try again
```

---

# 28. Best Practices I Want To Keep

My transaction checklist:

```text
✓ Keep transactions short

✓ Only include operations that need
  to succeed/fail together

✓ Always handle transaction errors

✓ Retry only when appropriate

✓ Keep retries bounded

✓ Start a fresh transaction when retrying

✓ Be careful with external side effects

✓ Think about duplicate operations

✓ Keep business logic understandable
```

These are much more useful to me than memorizing a giant list of MongoDB rules.

---

# 29. Self-Test

Before moving to the final practical lesson, I should be able to answer:

### 1. Why can a transaction fail even when my code is correct?

### 2. What is a retry?

### 3. Why should I retry the whole transaction instead of continuing from the failed operation?

### 4. What is a `TransientTransactionError`?

### 5. What does `UnknownTransactionCommitResult` mean?

### 6. Why shouldn't I retry every error?

### 7. Why should retries be limited?

### 8. Why should transactions be short?

### 9. Why can external API calls become dangerous when combined with transaction retries?

### 10. What is the difference between retrying a transaction and retrying an HTTP request?

If I can explain:

> **A transaction can fail because of temporary conflicts or other problems. I should determine whether the error is retryable, abort the failed attempt, start a fresh transaction, and retry only a limited number of times. I also need to be careful with duplicate side effects and external services.**

then I've understood the important part of this lesson.

---

# One-Line Memory

> **Don't blindly retry errors — identify retryable failures, restart the transaction from fresh state, and keep retries controlled.**

---

# Where I Am Now

My transaction knowledge is now:

```text
Lesson 1
Why transactions?
       ↓
Lesson 2
Sessions
       ↓
Lesson 3
Start / Commit / Abort
       ↓
Lesson 4
Read / Write Concern
       ↓
Lesson 5
Isolation / Concurrency
       ↓
Lesson 6
Errors / Retries / Best Practices
```

There's only one thing left:

> **Can I actually put all of this together in a real backend scenario?**

That's the purpose of the final lesson.

# Lesson 7 — Practical MongoDB Transaction

I'll take everything I've learned and build a realistic transaction flow involving multiple database operations, failure handling, and rollback.
