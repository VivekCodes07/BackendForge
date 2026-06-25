# TTL Indexes (Time To Live)

## Why Am I Learning This?

Up until now, every index I've learned had one primary purpose:

```text
Make MongoDB find data faster.
```

Examples:

* Single Field Indexes
* Compound Indexes
* Unique Indexes
* Multikey Indexes
* Text Indexes
* Covered Queries

Every lesson was focused on query performance.

The goal was always:

```text
Avoid COLLSCAN
↓
Use IXSCAN
↓
Get results faster
```

So when I first heard about TTL Indexes, I naturally assumed:

> "Cool, another index that speeds up queries."

But TTL Indexes are completely different.

In fact, their primary purpose is not query performance at all.

TTL Indexes exist to automatically remove data when it becomes useless.

That sounds simple, but it's an incredibly powerful feature in real applications.

---

# The Problem TTL Indexes Solve

Imagine I'm building real-world applications.

Maybe:

* Netflix
* Instagram
* Udemy
* Amazon
* ChatGPT

These applications constantly generate temporary data.

Examples:

### OTPs

```javascript
db.otps.insertOne({
    email: "vivek@gmail.com",
    otp: "834291",
    createdAt: new Date()
})
```

### Password Reset Tokens

```javascript
db.passwordResetTokens.insertOne({
    email: "vivek@gmail.com",
    token: "reset_token_x7k92m",
    createdAt: new Date()
})
```

### Login Sessions

```javascript
db.sessions.insertOne({
    userId: ObjectId("685c9a41c6f4f56e2a1b101"),
    sessionId: "sess_x8k29p",
    createdAt: new Date()
})
```

Now I need to ask:

```text
Should these documents remain forever?
```

Obviously not.

An OTP generated yesterday is useless.

A password reset token from last week is dangerous.

A login session from a month ago should probably no longer exist.

Eventually these documents need to be deleted.

---

# How Would I Solve This Without TTL?

If MongoDB didn't support TTL Indexes, I would have to write cleanup logic myself.

Maybe a cron job.

Maybe a background worker.

Maybe a scheduled script.

Something like:

```javascript
db.otps.deleteMany({
    createdAt: {
        $lt: new Date(Date.now() - 5 * 60 * 1000)
    }
})
```

And I'd need to run this repeatedly.

Maybe every minute.

Maybe every five minutes.

That means:

```text
More code
More maintenance
More bugs
More infrastructure
```

MongoDB gives me a much simpler solution.

---

# What Is A TTL Index?

TTL stands for:

```text
Time To Live
```

A TTL Index tells MongoDB:

```text
This document has an expiration time.

When that time arrives,
remove it automatically.
```

MongoDB continuously checks for expired documents and deletes them.

No cleanup scripts.

No cron jobs.

No manual maintenance.

---

# Real Life Analogy

Think about a movie ticket.

```text
Valid Until:
10:00 PM
```

After 10:00 PM:

```text
Ticket expires.
```

Nobody manually invalidates every ticket.

Time itself makes it invalid.

TTL Indexes work exactly the same way.

Documents are given a lifetime.

When that lifetime ends, MongoDB removes them.

---

# My First TTL Index

Let's build an OTP system.

When a user requests an OTP:

```javascript
db.otps.insertOne({
    email: "vivek@gmail.com",
    otp: "834291",
    purpose: "Login Verification",
    createdAt: new Date()
})
```

Stored document:

```javascript
{
    _id: ObjectId("685c9a41c6f4f56e2a1b111"),
    email: "vivek@gmail.com",
    otp: "834291",
    purpose: "Login Verification",
    createdAt: ISODate("2026-06-25T10:00:00Z")
}
```

This OTP should only remain valid for 5 minutes.

So I create:

```javascript
db.otps.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 300
    }
)
```

MongoDB interprets this as:

```text
Keep OTP documents alive for 5 minutes.

After that,
remove them automatically.
```

---

# Understanding expireAfterSeconds

This is the most important TTL option.

Example:

```javascript
expireAfterSeconds: 60
```

means:

```text
Delete after 1 minute
```

---

```javascript
expireAfterSeconds: 300
```

means:

```text
Delete after 5 minutes
```

---

```javascript
expireAfterSeconds: 1800
```

means:

```text
Delete after 30 minutes
```

---

```javascript
expireAfterSeconds: 3600
```

means:

```text
Delete after 1 hour
```

---

```javascript
expireAfterSeconds: 86400
```

means:

```text
Delete after 24 hours
```

---

# How MongoDB Thinks Internally

Suppose MongoDB sees:

```javascript
{
    otp: "834291",
    createdAt: ISODate("2026-06-25T10:00:00Z")
}
```

TTL:

```javascript
expireAfterSeconds: 300
```

MongoDB calculates:

```text
10:00 AM + 5 minutes
```

↓

```text
10:05 AM
```

After that moment:

```text
Document is considered expired.
```

Eventually MongoDB removes it.

---

# Real World Example #1 — OTP System

A user requests an OTP.

Backend stores:

```javascript
db.otps.insertOne({
    email: "vivek@gmail.com",
    otp: "981234",
    purpose: "Login Verification",
    createdAt: new Date()
})
```

Document:

```javascript
{
    _id: ObjectId("685c9a41c6f4f56e2a1b201"),
    email: "vivek@gmail.com",
    otp: "981234",
    purpose: "Login Verification",
    createdAt: ISODate("2026-06-25T10:00:00Z")
}
```

TTL Index:

```javascript
db.otps.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 300
    }
)
```

MongoDB thinks:

```text
OTPs should only be valid for 5 minutes.
```

