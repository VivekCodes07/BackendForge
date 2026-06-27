# `$match` Stage

## Why Am I Learning This?

In the previous lesson, I learned that Aggregation is all about processing data instead of simply retrieving it.

I also learned that every aggregation starts with a pipeline.

```javascript
db.collection.aggregate([
    // stages go here
])
```

Now the obvious question is...

**What's the very first thing MongoDB should do when processing millions of documents?**

Should it process every document?

Or should it first remove the ones I don't need?

The answer is obvious.

Filter first.

That's exactly what the `$match` stage does.

---

# Let's Think Like Udemy

Imagine I'm building Udemy.

My `courses` collection looks like this:

```javascript
{
    title: "MongoDB Mastery",
    instructor: "Vivek",
    category: "Database",
    price: 4999,
    isPublished: true
}

{
    title: "React Complete Guide",
    instructor: "Hitesh",
    category: "Frontend",
    price: 3999,
    isPublished: true
}

{
    title: "Node.js Bootcamp",
    instructor: "Akshay",
    category: "Backend",
    price: 4499,
    isPublished: false
}

{
    title: "Express.js API",
    instructor: "Vivek",
    category: "Backend",
    price: 2999,
    isPublished: true
}
```

Now imagine a student clicks:

```text
Backend Courses
```

Should MongoDB process every single course?

No.

It should first keep only Backend courses.

Everything else should be ignored.

That's the first job of `$match`.

---

# My First `$match`

```javascript
db.courses.aggregate([
    {
        $match: {
            category: "Backend"
        }
    }
])
```

Let's read this in English.

```text
MongoDB,

Go through the collection.

Keep only the documents where

category = Backend.

Ignore everything else.
```

That's literally all `$match` does.

It filters documents.

---

# Wait...

Isn't This Just `find()`?

When I first saw `$match`, my immediate reaction was:

```javascript
db.courses.find({
    category: "Backend"
})
```

Looks familiar, right?

Then why does `$match` even exist?

The answer is simple.

`find()` ends there.

Aggregation doesn't.

`$match` is just **one stage** inside a much bigger pipeline.

For example:

```text
Filter Courses

↓

Sort Them

↓

Calculate Something

↓

Return Final Result
```

The pipeline keeps going.

That's the difference.

---

# Real World Example — Udemy Dashboard

Imagine Udemy wants to know:

> "What's the average price of all Backend courses?"

Think about it.

Should MongoDB calculate the average price of **every course** first?

That would be wasteful.

Instead it thinks like this:

```text
Step 1

Keep only Backend courses.

↓

Step 2

Calculate average price.

↓

Return answer.
```

That's exactly why `$match` usually comes first.

---

# Another Example — Published Courses

Suppose students should only see published courses.

Collection:

```javascript
{
    title: "Docker Mastery",
    isPublished: true
}

{
    title: "Next.js Complete Guide",
    isPublished: false
}
```

Aggregation:

```javascript
db.courses.aggregate([
    {
        $match: {
            isPublished: true
        }
    }
])
```

MongoDB ignores draft courses completely.

Only published courses continue through the pipeline.

---

# Think Of It Like A Security Guard

This analogy helped me instantly.

Imagine a concert.

Thousands of people arrive.

Before anyone enters,

there's a security guard.

The guard checks every person.

If they have a valid ticket:

✅ Let them enter.

Otherwise:

❌ Stop them.

`$match` is that security guard.

Only matching documents are allowed inside the pipeline.

Everyone else gets rejected immediately.

---

# Why `$match` Usually Comes First

Suppose I have:

```text
1,000,000 Courses
```

Only:

```text
20,000 Backend Courses
```

If I don't use `$match` first,

MongoDB has to process:

```text
1,000,000 documents
```

But if I filter first,

MongoDB only processes:

```text
20,000 documents
```

That's a huge difference.

Less work.

Better performance.

This is one of the biggest reasons `$match` is usually placed at the beginning of the pipeline.

---

# `$match` Uses Normal Query Syntax

One thing I really liked is that `$match` doesn't introduce a new syntax.

Everything I already know from `find()` still works.

Example:

Equality:

```javascript
{
    $match: {
        category: "Backend"
    }
}
```

Greater than:

```javascript
{
    $match: {
        price: {
            $gt: 3000
        }
    }
}
```

Less than:

```javascript
{
    $match: {
        rating: {
            $lt: 4.8
        }
    }
}
```

Multiple conditions:

```javascript
{
    $match: {
        category: "Backend",
        isPublished: true
    }
}
```

Nothing new to memorize.

Just use the same query operators I've already learned.

---

# Real World Example — Amazon

Imagine an Orders collection.

```javascript
{
    orderId: "ORD101",
    status: "Delivered",
    total: 4200
}

{
    orderId: "ORD102",
    status: "Cancelled",
    total: 1800
}
```

Manager asks:

> "Generate a sales report."

Should cancelled orders be included?

Of course not.

First stage:

```javascript
{
    $match: {
        status: "Delivered"
    }
}
```

Now every stage after this works only with delivered orders.

Makes perfect sense.

---

# My Mental Model

Whenever I see:

```javascript
{
    $match: {
        category: "Backend"
    }
}
```

I don't read it as:

> "$match operator."

Instead I read it as:

> "Only allow Backend courses to continue."

Everything else is discarded.

---

# Quick Revision

`$match` is used to:

* Filter documents
* Remove unwanted data
* Reduce the number of documents
* Improve performance
* Prepare data for later stages

It usually appears:

```text
At the beginning of the pipeline.
```

because filtering early means MongoDB has less work to do later.

---

# Most Important Thing I Learned

At first, `$match` looked exactly like `find()`.

Now I understand the real difference.

`find()` retrieves matching documents and stops.

`$match` filters matching documents **so the rest of the aggregation pipeline can continue working on them.**

That's why `$match` is almost always the first stage in a real-world aggregation pipeline.
