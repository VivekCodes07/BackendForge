# Skip Stage (`$skip`)

In the previous lesson, I learned how the `$limit` stage controls **how many** documents continue through the aggregation pipeline.

That raised another question.

> **What if I don't want the first few documents at all?**

Suppose I have a collection containing hundreds of products.

Sometimes, I don't want to start from the beginning.

Maybe I want

- products after the first 10,
- the second page of results,
- or simply ignore the first few documents.

This is exactly what the `$skip` stage is designed for.

Unlike `$limit`, which says

> "Keep only the first N documents."

`$skip` says

> "Ignore the first N documents, then continue with the rest."

It doesn't modify documents.

It doesn't sort documents.

It simply skips a certain number of documents before passing the remaining ones to the next stage.

---

# Sample Collection

Throughout this lesson, I'll use the following collection.

```js
[
    {
        name: "iPhone",
        category: "Electronics",
        price: 1000,
        rating: 4.8
    },
    {
        name: "MacBook",
        category: "Electronics",
        price: 2000,
        rating: 4.9
    },
    {
        name: "Chair",
        category: "Furniture",
        price: 300,
        rating: 4.4
    },
    {
        name: "Table",
        category: "Furniture",
        price: 500,
        rating: 4.6
    },
    {
        name: "Keyboard",
        category: "Electronics",
        price: 100,
        rating: 4.5
    }
]
```

---

# What is `$skip`?

The `$skip` stage tells MongoDB to ignore the first **N** documents currently flowing through the aggregation pipeline.

After ignoring those documents, MongoDB passes the remaining documents to the next stage.

Think of it like reading a book.

```
Page 1

↓

Page 2

↓

Page 3

↓

Skip the first two pages.

↓

Start reading from Page 3.
```

MongoDB behaves the same way.

Instead of pages,

it skips documents.

---

# Syntax

```js
{
    $skip: <positive_number>
}
```

Example

```js
{
    $skip: 2
}
```

MongoDB now knows

```
Ignore the first two documents.

↓

Continue with everything else.
```

---

# My First `$skip`

Suppose I write

```js
db.products.aggregate([
    {
        $skip: 2
    }
]);
```

Current Collection

```text
1. iPhone

2. MacBook

3. Chair

4. Table

5. Keyboard
```

MongoDB starts reading documents.

```
iPhone ❌

MacBook ❌

Chair ✅

Table ✅

Keyboard ✅
```

Result

```text
Chair

Table

Keyboard
```

Notice something.

MongoDB doesn't delete the first two documents.

It simply ignores them for this aggregation pipeline.

The original collection remains unchanged.

---

# Understanding "Current Order"

Just like `$limit`,

`$skip` depends entirely on the order of the incoming documents.

It doesn't know

- which document is the cheapest,
- which one has the highest rating,
- or which one was inserted first.

It simply skips the first **N** documents in whatever order it receives.

Imagine the current order is

```text
iPhone

MacBook

Chair

Table

Keyboard
```

Now I apply

```js
{
    $skip: 3
}
```

MongoDB thinks

```
iPhone ❌

MacBook ❌

Chair ❌

Table ✅

Keyboard ✅
```

That's all `$skip` does.

---

# Combining `$sort` and `$skip`

Now things become much more interesting.

Suppose I want to ignore the two most expensive products.

Can `$skip` do that by itself?

No.

Remember,

`$skip` only ignores the first N documents.

So first I need to make sure the most expensive products appear first.

That's where `$sort` comes in.

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $skip: 2
    }
]);
```

Let's walk through the execution.

### Step 1

Sort the documents by price.

```text
MacBook

↓

iPhone

↓

Table

↓

Chair

↓

Keyboard
```

### Step 2

Apply `$skip`.

```
MacBook ❌

iPhone ❌

Table ✅

Chair ✅

Keyboard ✅
```

Result

```text
Table

Chair

Keyboard
```

Notice what happened.

`$sort` decided the order.

`$skip` ignored the first two documents in that order.

This is another example of how aggregation stages work together.

Each stage has one responsibility.

---

# Combining `$skip` and `$limit`

This is one of the most common combinations in MongoDB.

Suppose I write

```js
db.products.aggregate([
    {
        $skip: 2
    },
    {
        $limit: 2
    }
]);
```

Let's visualize the execution.

Current Collection

```text
iPhone

MacBook

Chair

Table

Keyboard
```

### Step 1

Skip the first two documents.

```text
Chair

Table

Keyboard
```

### Step 2

Apply `$limit`.

```
Chair ✅

Table ✅

Stop.
```

Result

```text
Chair

Table
```

Now I understand the difference between these two stages.

`$skip`

```
Ignore the first N documents.
```

↓

`$limit`

```
Return only the next N documents.
```

This simple combination is the foundation of pagination.

---

# Why Pagination Uses `$skip` and `$limit`

Imagine I'm building an online store.

Each page should display **10 products**.

For the first page,

I don't need to skip anything.

```js
[
    {
        $limit: 10
    }
]
```

Result

```
Products 1–10
```

For the second page,

I don't want to see those first ten products again.

Instead,

I skip them.

```js
[
    {
        $skip: 10
    },
    {
        $limit: 10
    }
]
```

MongoDB thinks

```
Ignore the first 10 products.

↓