Perfect use case.

---

# Real World Example #2 — Password Reset Tokens

User clicks:

```text
Forgot Password
```

Backend generates:

```javascript
db.passwordResetTokens.insertOne({
    userId: ObjectId("685c9a41c6f4f56e2a1b301"),
    email: "vivek@gmail.com",
    token: "reset_token_x7k92m",
    createdAt: new Date()
})
```

Stored document:

```javascript
{
    _id: ObjectId("685c9a41c6f4f56e2a1b302"),
    userId: ObjectId("685c9a41c6f4f56e2a1b301"),
    email: "vivek@gmail.com",
    token: "reset_token_x7k92m",
    createdAt: ISODate("2026-06-25T10:00:00Z")
}
```

Create TTL:

```javascript
db.passwordResetTokens.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 1800
    }
)
```

MongoDB interprets:

```text
Keep reset tokens for 30 minutes.

After that,
remove them automatically.
```

---

# Real World Example #3 — Login Sessions

Imagine Netflix.

User logs in.

MongoDB stores:

```javascript
db.sessions.insertOne({
    userId: ObjectId("685c9a41c6f4f56e2a1b401"),
    device: "MacBook Pro",
    browser: "Chrome",
    sessionId: "sess_x8k29p",
    createdAt: new Date()
})
```

Stored document:

```javascript
{
    _id: ObjectId("685c9a41c6f4f56e2a1b402"),
    userId: ObjectId("685c9a41c6f4f56e2a1b401"),
    device: "MacBook Pro",
    browser: "Chrome",
    sessionId: "sess_x8k29p",
    createdAt: ISODate("2026-06-25T10:00:00Z")
}
```

Create TTL:

```javascript
db.sessions.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 86400
    }
)
```

MongoDB thinks:

```text
Keep this session alive for 24 hours.

Then clean it up automatically.
```

---

# Real World Example #4 — Search Cache

Suppose my backend caches search results.

Store:

```javascript
db.searchCache.insertOne({
    query: "mongodb indexing",
    results: [
        "Single Field Indexes",
        "Compound Indexes",
        "Covered Queries"
    ],
    createdAt: new Date()
})
```

Document:

```javascript
{
    _id: ObjectId("685c9a41c6f4f56e2a1b501"),
    query: "mongodb indexing",
    results: [
        "Single Field Indexes",
        "Compound Indexes",
        "Covered Queries"
    ],
    createdAt: ISODate("2026-06-25T10:00:00Z")
}
```

Create TTL:

```javascript
db.searchCache.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 600
    }
)
```

MongoDB thinks:

```text
Cache is only useful temporarily.

Delete it after 10 minutes.
```

---

# The Most Important Requirement

TTL Indexes only work properly on:

```text
Date fields
```

Correct:

```javascript
db.otps.insertOne({
    email: "vivek@gmail.com",
    otp: "123456",
    createdAt: new Date()
})
```

Works perfectly ✅

---

Wrong:

```javascript
db.otps.insertOne({
    email: "vivek@gmail.com",
    otp: "123456",
    createdAt: "25 June 2026"
})
```

This is just a string.

TTL cannot properly calculate expiration.

❌ Wrong approach.

---

# Something That Confused Me

Initially I assumed:

```text
10:05:00
↓
Document disappears instantly
```

But that's not how MongoDB works.

MongoDB runs a background process called the TTL Monitor.

It periodically checks for expired documents.

Therefore:

```text
Expired
≠
Immediately Deleted
```

Deletion is automatic.

But not instantaneous.

This is completely normal.

---

# Viewing TTL Indexes

Create:

```javascript
db.otps.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 300
    }
)
```

Verify:

```javascript
db.otps.getIndexes()
```

Output:

```javascript
{
    key: {
        createdAt: 1
    },
    expireAfterSeconds: 300
}
```

This confirms the TTL Index exists.

---

# Common Beginner Mistakes

## Mistake #1 — Using Strings Instead Of Dates

Wrong:

```javascript
{
    createdAt: "25 June 2026"
}
```

Correct:

```javascript
{
    createdAt: new Date()
}
```

---

## Mistake #2 — Expecting Instant Deletion

MongoDB uses a background cleanup process.

Deletion is automatic but not immediate.

---

## Mistake #3 — Using TTL On Important Business Data

Never do this.

Bad candidates:

```text
Users
Orders
Products
Payments
Transactions
Courses
```

Imagine customer orders disappearing automatically 😂

That would be catastrophic.

---

# When Should I Use TTL?

Excellent candidates:

✅ OTPs

✅ Login Sessions

✅ Verification Tokens

✅ Password Reset Tokens

✅ Cache Data

✅ Temporary Notifications

✅ Temporary Logs

---

Bad candidates:

❌ Users

❌ Products

❌ Orders

❌ Payments

❌ Transactions

❌ Courses

---

# My Mental Model

Whenever I see:

```javascript
db.otps.createIndex(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 300
    }
)
```

I read it as:

```text
MongoDB,

this document has a lifespan.

Keep it alive for 5 minutes.

After that,

clean it up automatically.
```

That's exactly what a TTL Index does.

---

# Quick Revision

TTL stands for:

```text
Time To Live
```

TTL Indexes:

```text
Automatically remove expired documents.
```

Require:

```text
Date fields.
```

Most common use cases:

* OTPs
* Login Sessions
* Verification Tokens
* Password Reset Tokens
* Cache Data

Most important thing I learned:

> Not every index exists to make queries faster.

A TTL Index exists to make data management easier by automatically cleaning up temporary documents when their lifetime expires.
