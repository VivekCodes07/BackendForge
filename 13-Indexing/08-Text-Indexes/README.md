# Text Indexes

## Why Am I Learning This?

So far, I've learned about:

* Single Field Indexes
* Compound Indexes
* Multikey Indexes

These indexes work great when I know the **exact value** I'm searching for.

Example:

```javascript
db.users.find({
    username: "vivek"
})
```

or

```javascript
db.products.find({
    category: "Laptops"
})
```

But many real-world applications allow users to search using **words**.

Examples:

### Google

Search:

```text
mongodb indexing tutorial
```

### YouTube

Search:

```text
javascript course
```

### Amazon

Search:

```text
wireless headphones
```

### Medium

Search:

```text
mongodb aggregation
```

Users usually don't know the exact value stored in the database.

Instead, they search using words.

This is where **Text Indexes** become important.

---

# The Problem

Suppose my collection contains:

```javascript
{
    title: "Learning MongoDB"
}

{
    title: "MongoDB Aggregation Guide"
}

{
    title: "JavaScript Crash Course"
}
```

Now suppose a user searches:

```text
MongoDB
```

Without a Text Index, MongoDB would have to examine every document.

```text
Document 1

Learning MongoDB ✓

----------------

Document 2

MongoDB Aggregation Guide ✓

----------------

Document 3

JavaScript Crash Course ✗
```

For a collection containing millions of articles, videos, or products, this becomes expensive.

---

# What Is A Text Index?

A Text Index is an index designed for searching words inside text.

Example:

```javascript
db.articles.createIndex({
    title: "text"
})
```

Notice something different.

Instead of:

```javascript
1
```

or

```javascript
-1
```

I use:

```javascript
"text"
```

This tells MongoDB:

> "Index the words inside this field."

---

# How MongoDB Stores A Text Index

Suppose my collection contains:

```javascript
{
    title: "Learning MongoDB"
}

{
    title: "MongoDB Aggregation Guide"
}
```

Conceptually, MongoDB breaks the text into individual words.

Instead of storing:

```text
Learning MongoDB
```

it creates entries similar to:

```text
Learning      → Document 1

MongoDB       → Document 1

MongoDB       → Document 2

Aggregation   → Document 2

Guide         → Document 2
```

Notice something important.

MongoDB does **not** index the entire sentence as one value.

It indexes the individual words.

Think of it as creating a searchable dictionary of words.

---

# How MongoDB Uses This Index

When I first learned about Text Indexes, one question came to my mind:

> If MongoDB breaks text into individual words, how does searching actually work?

Let's see.

Suppose I run:

```javascript
db.articles.find({
    title: "MongoDB"
})
```

Would MongoDB use the Text Index?

❌ No.

A Text Index is **not** used with a normal `find()` query.

Instead, MongoDB provides a special operator:

```javascript
db.articles.find({
    $text: {
        $search: "MongoDB"
    }
})
```

The `$text` operator tells MongoDB to search using the Text Index.

---

# What Happens During `$text` Search?

Suppose I execute:

```javascript
db.articles.find({
    $text: {
        $search: "MongoDB"
    }
})
```

### Without A Text Index

MongoDB checks every document.

```text
Learning MongoDB ✓

MongoDB Aggregation Guide ✓

JavaScript Crash Course ✗
```

Every document has to be examined.

---

### With A Text Index

MongoDB first looks inside the Text Index.

Conceptually:

```text
Aggregation

Guide

JavaScript

Learning

MongoDB ← Found
```

MongoDB finds:

```text
MongoDB

↓

Document 1

↓

Document 2
```

Then it follows the stored pointers and returns the matching documents.

The process becomes:

```text
$text search

↓

Search the Text Index

↓

Find matching word

↓

Follow the pointers

↓

Return matching documents
```

---

# Searching Multiple Words

Suppose I search:

```javascript
db.articles.find({
    $text: {
        $search: "MongoDB Guide"
    }
})
```

