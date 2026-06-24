# Indexes And Sorting

## Why Am I Learning This?

So far, I've learned that indexes help MongoDB find documents faster.

For example:

```javascript
db.users.find({
    username: "vivek"
})
```

MongoDB can use an index on:

```javascript
{
    username: 1
}
```

to quickly locate the document.

That makes sense.

But then I started wondering:

> Can indexes help with sorting too?

Because sorting can become expensive when a collection contains millions of documents.

The answer is:

```text
YES
```

Indexes can help MongoDB sort data without doing extra work.

This is one of the biggest reasons indexes are so powerful.

---

# The Problem

Suppose I'm building YouTube.

My videos collection contains:

```javascript
{
    title: "MongoDB Tutorial",
    views: 1000
}

{
    title: "Node.js Tutorial",
    views: 5000
}

{
    title: "React Tutorial",
    views: 3000
}
```

Now I want to show:

```text
Most Viewed Videos First
```

Query:

```javascript
db.videos.find().sort({
    views: -1
})
```

Expected Result:

```text
5000 Views
3000 Views
1000 Views
```

Looks simple.

But what happens when the collection contains:

```text
100 million videos?
```

Now sorting becomes expensive.

---

# What Happens Without An Index?

Query:

```javascript
db.videos.find().sort({
    views: -1
})
```

MongoDB may need to:

### Step 1

Read documents.

```text
Video A
Video B
Video C
Video D
...
```

### Step 2

Store them temporarily.

### Step 3

Sort them.

### Step 4

Return the result.

This process becomes slower as data grows.

---

# Creating An Index For Sorting

Suppose I create:

```javascript
db.videos.createIndex({
    views: -1
})
```

MongoDB now maintains data in index order.

Conceptually:

```text
5000 → Pointer

3000 → Pointer

1000 → Pointer
```

Now when I run:

```javascript
db.videos.find().sort({
    views: -1
})
```

MongoDB already has the data organized.

No expensive sorting is required.

---

# The Magic

Without Index:

```text
Find Data
       ↓
Sort Data
       ↓
Return Data
```

With Index:

```text
Read Index
       ↓
Return Data
```

The sorting work was already done when MongoDB maintained the index.

---

# Real World Example

Imagine a leaderboard.

Collection:

```javascript
{
    username: "vivek",
    score: 4500
}

{
    username: "alex",
    score: 7000
}

{
    username: "emma",
    score: 6200
}
```

Leaderboard Query:

```javascript
db.players.find().sort({
    score: -1
})
```

Result:

```text
alex
emma
vivek
```

A score index makes this extremely efficient.

---

# Ascending Sorting

Suppose I create:

```javascript
db.products.createIndex({
    price: 1
})
```

Query:

```javascript
db.products.find().sort({
    price: 1
})
```

MongoDB can directly use the index.

Result:

```text
₹100
₹200
₹500
₹1000
```

---

# Descending Sorting

Index:

```javascript
db.products.createIndex({
    price: -1
})
```

Query:

```javascript
db.products.find().sort({
    price: -1
})
```

Result:

```text
₹1000
₹500
₹200
₹100
```

Again, MongoDB can use the index efficiently.

---

# Important Interview Question

Suppose I create:

```javascript
db.products.createIndex({
    price: 1
})
```

Can MongoDB handle:

```javascript
.sort({
    price: -1
})
```

?

Answer:

```text
YES
```

MongoDB can traverse an index in both directions.

So:

```javascript
{
    price: 1
}
```

can support:

```javascript
.sort({ price: 1 })
```

and

```javascript
.sort({ price: -1 })
```

---

# Compound Indexes And Sorting

Suppose I create:

```javascript
db.products.createIndex({
    category: 1,
    price: 1
})
```

MongoDB organizes data:

```text
Category
     ↓
Price
```

---

Query:

```javascript
db.products.find({
    category: "Laptop"
}).sort({
    price: 1
})
```

This is a perfect match.

MongoDB can:

1. Filter by category
2. Sort by price

using the same index.

---

# E-Commerce Example

Products:

```javascript
{
    name: "MacBook Air",
    category: "Laptop",
    price: 90000
}

{
    name: "ThinkPad",
    category: "Laptop",
    price: 80000
}
```

Index:

```javascript
db.products.createIndex({
    category: 1,
    price: 1
})
```

Query:

```javascript
db.products.find({
    category: "Laptop"
}).sort({
    price: 1
})
```

This is exactly the type of query compound indexes are designed for.

---

# Checking If MongoDB Uses The Index

Use:

```javascript
.explain("executionStats")
```

Example:

```javascript
db.products.find().sort({
    price: -1
}).explain("executionStats")
```

Look for:

```text
IXSCAN
```

Good ✅

---

Look for:

```text
COLLSCAN
```

Bad ❌

MongoDB is scanning documents instead of using the index.

---

# Common Beginner Mistakes

## Mistake 1

Thinking indexes only help searching.

Wrong.

Indexes also help sorting.

---

## Mistake 2

Sorting huge collections without indexes.

This can become very expensive.

---

## Mistake 3

Ignoring query patterns.

Always ask:

```text
What field am I sorting on frequently?
```

That field is often a good candidate for an index.

---

# Mental Model

Whenever I create:

```javascript
db.videos.createIndex({
    views: -1
})
```

I read it as:

```text
MongoDB,

keep videos organized by views
so I don't have to sort them later.
```

That mental model explains why indexed sorting is fast.

---

# Quick Practice

Create an index for sorting products by price:

```javascript
db.products.createIndex({
    price: 1
})
```

---

Create an index for sorting videos by views:

```javascript
db.videos.createIndex({
    views: -1
})
```

---

Create a compound index for category and price:

```javascript
db.products.createIndex({
    category: 1,
    price: 1
})
```

---

# Summary

In this lesson I learned:

✅ Why sorting becomes expensive

✅ How MongoDB sorts without indexes

✅ How indexes make sorting faster

✅ Ascending sorting

✅ Descending sorting

✅ Index traversal in both directions

✅ Compound indexes for filtering + sorting

✅ How to verify index usage using explain()

Most importantly, I learned that indexes don't just help MongoDB find data faster.

They also help MongoDB return already-sorted data without performing expensive sorting operations.