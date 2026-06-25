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

```text
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

# How MongoDB Uses This Index

When I first learned about Compound Indexes, one question came to my mind:

> If MongoDB stores combinations of values, how does that actually help when I run `find()`?

Let's understand it step by step.

Suppose my collection contains:

```javascript
{
    username: "john",
    country: "USA"
}

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

I create the compound index:

```javascript
db.users.createIndex({
    username: 1,
    country: 1
})
```

Conceptually, MongoDB creates another sorted list like this:

```text
alex     USA     → Document

emma     India   → Document

john     USA     → Document

vivek    India   → Document
```

Notice something important:

The original documents stay exactly where they are inside the collection.

MongoDB simply creates another data structure called an **index**.

This index stores:

- The indexed values
- A pointer to the actual document

Think of it as a lookup table.

---

## What Happens During `find()`?

Suppose I execute:

```javascript
db.users.find({
    username: "emma"
})
```

### Without an Index

MongoDB has no shortcut.

It has to check every document one by one.

```text
john    ❌

alex    ❌

emma    ✅

vivek   ❌
```

For a collection containing millions of documents, this becomes expensive.

---

### With the Compound Index

Instead of checking every document, MongoDB first looks at the sorted index.

```text
alex

emma  ← Found

john

vivek
```

Since the index is sorted, MongoDB can quickly jump to the section where `"emma"` is located instead of reading every document.

Once it finds the matching entry, it follows the stored pointer to retrieve the actual document from the collection.

So the process is:

```text
find()

↓

Search the index

↓

Find matching entry

↓

Follow the pointer

↓

Return the document
```

---

## Searching Using Both Fields

Suppose I execute:

```javascript
db.users.find({
    username: "vivek",
    country: "India"
})
```

MongoDB searches for the combination:

```text
vivek     India
```

Once it finds that entry inside the index, it immediately knows which document to fetch.

This is much faster than scanning every document in the collection.

---

## Why Can't It Efficiently Search Only By `country`?

Remember how the index is organized:

```text
alex     USA

emma     India

john     USA

vivek    India
```

Notice the countries.

```text
USA

India

USA

India
```

They are **not grouped together**.

The index is organized by **username first**.

So if I search:

```javascript
db.users.find({
    country: "India"
})
```

MongoDB cannot jump directly to all `"India"` documents because they are scattered throughout the index.

It would have to examine much more of the index, which is why this query is not efficient.

This idea leads directly to one of MongoDB's most important rules: the **Prefix Rule**.

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

Instead of maintaining two separate lookup tables, MongoDB creates one lookup table that stores the combination of values in a specific order.

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

Conceptually, the index looks like:

```text
101    Delivered

101    Pending

102    Delivered

103    Pending
```

Notice that everything is sorted by **customerId first**.

If two documents have the same customerId, they are then sorted by **status**.

The first field determines how the entire index is organized.

---

# Query 1

```javascript
db.orders.find({
    customerId: 101
})
```

Can use the index?

✅ Yes

MongoDB jumps directly to the section where customerId is `101`.

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

MongoDB finds the customerId first and then the matching status.

---

# Query 3

```javascript
db.orders.find({
    status: "Delivered"
})
```

Can use the index efficiently?

❌ Usually No

Why?

Because the index is not organized by status.

It is organized by customerId first.

---

# The Prefix Rule

Consider:

```javascript
db.orders.createIndex({
    customerId: 1,
    status: 1
})
```

MongoDB can efficiently use:

```javascript
{
    customerId: 101
}
```

✅

because the query starts with the first indexed field.

---

MongoDB can also efficiently use:

```javascript
{
    customerId: 101,
    status: "Delivered"
}
```

✅

because it uses the fields in the same order as the index.

---

MongoDB struggles with:

```javascript
{
    status: "Delivered"
}
```

❌

because it skips the first field.

Imagine trying to find everyone from "India" in a phone book that is sorted by people's names.

You cannot jump directly to "India" because the book isn't organized that way.

The same idea applies to compound indexes.

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

```text
customerId
```

or

```text
customerId + status
```

but not:

```text
status alone
```

This is called the:

```text
Prefix Rule
```

One easy sentence to remember is:

> MongoDB can efficiently use a compound index only if the query starts from the first indexed field.

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

MongoDB can:

1. Find all documents with `category = "Laptops"`
2. Return them already sorted by `price`

using the same index.

No additional sorting is required.

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

The query follows the same order as the index, making it a perfect match.

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

is completely different from:

```javascript
{
    status: 1,
    customerId: 1
}
```

The first field always determines how the index is organized.

---

## Mistake 2

Ignoring query patterns.

Always design indexes based on how your application searches for data.

---

## Mistake 3

Creating random compound indexes.

Every field inside a compound index should have a purpose.

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

create a sorted lookup table.

First sort it by customerId.

If multiple documents have the same customerId,

sort those documents by status.

Each entry stores a pointer to the actual document.

When I run find(),

MongoDB searches this lookup table first,

then fetches the matching documents.
```

Thinking about a compound index as a **sorted lookup table** makes it much easier to understand how MongoDB uses it.

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

✅ Why Compound Indexes exist

✅ How MongoDB stores combinations of values

✅ That a Compound Index is a separate sorted lookup table

✅ What happens internally when `find()` uses a Compound Index

✅ Why field order matters

✅ The Prefix Rule

✅ How Compound Indexes improve filtering

✅ How Compound Indexes help sorting

✅ How to design indexes around query patterns

Most importantly, I learned that a Compound Index is **not** just multiple indexes combined together.

It is a **single sorted lookup table** that stores combinations of values in a specific order, along with pointers to the actual documents.

When I run `find()`, MongoDB searches this lookup table first and then retrieves only the matching documents, making queries much faster.