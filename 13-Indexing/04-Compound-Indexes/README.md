# Compound Indexes

## Why Am I Learning This?

In the previous lesson, I learned about Single Field Indexes.

Example:

```javascript
db.users.createIndex({
    username: 1
})
```

This creates a shortcut for:

```javascript
username
```

and works great for queries like:

```javascript
db.users.find({
    username: "vivek"
})
```

But real-world applications rarely search using only one field.

Most applications filter data using multiple fields at the same time.

Examples:

### E-Commerce

```javascript
db.orders.find({
    customerId: "C101",
    status: "Delivered"
})
```

### Netflix

```javascript
db.movies.find({
    genre: "Sci-Fi",
    year: 2014
})
```

### Instagram

```javascript
db.users.find({
    country: "India",
    verified: true
})
```

This is where Compound Indexes become important.

---

# The Problem

Suppose I have:

```javascript
{
    username: "vivek",
    country: "India"
}

{
    username: "alex",
    country: "USA"
}

{
    username: "emma",
    country: "India"
}
```

And users frequently search:

```javascript
db.users.find({
    username: "vivek",
    country: "India"
})
```

I could create:

```javascript
db.users.createIndex({
    username: 1
})

db.users.createIndex({
    country: 1
})
```

But MongoDB has an even better option.

---

# What Is A Compound Index?

A Compound Index indexes:

```text
More Than One Field
```

Example:

```javascript
db.users.createIndex({
    username: 1,
    country: 1
})
```

Now MongoDB creates a single index that contains both fields.

---

# Visualizing The Index

Collection:

```javascript
{
    username: "alex",
    country: "USA"
}

{
    username: "emma",
    country: "India"
}

{
    username: "vivek",
    country: "India"
}
```

Compound Index:

```javascript
{
    username: 1,
    country: 1
}
```

Conceptually:

```text
alex     USA     → Document

emma     India   → Document

vivek    India   → Document
```

Notice:

```text
MongoDB stores combinations of values.
```

Not separate indexes.

---

# Real World Example

Imagine an e-commerce application.

Orders:

```javascript
{
    customerId: 101,
    status: "Delivered"
}

{
    customerId: 101,
    status: "Pending"
}

{
    customerId: 102,
    status: "Delivered"
}
```

Users frequently query:

```javascript
db.orders.find({
    customerId: 101,
    status: "Delivered"
})
```

A great index would be:

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

---

# Why Not Two Separate Indexes?

Instead of:

```javascript
{
    customerId: 1
}
```

and

```javascript
{
    status: 1
}
```

MongoDB can directly use:

```javascript
{
    customerId: 1,
    status: 1
}
```

because it matches the query pattern.

---

# The Most Important Concept

## Field Order Matters

Suppose I create:

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

MongoDB organizes the index like:

```text
customerId
      ↓
status
```

This order is extremely important.

---

# Query 1

```javascript
db.orders.find({
    customerId: 101
})
```

Can use the index?

✅ Yes

---

# Query 2

```javascript
db.orders.find({
    customerId: 101,
    status: "Delivered"
})
```

Can use the index?

✅ Yes

---

# Query 3

```javascript
db.orders.find({
    status: "Delivered"
})
```

Can use the index efficiently?

❌ Usually No

This leads us to one of MongoDB's most important indexing rules.

---

# The Prefix Rule

Consider:

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

MongoDB can use:

```javascript
{
    customerId: 101
}
```

✅

because it starts from the first field.

---

MongoDB can use:

```javascript
{
    customerId: 101,
    status: "Delivered"
}
```

✅

because it uses both fields.

---

MongoDB struggles with:

```javascript
{
    status: "Delivered"
}
```

❌

because it skips the first field.

---

# Easy Way To Remember

For:

```javascript
{
    customerId: 1,
    status: 1
}
```

MongoDB can efficiently use:

```javascript
customerId
```

or

```javascript
customerId + status
```

but not:

```javascript
status alone
```

This is called:

```text
Prefix Rule
```

and it is one of the most important MongoDB interview topics.

---

# Compound Indexes And Sorting

Suppose:

```javascript
db.products.createIndex({
    category: 1,
    price: 1
})
```

Query:

```javascript
db.products.find({
    category: "Laptops"
}).sort({
    price: 1
})
```

This is powerful because MongoDB can:

1. Filter by category
2. Sort by price

using the same index.

---

# Real Netflix Example

Movies:

```javascript
{
    genre: "Sci-Fi",
    year: 2014
}
```

Query:

```javascript
db.movies.find({
    genre: "Sci-Fi",
    year: 2014
})
```

Index:

```javascript
db.movies.createIndex({
    genre: 1,
    year: 1
})
```

Perfect match.

---

# Common Beginner Mistakes

## Mistake 1

Thinking order doesn't matter.

Wrong.

```javascript
{
    customerId: 1,
    status: 1
}
```

is different from:

```javascript
{
    status: 1,
    customerId: 1
}
```

---

## Mistake 2

Ignoring query patterns.

Always design indexes based on how data is searched.

---

## Mistake 3

Creating random compound indexes.

Every field should have a purpose.

---

# Mental Model

Whenever I see:

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

I read it as:

```text
MongoDB,

first organize data by customerId,

then inside each customerId,

organize it by status.
```

That mental model makes the Prefix Rule much easier to understand.

---

# Quick Practice

### Create a compound index

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

---

### Create a compound index for movies

```javascript
db.movies.createIndex({
    genre: 1,
    year: 1
})
```

---

### Create a compound index for products

```javascript
db.products.createIndex({
    category: 1,
    price: 1
})
```

---

# Summary

In this lesson I learned:

✅ What a Compound Index is

✅ Why compound indexes exist

✅ How MongoDB stores combinations of values

✅ Why field order matters

✅ The Prefix Rule

✅ How compound indexes improve filtering

✅ How compound indexes help sorting

✅ How to design indexes around query patterns

Most importantly, I learned that a Compound Index is not just multiple indexes combined together.

It is a single index that stores multiple fields in a specific order, and that order determines which queries can use it efficiently.
