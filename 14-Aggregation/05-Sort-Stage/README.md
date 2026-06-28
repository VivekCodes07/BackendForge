# Sort Stage (`$sort`)

In the previous lesson, I learned how the `$group` stage creates temporary buckets and summarizes data.

Now I have another question.

> **What if I want the documents in a specific order?**

For example,

* Show the most expensive products first.
* Show the cheapest products first.
* Show the highest-rated products.
* Sort categories by total revenue after using `$group`.

This is exactly what the `$sort` stage does.

Unlike `$group`, `$sort` doesn't calculate anything.

It simply changes the order of the documents flowing through the aggregation pipeline.

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

# What is `$sort`?

The `$sort` stage orders the documents in the aggregation pipeline.

It **does not**:

* modify documents,
* remove documents,
* create new documents.

It only changes the order in which the documents are passed to the next stage.

Think of it like sorting files in a folder.

The files remain the same.

Only their order changes.

---

# Syntax

```js
{
    $sort: {
        <field>: 1 | -1
    }
}
```

Where

* `1` → Ascending order
* `-1` → Descending order

---

# Sorting in Ascending Order

Suppose I write

```js
db.products.aggregate([
    {
        $sort: {
            price: 1
        }
    }
]);
```

MongoDB compares the `price` field of every document.

Then it sorts them from the smallest value to the largest value.

```
100

↓

300

↓

500

↓

1000

↓

2000
```

Result

```text
Keyboard
Chair
Table
iPhone
MacBook
```

The documents themselves haven't changed.

Only their order has.

---

# Sorting in Descending Order

Now I change the direction.

```js
db.products.aggregate([
    {
        $sort: {
            price: -1
        }
    }
]);
```

MongoDB now sorts the documents from the largest value to the smallest value.

```
2000

↓

1000

↓

500

↓

300

↓

100
```

Result

```text
MacBook
iPhone
Table
Chair
Keyboard
```

A simple way I remember this is

```
1

↓

Lowest → Highest

-1

↓

Highest → Lowest
```

---

# Sorting by Multiple Fields

Sometimes one field isn't enough.

Suppose I want to sort products by category first and then by price.

```js
db.products.aggregate([
    {
        $sort: {
            category: 1,
            price: -1
        }
    }
]);
```

When I first saw this, I wondered:

> Which field gets sorted first?

MongoDB processes the sort keys from left to right.

First,

```
Sort by category.
```

Then,

```
Within each category,

sort by price.
```

The result becomes

```text
Electronics
    MacBook
    iPhone
    Keyboard

Furniture
    Table
    Chair
```

I think of this as

```
Primary sort

↓

Secondary sort
```

---

# `$sort` After `$group`

This is where everything from the previous lesson connects together.

Suppose I want to calculate the total revenue for each category and then sort those categories.

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
    }
]);
```

Here's how I imagine MongoDB executing this pipeline.

### Step 1

Create temporary buckets.

```
Electronics

Furniture
```

### Step 2

Calculate the total revenue for each bucket.

```
Electronics

3100

Furniture

800
```

### Step 3

Each bucket becomes one output document.

```js
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

### Step 4

Now `$sort` receives these documents.

It doesn't know anything about the original collection anymore.

It simply sorts the documents produced by the previous stage.

```
$group

↓

Summary Documents

↓

$sort

↓

Ordered Summary Documents
```

That made something click for me.

Every stage in an aggregation pipeline receives the output of the previous stage.

---

# How MongoDB Thinks

Whenever MongoDB reaches a `$sort` stage, I imagine it doing something like this.

```
Read every document

↓

Compare the specified field

↓

Arrange the documents

↓

Pass the sorted documents
to the next stage
```

That's it.

No calculations.

No filtering.

Just ordering the documents.

---

# Real-World Examples

### Show the Most Expensive Products

```js
{
    $sort: {
        price: -1
    }
}
```

---

### Show the Cheapest Products

```js
{
    $sort: {
        price: 1
    }
}
```

---

### Show the Highest Rated Products

```js
{
    $sort: {
        rating: -1
    }
}
```

---

### Sort Categories by Revenue

```js
[
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
    }
]
```

---

# Common Mistake

At first I thought `$sort` somehow changes the documents.

It doesn't.

Suppose I have

```js
{
    name: "iPhone",
    price: 1000
}
```

After sorting,

```js
{
    name: "iPhone",
    price: 1000
}
```

The document is exactly the same.

Only its position in the pipeline changes.

---

# Mental Model

Whenever I see

```js
{
    $sort: {
        price: -1
    }
}
```

I don't think about syntax anymore.

I imagine MongoDB doing this.

```
Collection

        │
        ▼

Read every document

        │
        ▼

Compare the values
of the specified field

        │
        ▼

Arrange the documents

        │
        ▼

Pass them to
the next stage
```

---

# Quick Summary

| Direction | Meaning                             |
| --------- | ----------------------------------- |
| `1`       | Ascending order (Lowest → Highest)  |
| `-1`      | Descending order (Highest → Lowest) |

---

# Biggest Takeaway

The `$sort` stage doesn't calculate, filter, or modify documents.

It simply changes their order.

Another important thing I learned is that aggregation stages work **one after another**.

That means `$sort` doesn't always sort the original collection.

Sometimes it's sorting the documents produced by a previous stage like `$group`.

Thinking of the aggregation pipeline as a sequence of transformations made the `$sort` stage much easier to understand.
