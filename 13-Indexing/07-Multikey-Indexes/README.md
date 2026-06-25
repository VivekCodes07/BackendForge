# Multikey Indexes

## Why Am I Learning This?

So far, I've learned about:

* Single Field Indexes
* Compound Indexes

Both work great when a field stores **one value**.

Example:

```javascript
{
    username: "vivek"
}
```

or

```javascript
{
    age: 22
}
```

But in real applications, many fields store **arrays**.

Examples:

### YouTube

```javascript
{
    title: "MongoDB Tutorial",
    tags: ["mongodb", "database", "nosql"]
}
```

### Netflix

```javascript
{
    title: "Interstellar",
    genres: ["Sci-Fi", "Adventure", "Drama"]
}
```

### LinkedIn

```javascript
{
    name: "Vivek",
    skills: ["JavaScript", "Node.js", "MongoDB"]
}
```

Users frequently search using these array values.

Example:

```javascript
db.videos.find({
    tags: "mongodb"
})
```

or

```javascript
db.movies.find({
    genres: "Sci-Fi"
})
```

This is where **Multikey Indexes** become important.

---

# The Problem

Suppose my collection contains:

```javascript
{
    title: "MongoDB Basics",
    tags: ["mongodb", "database", "nosql"]
}

{
    title: "Node.js Crash Course",
    tags: ["nodejs", "javascript"]
}

{
    title: "Docker Guide",
    tags: ["docker", "devops"]
}
```

Now suppose a user searches:

```javascript
db.videos.find({
    tags: "mongodb"
})
```

Without an index, MongoDB has to check every document.

For each document it also has to search inside the array.

```text
Document 1

mongodb ✓

database

nosql

-------------------

Document 2

nodejs

javascript

-------------------

Document 3

docker

devops
```

As the collection grows, this becomes slower.

---

# What Is A Multikey Index?

A Multikey Index is simply an index on a field that contains an array.

Example:

```javascript
db.videos.createIndex({
    tags: 1
})
```

Although I create what looks like a normal index, MongoDB automatically recognizes that `tags` is an array.

Instead of indexing the whole array as one value, MongoDB indexes **every element inside the array**.

This is called a **Multikey Index**.

---

# Visualizing The Index

Collection:

```javascript
{
    title: "MongoDB Basics",
    tags: ["mongodb", "database", "nosql"]
}

{
    title: "Node.js Crash Course",
    tags: ["nodejs", "javascript"]
}
```

I create:

```javascript
db.videos.createIndex({
    tags: 1
})
```

Conceptually, MongoDB creates something like:

```text
database      → MongoDB Basics

javascript    → Node.js Crash Course

mongodb       → MongoDB Basics

nodejs        → Node.js Crash Course

nosql         → MongoDB Basics
```

Notice something important.

MongoDB **does not** store the entire array.

It creates **one index entry for each element inside the array**.

---

# How MongoDB Uses This Index

When I first learned about Multikey Indexes, I wondered:

> If a document has multiple values inside an array, how can one index help me find it?

The answer is simple.

MongoDB creates multiple index entries for the same document.

Suppose I have:

```javascript
{
    title: "MongoDB Basics",
    tags: ["mongodb", "database", "nosql"]
}
```

Conceptually, MongoDB creates:

```text
mongodb   → MongoDB Basics

database  → MongoDB Basics

nosql     → MongoDB Basics
```

One document becomes **multiple index entries**.

---

## What Happens During `find()`?

Suppose I run:

```javascript
db.videos.find({
    tags: "mongodb"
})
```

### Without An Index

MongoDB checks every document.

Then it checks every element inside every array.

```text
Document 1

mongodb ✓

database

nosql

-------------------

Document 2

nodejs

javascript

-------------------

Document 3

docker

devops
```

This becomes expensive for large collections.

---

### With A Multikey Index

MongoDB first looks at the index.

Conceptually:

```text
database

docker

javascript

mongodb  ← Found

nodejs

nosql
```

It quickly finds:

```text
mongodb

↓

MongoDB Basics
```

Then it follows the stored pointer and retrieves the document.

The process becomes:

```text
find()

↓

Search the index

↓

Find matching array value

↓

Follow the pointer

↓

Return the document
```

---

# One Document Can Appear Multiple Times

Suppose I have:

