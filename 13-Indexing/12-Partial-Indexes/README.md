# Partial Indexes

## Why Am I Learning This?

So far, whenever I've created an index, MongoDB has indexed **every document** in the collection.

For example:

```javascript
db.users.createIndex({
    email: 1
})
```

MongoDB looks at the collection:

```javascript
{
    name: "Vivek",
    email: "vivek@gmail.com",
    isActive: true
}

{
    name: "Alex",
    email: "alex@gmail.com",
    isActive: false
}

{
    name: "Emma",
    email: "emma@gmail.com",
    isActive: true
}
```

and creates index entries for:

```text
vivek@gmail.com
alex@gmail.com
emma@gmail.com
```

Every document gets indexed.

At first this seems perfectly fine.

But then I started thinking:

> What if I only query a subset of my documents?

Do I really need MongoDB to index everything?

That's exactly the problem Partial Indexes solve.

---

# The Problem

Imagine I'm building Udemy.

Users can either be:

```javascript
{
    name: "Vivek",
    email: "vivek@gmail.com",
    isActive: true
}
```

or

```javascript
{
    name: "Alex",
    email: "alex@gmail.com",
    isActive: false
}
```

Suppose my application only allows active users to login.

Most queries look like:

```javascript
db.users.find({
    email: "vivek@gmail.com",
    isActive: true
})
```

Notice something interesting.

I never search inactive users.

Never.

So if I create:

```javascript
db.users.createIndex({
    email: 1
})
```

MongoDB still indexes:

```text
Active Users
+
Inactive Users
```

Even though half of the index might never be used.

That feels wasteful.

---

# What Is A Partial Index?

A Partial Index tells MongoDB:

```text
Don't index every document.

Only index documents that match a condition.
```

Think of it as:

```text
Collection
↓
Filter Documents
↓
Create Index Only For Those Documents
```

---

# Real Life Analogy

Imagine a library.

There are:

```text
100,000 Books
```

But students only borrow:

```text
Science Books
```

Instead of maintaining a giant catalog for everything,

the librarian creates a special catalog only for:

```text
Science Books
```

Searching becomes easier.

The catalog becomes smaller.

That's exactly what a Partial Index does.

---

# My First Partial Index

Collection:

```javascript
db.users.insertMany([
    {
        name: "Vivek",
        email: "vivek@gmail.com",
        isActive: true
    },
    {
        name: "Alex",
        email: "alex@gmail.com",
        isActive: false
    },
    {
        name: "Emma",
        email: "emma@gmail.com",
        isActive: true
    }
])
```

Now create:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

MongoDB reads this as:

```text
Create an email index.

BUT ONLY

for documents where:

isActive = true
```

---

# How MongoDB Thinks Internally

MongoDB sees:

```javascript
{
    email: "vivek@gmail.com",
    isActive: true
}
```

Indexes it ✅

---

MongoDB sees:

```javascript
{
    email: "alex@gmail.com",
    isActive: false
}
```

Skips it ❌

---

MongoDB sees:

```javascript
{
    email: "emma@gmail.com",
    isActive: true
}
```

Indexes it ✅

---

Result:

```text
vivek@gmail.com
emma@gmail.com
```

Only active users exist in the index.

---

# Why Is This Useful?

Because the index becomes:

```text
Smaller
```

Smaller indexes mean:

```text
Less Storage
Less Memory Usage
Less Maintenance
```

And usually:

```text
Faster Queries
```

for the use case we care about.

---

# Real World Example #1 — Active Users

Users collection:

```javascript
{
    name: "Vivek",
    email: "vivek@gmail.com",
    isActive: true
}

{
    name: "Alex",
    email: "alex@gmail.com",
    isActive: false
}

{
    name: "Emma",
    email: "emma@gmail.com",
    isActive: true
}
```

Create:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

Query:

```javascript
db.users.find({
    email: "vivek@gmail.com",
    isActive: true
})
```

Perfect match.

MongoDB can use the partial index efficiently.

---

# Real World Example #2 — Published Courses

Imagine Udemy courses.

Documents:

