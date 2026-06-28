# Limit Stage (`$limit`)

In the previous lesson, I learned how the `$sort` stage changes the order of documents.

That made me think...

> **What if I don't need every document?**

Suppose my collection contains 10,000 products.

Do I really want MongoDB to return all 10,000?

Probably not.

Maybe I only need

- the first product,
- the first 5 products,
- the top 10 expensive products,
- or the latest 20 orders.

This is exactly where the `$limit` stage becomes useful.

Unlike `$sort`, which changes the order of documents,

`$limit` controls **how many documents continue through the aggregation pipeline.**

It doesn't calculate anything.

It doesn't modify documents.

It simply tells MongoDB

> "Return only the first N documents."

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

# What is `$limit`?

The `$limit` stage tells MongoDB to return only a fixed number of documents.

Think of it like saying

> "Once you've returned enough documents, stop."

That's literally its entire job.

Unlike `$match`

```
Find specific documents.
```

Unlike `$group`

```
Create summary documents.
```

Unlike `$sort`

```
Change the order of documents.
```

`$limit`

```
Return only the first N documents.
```

---

# Syntax

```js
{
    $limit: <positive_number>
}
```

Example

```js
{
    $limit: 3
}
```

MongoDB now knows

```
Return only the first three documents.

↓

Ignore everything else.
```

---

# My First `$limit`

Let's return only the first two documents.

```js
db.products.aggregate([
    {
        $limit: 2
    }
]);
```

Current Collection

```text
iPhone

MacBook

Chair

Table

Keyboard
```

MongoDB starts reading documents.

```
iPhone ✅

MacBook ✅

Stop.
```

Result

```text
iPhone

MacBook
```

Notice something important.

MongoDB didn't choose these documents because they were expensive.

It didn't choose them because they had the highest rating.

It simply returned the first two documents it received.

---

# Understanding "Current Order"

This confused me at first.

I thought `$limit` somehow knew which documents were the "best."

It doesn't.

`$limit` has no idea what "best" means.

It only knows

```
Current Order

↓

Take the first N documents.
```

Imagine the documents currently look like this.

```text
1. iPhone

2. MacBook

3. Chair

4. Table

5. Keyboard
```

Now I write

```js
{
    $limit: 3
}
```

MongoDB thinks

```
iPhone ✅

MacBook ✅

Chair ✅

Stop.
```

That's all it does.

---

# Combining `$sort` and `$limit`

Now everything starts making sense.

Suppose I want the two most expensive products.

Can `$limit` do that by itself?

No.

Remember,

`$limit` only returns the first N documents.

So first I need to make sure the most expensive products appear first.

That's exactly why `$sort` usually comes before `$limit`.

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 2
    }
]);
```

Let's walk through what MongoDB does.

### Step 1

Sort the documents.

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

Apply `$limit`.

```
MacBook ✅

iPhone ✅

Stop.
```

Result

```text
MacBook

iPhone
```

Now I understand why these two stages are almost always used together.

`$sort`

```
Decides the order.
```

↓

`$limit`

```
Decides how many documents to return.
```

---

# Stage Order Matters

Suppose I accidentally write

```js
[
    {
        $limit: 2
    },
    {
        $sort: {
            price: -1
        }
    }
]
```

MongoDB thinks

```
Take the first two documents.

↓

Now sort those two documents.
```

That means it never even looks at the remaining documents.

Now compare that with

```js
[
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 2
    }
]
```

MongoDB thinks

```
Sort every document.

↓

Now return only the first two.
```

These pipelines can produce completely different results.

That taught me another important lesson.

Aggregation pipelines are executed **from top to bottom**.

Every stage receives the output of the previous stage.

---

# Execution Flow

Whenever I see

```js
[
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 3
    }
]
```

I imagine MongoDB doing this.

```text
Collection
      │
      ▼

Sort Documents
      │
      ▼

Take the First 3 Documents
      │
      ▼

