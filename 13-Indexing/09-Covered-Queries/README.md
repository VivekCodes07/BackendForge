# Covered Queries

## Why Am I Learning This?

So far, my MongoDB indexing journey has looked like this:

```text
Why Indexes
      ↓
Creating Indexes
      ↓
Single Field Indexes
      ↓
Compound Indexes
      ↓
Unique Indexes
      ↓
Indexes And Sorting
      ↓
Multikey Indexes
      ↓
Text Indexes
```

At every step, the goal was the same:

```text
Make MongoDB find data faster.
```

And that works.

When MongoDB uses an index, it doesn't have to scan every document.

Instead:

```text
COLLSCAN ❌

Scan Everything
```

becomes:

```text
IXSCAN ✅

Use Index
```

which is much faster.

But now I want to ask a deeper question:

> After MongoDB finds the document using an index, is the work actually finished?

The answer is:

```text
Not always.
```

Most of the time MongoDB still has another step to perform.

And that step is exactly why Covered Queries exist.

---

# Understanding The Normal Query Flow

Suppose I have this collection:

```javascript
{
    username: "vivek",
    email: "vivek@gmail.com",
    age: 24,
    city: "Chandigarh"
}
```

And suppose I create an index:

```javascript
db.users.createIndex({
    username: 1
})
```

Now I run:

```javascript
db.users.find({
    username: "vivek"
})
```

At first glance it feels like:

```text
MongoDB used index
↓
Done
```

But that is not what happens.

The actual process is:

```text
Step 1

Use index
```

↓

```text
Find location of document
```

↓

```text
Fetch document from collection
```

↓

```text
Return result
```

MongoDB still has to open the document.

The index only helped MongoDB locate it.

---

# Important Realization

An index usually does NOT contain the entire document.

Example:

Document:

```javascript
{
    username: "vivek",
    email: "vivek@gmail.com",
    age: 24
}
```

Index:

```javascript
{
    username: 1
}
```

The index knows:

```text
vivek → document location
```

But it does NOT know:

```text
email
age
city
phone
```

Therefore MongoDB must open the document.

---

# The Hidden Cost

Even when an index is used:

```text
Index Scan
```

MongoDB may still perform:

```text
Document Fetch
```

The fetch operation costs time.

The fetch operation costs memory.

The fetch operation may require disk reads.

This becomes significant when millions of queries are executed.

---

# What If MongoDB Never Needed The Document?

Imagine the query could be answered entirely from the index.

No fetch.

No lookup.

No document access.

Just:

```text
Read Index
↓
Return Result
```

This is exactly what a Covered Query is.

---

# What Is A Covered Query?

A Covered Query is a query where:

```text
Everything MongoDB needs
already exists inside the index.
```

MongoDB never needs to fetch the document.

The index completely covers the query.

That's why it is called:

```text
Covered Query
```

---

# The Three Rules Of Covered Queries

A query becomes covered only when ALL three conditions are true.

---

## Rule 1

The filter field must be in the index.

Example:

```javascript
db.users.createIndex({
    username: 1,
    email: 1
})
```

Query:

```javascript
{
    username: "vivek"
}
```

The filter field:

```text
username
```

exists in the index.

Rule satisfied ✅

---

## Rule 2

The returned fields must also exist in the index.

Projection:

```javascript
{
    email: 1
}
```

The field:

```text
email
```

also exists in the index.

Rule satisfied ✅

---

## Rule 3

MongoDB must not need any additional field.

If MongoDB needs even one extra field:

```text
Covered Query breaks.
```

---

# My First Covered Query

Collection:

```javascript
{
    username: "vivek",
    email: "vivek@gmail.com",
    age: 24
}
```

Index:

```javascript
db.users.createIndex({
    username: 1,
    email: 1
})
```

Query:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
)
```

MongoDB already has:

```text
username
email
```

inside the index.

No document lookup required.

Covered Query ✅

---

# Visualizing What MongoDB Sees

Instead of looking at documents, imagine MongoDB looking at this:

```text
INDEX

username      email

alex          alex@gmail.com

emma          emma@gmail.com

vivek         vivek@gmail.com
```

Query:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
)
```

MongoDB simply reads:

