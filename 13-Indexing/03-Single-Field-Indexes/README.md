# Single Field Indexes

## Why Am I Learning This?

In the previous lesson, I learned how to create indexes using:

```javascript
db.users.createIndex({
    username: 1
})
```

But that raised another question:

> What type of index did I just create?

It turns out MongoDB supports multiple kinds of indexes:

* Single Field Indexes
* Compound Indexes
* Multikey Indexes
* Text Indexes
* TTL Indexes
* Partial Indexes
* Sparse Indexes

The index I created on `username` was a **Single Field Index**.

This is the simplest and most commonly used index in MongoDB.

Before learning advanced indexes, I need to fully understand this one.

---

# What Is A Single Field Index?

A Single Field Index is exactly what its name suggests.

It indexes:

```text
One Field
```

Example:

```javascript
db.users.createIndex({
    username: 1
})
```

Only:

```javascript
username
```

is indexed.

---

# Visualizing The Collection

Suppose my collection contains:

```javascript
{
    username: "alex",
    followers: 500
}

{
    username: "vivek",
    followers: 1200
}

{
    username: "emma",
    followers: 800
}

{
    username: "cristiano",
    followers: 600000000
}
```

Now I create:

```javascript
db.users.createIndex({
    username: 1
})
```

MongoDB builds something conceptually like:

```text
alex        → Document Pointer

cristiano   → Document Pointer

emma        → Document Pointer

vivek       → Document Pointer
```

Notice:

```text
Only username values are indexed.
```

MongoDB does not care about:

```javascript
followers
```

because that field was not indexed.

---

# What Queries Benefit From This Index?

The index helps queries that search using:

```javascript
username
```

Example:

```javascript
db.users.find({
    username: "vivek"
})
```

MongoDB can directly use the index.

---

Another example:

```javascript
db.users.find({
    username: "cristiano"
})
```

Again, MongoDB can use the index.

---

# What Queries Do NOT Benefit?

Suppose I run:

```javascript
db.users.find({
    followers: 1200
})
```

MongoDB cannot use the username index.

Why?

Because the index contains:

```text
username values
```

not:

```text
followers values
```

MongoDB may need a COLLSCAN.

---

# Real World Example

Imagine Instagram stores:

```javascript
{
    username: "cristiano",
    followers: 600000000,
    verified: true
}
```

Users frequently search:

```text
username
```

Therefore:

```javascript
db.users.createIndex({
    username: 1
})
```

makes perfect sense.

---

But indexing:

```javascript
followers
```

might not be as useful if nobody searches users by exact follower count.

Always think:

```text
What queries happen most often?
```

before creating indexes.

---

# One Index Per Important Field

MongoDB allows multiple single field indexes.

Example:

```javascript
db.users.createIndex({
    username: 1
})

db.users.createIndex({
    email: 1
})

db.users.createIndex({
    phone: 1
})
```

Now MongoDB maintains three separate indexes.

---

Conceptually:

### Username Index

```text
alex      → Document

emma      → Document

vivek     → Document
```

### Email Index

```text
alex@gmail.com      → Document

emma@gmail.com      → Document

vivek@gmail.com     → Document
```

### Phone Index

```text
9876543210      → Document

9876543211      → Document
```

Each index works independently.

---

# Ascending vs Descending

Single field indexes can be created in two directions.

### Ascending

```javascript
db.users.createIndex({
    username: 1
})
```

Conceptually:

```text
alex

emma

john

vivek
```

---

### Descending

```javascript
db.users.createIndex({
    username: -1
})
```

Conceptually:

```text
vivek

john

emma

alex
```

---

For basic equality searches:

```javascript
db.users.find({
    username: "vivek"
})
```

both work equally well.

---

# Looking At The Index

To see existing indexes:

```javascript
db.users.getIndexes()
```

Example output:

```javascript
[
  {
    key: { _id: 1 }
  },
  {
    key: { username: 1 }
  }
]
```

MongoDB automatically creates:

```javascript
{ _id: 1 }
```

and I created:

```javascript
{ username: 1 }
```

---

# Verifying Index Usage

Suppose I run:

```javascript
db.users.find({
    username: "vivek"
}).explain("executionStats")
```

If MongoDB uses the index, I should see:

```text
IXSCAN
```

instead of:

```text
COLLSCAN
```

This confirms that MongoDB is actually using the single field index.

---

# When Are Single Field Indexes Enough?

For many applications:

```javascript
db.users.find({
    email: "john@gmail.com"
})
```

or

```javascript
db.products.find({
    sku: "SKU-123"
})
```

or

```javascript
db.orders.find({
    orderId: "ORD-1001"
})
```

a single field index is often all that's needed.

Not every problem requires a compound index.

---

# Common Beginner Mistakes

## Mistake 1

Creating indexes without understanding query patterns.

Always ask:

```text
What fields are searched most frequently?
```

---

## Mistake 2

Thinking an index on username helps searches on followers.

Wrong.

A single field index only helps the indexed field.

---

## Mistake 3

Creating indexes on fields nobody queries.

Unused indexes waste resources.

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

maintain a shortcut for username only.
```

Not:

```text
Maintain a shortcut for the entire document.
```

Only the indexed field gets the shortcut.

---

# Quick Practice

### Create a single field index on email

```javascript
db.users.createIndex({
    email: 1
})
```

---

### Create a single field index on phone

```javascript
db.users.createIndex({
    phone: 1
})
```

---

### Create a descending single field index

```javascript
db.users.createIndex({
    username: -1
})
```

---

# Summary

In this lesson I learned:

✅ What a Single Field Index is

✅ How MongoDB indexes one field

✅ Which queries can use the index

✅ Which queries cannot use the index

✅ Multiple single field indexes can exist

✅ Ascending and descending directions

✅ How to verify index usage

✅ How to think about index design

Most importantly, I learned that a Single Field Index creates a shortcut for exactly one field and helps MongoDB avoid unnecessary collection scans.