```javascript
{
    title: "MongoDB Mastery",
    isPublished: true
}

{
    title: "NodeJS Draft",
    isPublished: false
}
```

Most users search:

```javascript
db.courses.find({
    isPublished: true
})
```

Nobody searches drafts.

Create:

```javascript
db.courses.createIndex(
    {
        title: 1
    },
    {
        partialFilterExpression: {
            isPublished: true
        }
    }
)
```

MongoDB only indexes published courses.

Not drafts.

---

# Real World Example #3 — Completed Orders

Imagine Amazon.

Orders:

```javascript
{
    orderId: "ORD001",
    status: "Delivered"
}

{
    orderId: "ORD002",
    status: "Cancelled"
}

{
    orderId: "ORD003",
    status: "Delivered"
}
```

Suppose reporting queries only care about delivered orders.

Create:

```javascript
db.orders.createIndex(
    {
        orderId: 1
    },
    {
        partialFilterExpression: {
            status: "Delivered"
        }
    }
)
```

MongoDB only indexes delivered orders.

---

# Partial Unique Index

This is one of the coolest use cases.

Suppose inactive users are allowed to have duplicate emails.

But active users must have unique emails.

Create:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

MongoDB thinks:

```text
For active users:
Email must be unique.

For inactive users:
I don't care.
```

Very powerful.

---

# When MongoDB Can Use The Partial Index

This part is important.

Imagine index:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

Query:

```javascript
db.users.find({
    email: "vivek@gmail.com",
    isActive: true
})
```

MongoDB can use the index ✅

---

Query:

```javascript
db.users.find({
    email: "vivek@gmail.com"
})
```

Maybe not.

Why?

Because the query doesn't guarantee:

```javascript
isActive: true
```

MongoDB can't safely assume it.

This confused me initially.

The query generally needs to align with the partial filter condition.

---

# Viewing Partial Indexes

Create:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

View:

```javascript
db.users.getIndexes()
```

Output:

```javascript
{
    key: {
        email: 1
    },
    partialFilterExpression: {
        isActive: true
    }
}
```

This confirms the index exists.

---

# Partial Index vs Normal Index

Normal Index:

```javascript
db.users.createIndex({
    email: 1
})
```

Indexes:

```text
Every Document
```

---

Partial Index:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

Indexes:

```text
Only Matching Documents
```

---

# Common Beginner Mistakes

## Mistake #1

Thinking Partial Indexes work for every query.

They don't.

MongoDB can only use them when the query matches the filter conditions.

---

## Mistake #2

Using Partial Indexes when almost every document qualifies.

Example:

```javascript
{
    isActive: true
}
```

for 99.9% of documents.

In that case the index is almost the same size as a normal index.

Very little benefit.

---

## Mistake #3

Forgetting that documents can move in and out of the index.

Example:

```javascript
{
    isActive: false
}
```

Not indexed.

Later:

```javascript
{
    isActive: true
}
```

Now MongoDB adds it to the index automatically.

---

# When Should I Use Partial Indexes?

Good candidates:

✅ Active Users

✅ Published Courses

✅ Available Products

✅ Delivered Orders

✅ Verified Accounts

✅ Public Content

---

Poor candidates:

❌ When almost every document qualifies

❌ When queries don't match the filter condition

❌ When a normal index already works perfectly

---

# My Mental Model

Whenever I see:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        partialFilterExpression: {
            isActive: true
        }
    }
)
```

I read it as:

```text
MongoDB,

don't waste time indexing everybody.

Only index users that are active.

Ignore the rest.
```

That's exactly what a Partial Index does.

---

# Quick Revision

Partial Index:

```text
Indexes only a subset of documents.
```

Main option:

```javascript
partialFilterExpression
```

Benefits:

✅ Smaller Indexes

✅ Less Storage

✅ Less Memory

✅ Faster Maintenance

✅ Better Targeted Performance

---

Most important thing I learned:

> A normal index says:

```text
Index everything.
```

> A partial index says:

```text
Index only what matters.
```

That's what makes Partial Indexes powerful.
