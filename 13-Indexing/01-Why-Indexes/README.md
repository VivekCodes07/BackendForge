# Why Indexes?

## Why Am I Learning This?

When I first started learning MongoDB, I noticed that people constantly talked about indexes.

```javascript
db.users.createIndex({ username: 1 })
```

Everyone said:

> "Indexes make queries faster."

But that raised a few questions in my mind:

* Why are queries slow in the first place?
* What actually happens when MongoDB searches for data?
* How does an index make things faster?
* Why doesn't MongoDB automatically index every field?

This lesson answers those questions.

---

# The Problem

Let's imagine I am building Instagram.

I have a collection like this:

```javascript
{
    username: "john",
    followers: 100
}

{
    username: "emma",
    followers: 500
}

{
    username: "cristiano",
    followers: 600000000
}

{
    username: "alex",
    followers: 250
}
```

Now a user searches for:

```javascript
db.users.find({
    username: "cristiano"
})
```

MongoDB has to find the document that contains:

```javascript
{
    username: "cristiano"
}
```

But how does it do that?

---

# What Happens Without An Index?

Without an index, MongoDB has no shortcut.

It starts reading documents one by one.

```text
Document 1 → john ❌

Document 2 → emma ❌

Document 3 → cristiano ✅
```

MongoDB stops only after finding the match.

This process is called:

```text
COLLSCAN
```

which means:

```text
Collection Scan
```

MongoDB scans the collection document by document.

---

# Why Is COLLSCAN Expensive?

Imagine Instagram has:

```text
10 users
```

No problem.

Now imagine:

```text
10,000 users
```

Still okay.

Now imagine:

```text
100,000,000 users
```

Things become very different.

If MongoDB must check millions of documents for every search request, the application becomes slower and slower.

---

# Real World Example

Suppose Instagram stores:

```text
500 million users
```

A user searches:

```text
cristiano
```

Without an index MongoDB may have to inspect a huge number of documents before finding the correct user.

This means:

* More CPU usage
* More disk reads
* More memory usage
* Slower response times

Not ideal for a large application.

---

# So What Is An Index?

An index is a special data structure that MongoDB maintains.

Instead of searching every document, MongoDB can search the index.

Think of an index as a shortcut.

---

# Real Life Example

Imagine a 1000-page book.

You want to find:

```text
MongoDB
```

Would you:

### Option A

Read all 1000 pages?

```text
Page 1
Page 2
Page 3
...
Page 1000
```

### Option B

Open the index section of the book?

```text
MongoDB → Page 542
```

Most people choose Option B.

That's exactly what MongoDB does.

---

# MongoDB With An Index

Suppose I create:

```javascript
db.users.createIndex({
    username: 1
})
```

MongoDB creates a structure that conceptually looks like:

```text
alex       → Document Pointer

cristiano  → Document Pointer

emma       → Document Pointer

john       → Document Pointer
```

Notice that the usernames are organized.

MongoDB can now jump directly to:

```text
cristiano
```

instead of checking every document.

---

# What Happens During A Search?

Query:

```javascript
db.users.find({
    username: "cristiano"
})
```

Without an index:

```text
Check Document 1
Check Document 2
Check Document 3
Check Document 4
...
```

With an index:

```text
Look in index
Find cristiano
Jump to document
Return result
```

Much faster.

---

# COLLSCAN vs IXSCAN

MongoDB generally uses two strategies.

## COLLSCAN

```text
Collection Scan
```

MongoDB reads documents one by one.

Example:

```javascript
db.users.find({
    username: "cristiano"
})
```

without an index.

---

## IXSCAN

```text
Index Scan
```

MongoDB uses an index to locate data.

Example:

```javascript
db.users.createIndex({
    username: 1
})

db.users.find({
    username: "cristiano"
})
```

MongoDB can use the username index.

---

# Why Doesn't MongoDB Index Everything?

At first I thought:

```text
If indexes are good,
why not create indexes on every field?
```

Because indexes are not free.

Every index requires:

* Additional storage
* Additional memory
* Additional maintenance

Whenever a document changes:

```javascript
db.users.updateOne(...)
```

MongoDB must update:

1. The document
2. Every affected index

More indexes mean faster reads but slower writes.

---

# Important Trade-Off

Indexes help:

```text
Read Operations
```

Examples:

```javascript
find()

sort()

lookup()
```

But indexes make:

```text
Write Operations
```

slightly slower.

Examples:

```javascript
insertOne()

updateOne()

deleteOne()
```

because MongoDB must keep indexes updated.

---

# How To Think About Indexes

A beginner often thinks:

```text
Indexes make queries faster.
```

That's true.

A better way to think is:

```text
Indexes are shortcuts that MongoDB maintains
so it can avoid scanning every document.
```

---

# Mental Model

Whenever I see:

```javascript
db.users.createIndex({
    username: 1
})
```

I read it as:

```text
MongoDB,

please maintain a shortcut for username
so future searches become faster.
```

---

# Common Beginner Mistakes

## Mistake 1

Thinking indexes store full documents.

Wrong.

Indexes store indexed values and pointers to documents.

---

## Mistake 2

Thinking more indexes are always better.

Wrong.

Too many indexes can hurt write performance.

---

## Mistake 3

Creating indexes before understanding query patterns.

Always ask:

```text
What fields are searched most often?
```

Those fields are usually good index candidates.

---

# Quick Practice

### Question 1

Without an index, how does MongoDB find:

```javascript
{
    username: "vivek"
}
```

Answer:

```text
Using COLLSCAN
by checking documents one by one.
```

---

### Question 2

What is the main purpose of an index?

Answer:

```text
To avoid scanning every document
and make queries faster.
```

---

### Question 3

Which is generally faster?

```text
COLLSCAN
```

or

```text
IXSCAN
```

Answer:

```text
IXSCAN
```

because MongoDB can use the index.

---

# Summary

In this lesson I learned:

✅ What a Collection Scan (COLLSCAN) is

✅ Why queries become slow on large collections

✅ What an index is

✅ How indexes help MongoDB find data faster

✅ The difference between COLLSCAN and IXSCAN

✅ Why indexes are considered shortcuts

✅ Why indexes are not free

✅ Why MongoDB does not index every field automatically

Most importantly, I learned that an index is not magic.

It is simply a data structure that helps MongoDB avoid reading every document in a collection.