MongoDB looks for both words.

Conceptually:

```text
MongoDB

↓

Matching Documents

-------------------

Guide

↓

Matching Documents
```

Documents containing these words are returned.

---

# Real World Example

Suppose I have a products collection.

```javascript
{
    name: "Wireless Bluetooth Headphones"
}

{
    name: "Gaming Keyboard"
}

{
    name: "Bluetooth Speaker"
}
```

Create the index:

```javascript
db.products.createIndex({
    name: "text"
})
```

Now a user searches:

```javascript
db.products.find({
    $text: {
        $search: "Bluetooth"
    }
})
```

MongoDB immediately finds:

```text
Bluetooth

↓

Wireless Bluetooth Headphones

Bluetooth Speaker
```

---

# Another Example

Articles:

```javascript
{
    title: "Introduction to MongoDB"
}

{
    title: "MongoDB Aggregation Pipeline"
}

{
    title: "Learning Express.js"
}
```

Create:

```javascript
db.articles.createIndex({
    title: "text"
})
```

Search:

```javascript
db.articles.find({
    $text: {
        $search: "MongoDB"
    }
})
```

Both MongoDB articles are returned.

---

# Searching Across Multiple Fields

Suppose each article has:

```javascript
{
    title: "Learning MongoDB",
    description: "Complete beginner guide"
}
```

I can create a Text Index on multiple fields.

```javascript
db.articles.createIndex({
    title: "text",
    description: "text"
})
```

Now MongoDB indexes the words from **both** fields.

Searching:

```javascript
db.articles.find({
    $text: {
        $search: "beginner"
    }
})
```

can find a match even if the word appears only in the description.

---

# Common Beginner Mistakes

## Mistake 1

Thinking a Text Index is used automatically with:

```javascript
db.articles.find({
    title: "MongoDB"
})
```

Wrong.

This searches for the exact field value.

A Text Index is used only with:

```javascript
$text
```

queries.

---

## Mistake 2

Thinking MongoDB indexes the entire sentence.

Wrong.

MongoDB indexes the individual words.

---

## Mistake 3

Thinking Text Indexes are useful for every field.

Wrong.

Text Indexes are designed for large text fields like:

* article titles
* descriptions
* blog posts
* comments
* product names

They are not a replacement for normal indexes.

---

# Mental Model

Whenever I see:

```javascript
{
    title: "Learning MongoDB Aggregation"
}
```

I imagine MongoDB turning it into:

```text
Learning

↓

Document

----------------

MongoDB

↓

Document

----------------

Aggregation

↓

Document
```

Instead of remembering one long sentence, MongoDB creates a searchable dictionary of individual words.

When I use `$text`, MongoDB searches this dictionary first and then retrieves the matching documents.

---

# Quick Practice

### Create a Text Index

```javascript
db.articles.createIndex({
    title: "text"
})
```

---

### Search using the Text Index

```javascript
db.articles.find({
    $text: {
        $search: "MongoDB"
    }
})
```

---

### Create a Text Index on multiple fields

```javascript
db.articles.createIndex({
    title: "text",
    description: "text"
})
```

---

### Search multiple words

```javascript
db.articles.find({
    $text: {
        $search: "MongoDB Guide"
    }
})
```

---

# Summary

In this lesson I learned:

✅ What a Text Index is

✅ Why Text Indexes exist

✅ Why normal indexes aren't suitable for searching words inside text

✅ That MongoDB breaks text into individual words while building the index

✅ That the Text Index stores words along with pointers to matching documents

✅ That Text Indexes are used with the `$text` operator

✅ How MongoDB searches words using the Text Index

✅ How to create Text Indexes on one or multiple fields

Most importantly, I learned that a Text Index **does not store an entire sentence as one value**.

Instead, MongoDB creates a searchable dictionary of individual words. When I use `$text`, MongoDB searches this dictionary first and then retrieves the matching documents, making full-text searches much faster than scanning every document.