Return the Result
```

Notice something.

`$limit` never performs the sorting.

It simply receives the sorted documents from the previous stage.

That's the beauty of the aggregation pipeline.

Every stage has one responsibility.


---

# Using `$limit` After `$group`

Everything I learned in the previous lessons starts connecting here.

Remember,

`$group` doesn't return the original documents.

It creates **new summary documents**.

Let's calculate the total revenue for each category.

```js
db.products.aggregate([
    {
        $group: {
            _id: "$category",
            totalRevenue: {
                $sum: "$price"
            }
        }
    }
]);
```

Result

```text
[
    {
        _id: "Electronics",
        totalRevenue: 3100
    },
    {
        _id: "Furniture",
        totalRevenue: 800
    }
]
```

Now suppose I only want the category with the highest revenue.

```js
db.products.aggregate([
    {
        $group: {
            _id: "$category",
            totalRevenue: {
                $sum: "$price"
            }
        }
    },
    {
        $sort: {
            totalRevenue: -1
        }
    },
    {
        $limit: 1
    }
]);
```

Let's visualize what MongoDB is doing.

```
Collection
      │
      ▼

Create Category Buckets

      │
      ▼

Calculate Revenue

      │
      ▼

Sort by Revenue

      │
      ▼

Return First Document
```

Result

```text
Electronics

Total Revenue: 3100
```

Notice that `$limit` isn't working on the original collection anymore.

It's working on the documents produced by `$group`.

That's another reminder that every aggregation stage receives the output of the previous stage.

---

# Real-World Examples

## Example 1 — Top 3 Most Expensive Products

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 3
    }
]);
```

This is probably the most common use case.

Sort first.

Then keep only the first three documents.

---

## Example 2 — Highest Rated Product

```js
db.products.aggregate([
    {
        $sort: {
            rating: -1
        }
    },
    {
        $limit: 1
    }
]);
```

Result

```
Highest Rated Product
```

---

## Example 3 — Top Categories by Revenue

```js
db.products.aggregate([
    {
        $group: {
            _id: "$category",
            totalRevenue: {
                $sum: "$price"
            }
        }
    },
    {
        $sort: {
            totalRevenue: -1
        }
    },
    {
        $limit: 3
    }
]);
```

Very common in analytics dashboards.

---

# Common Mistakes

## Mistake 1

Using `$limit` without thinking about the current order.

```js
{
    $limit: 5
}
```

This simply returns the first five documents.

It does **not** return

- the best,
- the cheapest,
- the newest,
- or the most expensive.

Unless another stage has already arranged the documents.

---

## Mistake 2

Placing `$limit` before `$sort`

Wrong

```js
[
    {
        $limit: 5
    },
    {
        $sort: {
            price: -1
        }
    }
]
```

MongoDB thinks

```
Take 5 documents.

↓

Sort those 5.
```

Correct

```js
[
    {
        $sort: {
            price: -1
        }
    },
    {
        $limit: 5
    }
]
```

Now MongoDB thinks

```
Sort every document.

↓

Take the first five.
```

The order of stages completely changes the result.

---

# Mental Model

Whenever I see

```js
{
    $limit: 5
}
```

I don't think about syntax anymore.

I imagine MongoDB doing this.

```
Receive Documents
        │
        ▼

Count Documents

        │
        ▼

1 ✅

2 ✅

3 ✅

4 ✅

5 ✅

Stop.
```

That's literally the entire purpose of `$limit`.

---

# How `$limit` Thinks

If I had to explain `$limit` to someone in one sentence, I'd say:

> "Keep passing documents until the requested number has been reached. Then stop."

No calculations.

No comparisons.

No filtering.

Just counting.

---

# Quick Summary

| Stage | Purpose |
| ------ | ------- |
| `$sort` | Changes the order of documents |
| `$limit` | Returns only the first N documents |

Remember

```
$sort

↓

Changes the order

$limit

↓

Changes the quantity
```

---

# Biggest Takeaway

Whenever I see

```js
{
    $limit: 10
}
```

I don't think

> "Return the best ten documents."

I think

> "Return the first ten documents **in the current pipeline order**."

That small difference completely changed how I understand `$limit`.

On its own, `$limit` doesn't know which documents are important.

It simply counts.

That's why it's almost always paired with stages like `$sort`, where one stage decides **the order**, and the other decides **how many documents continue** through the pipeline.

Understanding that relationship made `$limit` one of the simplest stages in the aggregation pipeline.