Return the next 10.
```

Result

```
Products 11–20
```

For the third page,

```js
[
    {
        $skip: 20
    },
    {
        $limit: 10
    }
]
```

Result

```
Products 21–30
```

At this point, I finally understood why these two stages are almost always used together in APIs.

`$skip` decides

> **Where should I start?**

`$limit` decides

> **How many documents should I return?**


---

# Stage Order Matters

One thing I keep reminding myself while learning aggregation is this:

> **MongoDB executes the aggregation pipeline from top to bottom.**

That means the order of stages is **not optional**.

Changing the order can completely change the result.

Let's see an example.

Suppose I write

```js
db.products.aggregate([
    {
        $skip: 2
    },
    {
        $limit: 2
    }
]);
```

MongoDB thinks

```
Skip the first two documents.

↓

Return the next two documents.
```

Result

```text
Chair

Table
```

Now let's reverse the stages.

```js
db.products.aggregate([
    {
        $limit: 2
    },
    {
        $skip: 2
    }
]);
```

MongoDB thinks

```
Return only two documents.

↓

Now skip those two documents.
```

Result

```text
No Documents
```

Why?

Because after `$limit`, only two documents remain.

Then `$skip` ignores both of them.

There's nothing left to return.

This example taught me something important.

Changing the order of aggregation stages isn't just a small change.

It changes how MongoDB processes the data.

---

# `$sort`, `$skip`, and `$limit`

These three stages are commonly used together.

Suppose I want

> Show products sorted by price,
> skip the first two,
> then return the next two.

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $skip: 2
    },
    {
        $limit: 2
    }
]);
```

Let's visualize the pipeline.

Current Collection

```text
iPhone

MacBook

Chair

Table

Keyboard
```

### Step 1

Sort by price.

```text
MacBook

↓

iPhone

↓

Table

↓

Chair

↓

Keyboard
```

### Step 2

Skip the first two documents.

```text
Table

Chair

Keyboard
```

### Step 3

Return only two documents.

```text
Table

Chair
```

Execution Flow

```text
Collection
      │
      ▼

$sort
      │
      ▼

$skip
      │
      ▼

$limit
      │
      ▼

Final Result
```

This pattern is everywhere.

Whether it's an e-commerce website,

a social media feed,

or an admin dashboard,

this is how pagination usually works.

---

# Real-World Examples

## Example 1 — Page 2 of Products

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $skip: 10
    },
    {
        $limit: 10
    }
]);
```

Meaning

```
Sort every product.

↓

Ignore the first 10.

↓

Return the next 10.
```

---

## Example 2 — Skip the Highest Rated Product

```js
db.products.aggregate([
    {
        $sort: {
            rating: -1
        }
    },
    {
        $skip: 1
    }
]);
```

Result

```
Return every product except
the highest-rated one.
```

---

## Example 3 — Third Most Expensive Product

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $skip: 2
    },
    {
        $limit: 1
    }
]);
```

Execution

```
Sort

↓

Skip first two

↓

Return the next one
```

Result

```
Third Most Expensive Product
```

---

# Common Mistakes

## Mistake 1

Thinking `$skip` removes documents.

It doesn't.

The documents still exist in the collection.

They're only ignored for the current aggregation pipeline.

---

## Mistake 2

Using `$skip` without `$sort`.

Imagine the collection order changes.

Now

```js
{
    $skip: 10
}
```

might skip completely different documents.

If I want predictable pagination,

I should almost always sort first.

```js
[
    {
        $sort: {
            createdAt: -1
        }
    },
    {
        $skip: 10
    },
    {
        $limit: 10
    }
]
```

This produces consistent results.

---

## Mistake 3

Thinking `$skip` knows which documents are "best."

It doesn't.

It simply ignores the first N documents in the current pipeline.

Nothing more.

---

# Mental Model

Whenever I see

```js
{
    $skip: 3
}
```

I imagine MongoDB doing this.

```
Receive Documents

        │
        ▼

Document 1 ❌

Document 2 ❌

Document 3 ❌

Document 4 ✅

Document 5 ✅

Document 6 ✅

Continue...
```

The skipped documents disappear **from the pipeline**, not from the collection.

---

# Quick Summary

| Stage | Purpose |
| ------ | ------- |
| `$sort` | Arrange documents in a specific order |
| `$skip` | Ignore the first N documents |
| `$limit` | Return only the next N documents |

Think of them together like this.

```
$sort

↓

Arrange everything.

$skip

↓

Ignore the beginning.

$limit

↓

Keep only the amount I need.
```

---

# Biggest Takeaway

Whenever I see

```js
{
    $skip: 10
}
```

I don't think

> "Remove the first ten documents."

I think

> "Ignore the first ten documents **flowing through the current aggregation pipeline**."

That's an important distinction.

`$skip` never modifies the collection.

It never deletes data.

It simply tells MongoDB,

> "Don't pass the first N documents to the next stage."

Once I combined that idea with `$sort` and `$limit`, pagination became much easier to understand.

Instead of memorizing syntax, I now think about the flow of documents through the pipeline:

```text
Collection
      │
      ▼

Arrange the documents
($sort)

      │
      ▼

Ignore the beginning
($skip)

      │
      ▼

Keep only what I need
($limit)

      │
      ▼

Return the final result
```

That mental model is much easier to remember than trying to memorize what each stage does individually.