```javascript
{
    title: "Learning Backend",
    tags: [
        "mongodb",
        "database",
        "backend"
    ]
}
```

MongoDB creates:

```text
backend   → Learning Backend

database  → Learning Backend

mongodb   → Learning Backend
```

One document.

Three index entries.

This is the key idea behind Multikey Indexes.

---

# Real World Example

Imagine a movie collection.

```javascript
{
    title: "Interstellar",
    genres: [
        "Sci-Fi",
        "Adventure",
        "Drama"
    ]
}
```

Create an index:

```javascript
db.movies.createIndex({
    genres: 1
})
```

MongoDB conceptually creates:

```text
Adventure  → Interstellar

Drama      → Interstellar

Sci-Fi     → Interstellar
```

Now when someone searches:

```javascript
db.movies.find({
    genres: "Sci-Fi"
})
```

MongoDB immediately finds:

```text
Sci-Fi

↓

Interstellar
```

---

# Another Example

LinkedIn profiles:

```javascript
{
    name: "Vivek",
    skills: [
        "JavaScript",
        "MongoDB",
        "Node.js"
    ]
}
```

Index:

```javascript
db.users.createIndex({
    skills: 1
})
```

Conceptually:

```text
JavaScript → Vivek

MongoDB    → Vivek

Node.js    → Vivek
```

Searching:

```javascript
db.users.find({
    skills: "MongoDB"
})
```

MongoDB uses the Multikey Index.

---

# What If Multiple Documents Share The Same Value?

Suppose I have:

```javascript
{
    title: "MongoDB Basics",
    tags: ["mongodb", "database"]
}

{
    title: "Advanced MongoDB",
    tags: ["mongodb", "aggregation"]
}
```

Conceptually:

```text
aggregation → Advanced MongoDB

database    → MongoDB Basics

mongodb     → MongoDB Basics

mongodb     → Advanced MongoDB
```

When I search:

```javascript
db.videos.find({
    tags: "mongodb"
})
```

MongoDB finds both entries.

Then it returns both documents.

---

# Compound + Multikey Indexes

Suppose I create:

```javascript
db.products.createIndex({
    category: 1,
    tags: 1
})
```

Example document:

```javascript
{
    category: "Books",
    tags: [
        "Programming",
        "MongoDB"
    ]
}
```

Conceptually:

```text
Books   Programming

Books   MongoDB
```

MongoDB creates one index entry for each array element while keeping the non-array field the same.

---

# Common Beginner Mistakes

## Mistake 1

Thinking MongoDB stores the entire array as one index entry.

Wrong.

Each array element gets its own index entry.

---

## Mistake 2

Thinking I need a special command to create a Multikey Index.

Wrong.

I simply create a normal index.

If MongoDB detects that the indexed field is an array, it automatically creates a Multikey Index.

Example:

```javascript
db.videos.createIndex({
    tags: 1
})
```

Nothing special is required.

---

## Mistake 3

Thinking one document appears only once in the index.

Wrong.

A single document can appear multiple times if its array contains multiple values.

---

# Mental Model

Whenever I see:

```javascript
{
    tags: [
        "mongodb",
        "database",
        "nosql"
    ]
}
```

I imagine MongoDB expanding it into:

```text
mongodb

↓

Document

----------------

database

↓

Document

----------------

nosql

↓

Document
```

Instead of indexing the whole array, MongoDB indexes every value inside it separately.

That makes searching array values extremely fast.

---

# Quick Practice

### Create a Multikey Index

```javascript
db.videos.createIndex({
    tags: 1
})
```

---

### Create a Multikey Index for movie genres

```javascript
db.movies.createIndex({
    genres: 1
})
```

---

### Create a Multikey Index for user skills

```javascript
db.users.createIndex({
    skills: 1
})
```

---

# Summary

In this lesson I learned:

✅ What a Multikey Index is

✅ Why Multikey Indexes exist

✅ That MongoDB automatically creates a Multikey Index for array fields

✅ How MongoDB stores one index entry for every array element

✅ What happens internally when `find()` searches an array

✅ That one document can appear multiple times inside the index

✅ That I don't need any special command to create a Multikey Index

Most importantly, I learned that MongoDB **does not index an array as a single value**.

Instead, it creates a separate index entry for **every element inside the array**, allowing it to quickly locate documents that contain a matching value.