```text
vivek → vivek@gmail.com
```

and returns the result.

The document is never opened.

---

# Why Is This Faster?

Normal Indexed Query:

```text
Read Index
      ↓
Locate Document
      ↓
Read Document
      ↓
Return Result
```

Covered Query:

```text
Read Index
      ↓
Return Result
```

One entire step disappears.

This is why Covered Queries are considered one of the fastest query patterns in MongoDB.

---

# Indexed Query vs Covered Query

Many beginners think:

```text
Indexed Query = Covered Query
```

Wrong.

These are different concepts.

---

## Indexed Query

```javascript
db.users.find({
    username: "vivek"
})
```

Index:

```javascript
{
    username: 1
}
```

MongoDB uses the index.

Good.

But MongoDB still fetches the document.

---

## Covered Query

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        username: 1,
        _id: 0
    }
)
```

MongoDB never fetches the document.

Everything is already inside the index.

---

# The Famous _id Trap

This is the mistake almost every MongoDB beginner makes.

MongoDB automatically returns:

```javascript
_id
```

unless I explicitly remove it.

Example:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1
    }
)
```

Looks covered.

But it isn't.

MongoDB actually returns:

```javascript
{
    _id: ObjectId(...),
    email: "vivek@gmail.com"
}
```

Problem:

```text
_id
```

is not in the index.

MongoDB must fetch the document.

Covered Query lost ❌

---

# Fixing It

Always exclude:

```javascript
_id
```

when appropriate.

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
)
```

Now MongoDB can stay entirely inside the index.

Covered Query achieved ✅

---

# Real World Example - Instagram

Suppose Instagram has:

```javascript
{
    username: "vivek",
    followers: 15000,
    bio: "Backend Developer"
}
```

Index:

```javascript
db.users.createIndex({
    username: 1,
    followers: 1
})
```

Profile lookup:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        followers: 1,
        _id: 0
    }
)
```

Everything exists inside the index.

MongoDB never touches the document.

---

# Real World Example - E-Commerce

Products:

```javascript
{
    name: "MacBook Air",
    price: 90000,
    description: "..."
}
```

Index:

```javascript
{
    name: 1,
    price: 1
}
```

Query:

```javascript
db.products.find(
    {
        name: "MacBook Air"
    },
    {
        price: 1,
        _id: 0
    }
)
```

Covered Query.

Perfect for product listing pages.

---

# How To Verify A Covered Query

Use:

```javascript
.explain("executionStats")
```

Example:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
).explain("executionStats")
```

---

# The Golden Indicator

Look for:

```javascript
totalDocsExamined: 0
```

This is one of the most beautiful numbers in MongoDB performance tuning.

It means:

```text
MongoDB examined zero documents.
```

Everything came directly from the index.

---

# Interview Question

### Which is faster?

```text
Indexed Query
```

or

```text
Covered Query
```

Answer:

```text
Covered Query
```

because MongoDB avoids document fetches completely.

---

# Mental Model

Whenever I see:

```javascript
db.users.createIndex({
    username: 1,
    email: 1
})
```

and

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
)
```

I imagine MongoDB saying:

```text
I already know the answer.

Why would I open the document?
```

That's exactly how a Covered Query works.

---

# Quick Practice

Create index:

```javascript
db.users.createIndex({
    username: 1,
    email: 1
})
```

---

Covered Query:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        email: 1,
        _id: 0
    }
)
```

---

Not Covered:

```javascript
db.users.find(
    {
        username: "vivek"
    },
    {
        age: 1
    }
)
```

---

Verify:

```javascript
.explain("executionStats")
```

Look for:

```text
totalDocsExamined: 0
```

---

# Summary

In this lesson I learned:

✅ What a Covered Query is

✅ Why document fetches are expensive

✅ Difference between Indexed Queries and Covered Queries

✅ The three rules of Covered Queries

✅ Why `_id` often breaks coverage

✅ How projections affect coverage

✅ How to verify coverage using `explain()`

✅ Why `totalDocsExamined: 0` is important

✅ Real-world use cases

Most importantly, I learned that the fastest query in MongoDB is not just a query that uses an index.

The fastest query is often a query that never needs to touch the document at all because the index already contains everything MongoDB needs.
