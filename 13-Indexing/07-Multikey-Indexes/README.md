# Multikey Indexes

## Why Am I Learning This?

So far, every index I've created was on fields containing a single value.

Example:

```javascript
{
    username: "vivek"
}
```

or

```javascript
{
    email: "vivek@gmail.com"
}
```

Creating an index was straightforward:

```javascript
db.users.createIndex({
    username: 1
})
```

But real-world applications often store arrays.

Example:

```javascript
{
    title: "MongoDB Masterclass",
    technologies: [
        "MongoDB",
        "Node.js",
        "Express"
    ]
}
```

Now a question arises:

> How does MongoDB index an array?

Because an array contains multiple values.

This is where Multikey Indexes come in.

---

# The Problem

Imagine I'm building Udemy.

Courses collection:

```javascript
{
    title: "Backend Bootcamp",
    technologies: [
        "Node.js",
        "MongoDB",
        "Express"
    ]
}
```

Another course:

```javascript
{
    title: "Frontend Bootcamp",
    technologies: [
        "React",
        "JavaScript",
        "CSS"
    ]
}
```

A student searches:

```javascript
db.courses.find({
    technologies: "MongoDB"
})
```

MongoDB needs a way to quickly find:

```text
Courses containing MongoDB
```

without scanning every course.

---

# What Is A Multikey Index?

A Multikey Index is an index created on an array field.

Example:

```javascript
db.courses.createIndex({
    technologies: 1
})
```

Since:

```javascript
technologies
```

contains an array,

MongoDB automatically creates a:

```text
Multikey Index
```

---

# Important Fact

I do NOT write:

```javascript
db.courses.createMultikeyIndex(...)
```

There is no such command.

I simply create a normal index:

```javascript
db.courses.createIndex({
    technologies: 1
})
```

MongoDB detects:

```text
This field contains an array.
```

and automatically converts it into a Multikey Index.

---

# How MongoDB Thinks

Document:

```javascript
{
    title: "Backend Bootcamp",
    technologies: [
        "Node.js",
        "MongoDB",
        "Express"
    ]
}
```

MongoDB conceptually creates index entries like:

```text
Node.js     → Document Pointer

MongoDB     → Document Pointer

Express     → Document Pointer
```

Notice:

```text
One document creates multiple index entries.
```

This is the most important idea in this lesson.

---

# Visualizing It

Collection:

```javascript
{
    title: "Backend Bootcamp",
    technologies: [
        "Node.js",
        "MongoDB",
        "Express"
    ]
}

{
    title: "Frontend Bootcamp",
    technologies: [
        "React",
        "JavaScript",
        "CSS"
    ]
}
```

Conceptual Index:

```text
CSS          → Frontend Bootcamp

Express      → Backend Bootcamp

JavaScript   → Frontend Bootcamp

MongoDB      → Backend Bootcamp

Node.js      → Backend Bootcamp

React        → Frontend Bootcamp
```

Now MongoDB can quickly answer:

```javascript
db.courses.find({
    technologies: "MongoDB"
})
```

---

# Real World Example

Suppose Netflix stores:

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

Query:

```javascript
db.movies.find({
    genres: "Sci-Fi"
})
```

A Multikey Index on:

```javascript
genres
```

makes this query fast.

---

# Another Example

Blog Post:

```javascript
{
    title: "MongoDB Indexing",
    tags: [
        "mongodb",
        "database",
        "backend"
    ]
}
```

Index:

```javascript
db.posts.createIndex({
    tags: 1
})
```

Query:

```javascript
db.posts.find({
    tags: "mongodb"
})
```

MongoDB can use the Multikey Index.

---

# Matching Array Elements

Suppose:

```javascript
{
    technologies: [
        "MongoDB",
        "Node.js",
        "Express"
    ]
}
```

Query:

```javascript
db.courses.find({
    technologies: "MongoDB"
})
```

MongoDB checks:

```text
Does this array contain MongoDB?
```

If yes:

```text
Return document
```

---

# Multikey Index And Multiple Documents

Courses:

```javascript
{
    title: "Course A",
    technologies: [
        "MongoDB",
        "Node.js"
    ]
}

{
    title: "Course B",
    technologies: [
        "MongoDB",
        "React"
    ]
}
```

Query:

```javascript
db.courses.find({
    technologies: "MongoDB"
})
```

Result:

```text
Course A
Course B
```

Because both arrays contain:

```text
MongoDB
```

---

# Checking If MongoDB Created A Multikey Index

Create:

```javascript
db.courses.createIndex({
    technologies: 1
})
```

Then:

```javascript
db.courses.getIndexes()
```

MongoDB stores metadata indicating that the index is multikey.

More importantly:

```javascript
.explain("executionStats")
```

will show index usage.

---

# Real Udemy Example

Collection:

```javascript
{
    title: "Backend Masterclass",
    technologies: [
        "Node.js",
        "MongoDB",
        "Redis"
    ]
}
```

Index:

```javascript
db.courses.createIndex({
    technologies: 1
})
```

Student searches:

```javascript
db.courses.find({
    technologies: "Redis"
})
```

MongoDB directly finds matching courses.

No full collection scan required.

---

# Common Beginner Mistakes

## Mistake 1

Thinking arrays cannot be indexed.

Wrong.

MongoDB indexes arrays using Multikey Indexes.

---

## Mistake 2

Thinking one document creates one index entry.

Wrong.

One document can create multiple index entries.

Example:

```javascript
[
    "MongoDB",
    "Node.js",
    "Express"
]
```

creates:

```text
MongoDB
Node.js
Express
```

entries.

---

## Mistake 3

Not indexing frequently searched array fields.

Fields like:

```javascript
tags
```

```javascript
technologies
```

```javascript
genres
```

are often excellent candidates for Multikey Indexes.

---

# Mental Model

Whenever I create:

```javascript
db.courses.createIndex({
    technologies: 1
})
```

I read it as:

```text
MongoDB,

create an index entry
for every value inside the array.
```

That's exactly what a Multikey Index does.

---

# Quick Practice

Create a Multikey Index on technologies:

```javascript
db.courses.createIndex({
    technologies: 1
})
```

---

Create a Multikey Index on genres:

```javascript
db.movies.createIndex({
    genres: 1
})
```

---

Create a Multikey Index on tags:

```javascript
db.posts.createIndex({
    tags: 1
})
```

---

# Summary

In this lesson I learned:

✅ What a Multikey Index is

✅ Why array fields need special indexing

✅ How MongoDB automatically creates Multikey Indexes

✅ One document can create multiple index entries

✅ Searching inside arrays

✅ Real-world examples using technologies, genres and tags

✅ How Multikey Indexes improve query performance

Most importantly, I learned that when an indexed field contains an array, MongoDB creates separate index entries for each array element, allowing fast searches without scanning every document.
