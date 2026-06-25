# Text Indexes

## Why Am I Learning This?

So far, every query I've written has searched for exact values.

Example:

```javascript
db.users.find({
    username: "vivek"
})
```

MongoDB simply checks:

```text
Is username exactly equal to "vivek"?
```

Another example:

```javascript
db.courses.find({
    technologies: "MongoDB"
})
```

MongoDB checks:

```text
Does the array contain "MongoDB"?
```

These are exact matches.

But real applications often need something different.

Imagine I'm building:

* Google
* YouTube
* Udemy
* Medium
* Amazon

Users don't search exact values.

They search words.

Example:

```text
mongodb course
```

or

```text
backend development
```

or

```text
nodejs api
```

MongoDB needs a way to search inside text content efficiently.

This is where Text Indexes come in.

---

# The Problem

Suppose I have:

```javascript
{
    title: "Complete MongoDB Masterclass"
}
```

and

```javascript
{
    title: "Node.js Backend Development"
}
```

and

```javascript
{
    title: "React For Beginners"
}
```

Now I want:

```text
Find all courses related to MongoDB
```

Without a Text Index MongoDB would need to scan every document.

For a collection containing millions of documents:

```text
That becomes expensive.
```

---

# What Is A Text Index?

A Text Index allows MongoDB to search words inside text fields.

Example:

```javascript
db.courses.createIndex({
    title: "text"
})
```

Notice something important.

This is the first time I am NOT using:

```javascript
1
```

or

```javascript
-1
```

Instead:

```javascript
"text"
```

This tells MongoDB:

```text
Create a Text Index.
```

---

# My First Text Index

Collection:

```javascript
{
    title: "Complete MongoDB Masterclass"
}
```

```javascript
{
    title: "Node.js Backend Development"
}
```

```javascript
{
    title: "React For Beginners"
}
```

Create index:

```javascript
db.courses.createIndex({
    title: "text"
})
```

MongoDB now analyzes the text and creates searchable entries.

---

# Searching Text

Instead of:

```javascript
db.courses.find({
    title: "MongoDB"
})
```

I use:

```javascript
db.courses.find({
    $text: {
        $search: "MongoDB"
    }
})
```

MongoDB returns:

```javascript
{
    title: "Complete MongoDB Masterclass"
}
```

because the word MongoDB exists inside the title.

---

# Understanding $text

Whenever I use:

```javascript
$text
```

I am telling MongoDB:

```text
Perform a text search.
```

Example:

```javascript
db.courses.find({
    $text: {
        $search: "backend"
    }
})
```

MongoDB searches indexed text fields.

---

# Real Udemy Example

Courses:

```javascript
{
    title: "MongoDB Masterclass"
}
```

```javascript
{
    title: "Node.js API Development"
}
```

```javascript
{
    title: "Backend Engineering Bootcamp"
}
```

Search:

```javascript
db.courses.find({
    $text: {
        $search: "backend"
    }
})
```

Result:

```text
Backend Engineering Bootcamp
```

---

# Multiple Words

Search:

```javascript
db.courses.find({
    $text: {
        $search: "mongodb backend"
    }
})
```

MongoDB searches for both terms.

Documents containing either term may match.

---

# Real World Example

Imagine Medium articles.

```javascript
{
    title: "Understanding MongoDB Indexes"
}
```

```javascript
{
    title: "Building REST APIs With Node.js"
}
```

Text Index:

```javascript
db.articles.createIndex({
    title: "text"
})
```

Search:

```javascript
db.articles.find({
    $text: {
        $search: "mongodb"
    }
})
```

MongoDB finds matching articles quickly.

---

# Searching Multiple Fields

Suppose I have:

```javascript
{
    title: "MongoDB Masterclass",
    description: "Learn indexing and aggregation"
}
```

I can create:

```javascript
db.courses.createIndex({
    title: "text",
    description: "text"
})
```

Now MongoDB searches both fields.

---

# Example

Document:

```javascript
{
    title: "MongoDB Masterclass",
    description: "Learn indexing"
}
```

Search:

```javascript
db.courses.find({
    $text: {
        $search: "indexing"
    }
})
```

MongoDB can find the document even though:

```text
indexing
```

is not inside the title.

It exists in the description.

---

# Text Score

MongoDB can rank results.

Example:

```javascript
db.courses.find(
    {
        $text: {
            $search: "mongodb"
        }
    },
    {
        score: {
            $meta: "textScore"
        }
    }
)
```

MongoDB calculates relevance.

Higher score:

```text
More relevant result.
```

---

# Sorting By Relevance

Search engines do this all the time.

Example:

```javascript
db.courses.find(
    {
        $text: {
            $search: "mongodb"
        }
    },
    {
        score: {
            $meta: "textScore"
        }
    }
).sort({
    score: {
        $meta: "textScore"
    }
})
```

Most relevant documents appear first.

---

# Common Beginner Mistakes

## Mistake 1

Using normal find instead of text search.

Wrong:

```javascript
db.courses.find({
    title: "mongodb"
})
```

Correct:

```javascript
db.courses.find({
    $text: {
        $search: "mongodb"
    }
})
```

---

## Mistake 2

Forgetting to create a Text Index.

Without a Text Index:

```javascript
$text
```

queries will fail.

---

## Mistake 3

Thinking Text Indexes work like normal indexes.

They don't.

MongoDB analyzes words and creates searchable terms.

---

# Real Applications

Text Indexes are commonly used in:

### Udemy

```text
Course Search
```

### Medium

```text
Article Search
```

### Amazon

```text
Product Search
```

### Blogging Platforms

```text
Search Posts
```

### Documentation Sites

```text
Search Guides
```

---

# Mental Model

Whenever I create:

```javascript
db.courses.createIndex({
    title: "text"
})
```

I read it as:

```text
MongoDB,

analyze every word
inside this field

and make those words searchable.
```

That's exactly what a Text Index does.

---

# Quick Practice

Create a Text Index:

```javascript
db.courses.createIndex({
    title: "text"
})
```

---

Search for MongoDB:

```javascript
db.courses.find({
    $text: {
        $search: "MongoDB"
    }
})
```

---

Create a Text Index on multiple fields:

```javascript
db.courses.createIndex({
    title: "text",
    description: "text"
})
```

---

Search multiple words:

```javascript
db.courses.find({
    $text: {
        $search: "mongodb backend"
    }
})
```

---

# Summary

In this lesson I learned:

✅ What a Text Index is

✅ Why exact matching is not enough

✅ How MongoDB searches inside text

✅ Creating Text Indexes

✅ Using $text

✅ Using $search

✅ Searching multiple words

✅ Indexing multiple fields

✅ Relevance scoring

✅ Sorting by text score

Most importantly, I learned that Text Indexes allow MongoDB to analyze words inside text fields and perform fast search operations without scanning every document.
