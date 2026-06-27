# `$group` Stage

Today I learned the stage that makes the Aggregation Pipeline feel truly powerful.

Unlike `$match` or `$project`, `$group` doesn't filter or reshape documents.

It **summarizes** them.

This is the stage behind analytics dashboards, reports, leaderboards, and business insights.

---

# Sample Collection

Let's say our collection looks like this:

```js
[
  {
    name: "iPhone",
    category: "Electronics",
    price: 1000
  },
  {
    name: "MacBook",
    category: "Electronics",
    price: 2000
  },
  {
    name: "Chair",
    category: "Furniture",
    price: 300
  },
  {
    name: "Table",
    category: "Furniture",
    price: 500
  }
]
```

---

# Step 1 — What does `$group` actually do?

Suppose we write:

```js
db.products.aggregate([
  {
    $group: {
      _id: "$category"
    }
  }
]);
```

Most tutorials simply say:

> "MongoDB groups the documents."

But what does that actually mean?

Internally, MongoDB creates **temporary buckets**.

```
Electronics
├── { name: "iPhone",  price: 1000 }
└── { name: "MacBook", price: 2000 }

Furniture
├── { name: "Chair", price: 300 }
└── { name: "Table", price: 500 }
```

Notice something important.

The original documents still exist inside each bucket.

MongoDB **doesn't return these buckets**.

They're temporary.

It creates them so it can perform calculations on each group.

Think of each bucket as a small workspace.

---

# Step 2 — Accumulator operators

Once the buckets are created, MongoDB processes **one bucket at a time**.

Every accumulator works on the documents inside the current bucket.

---

## `$sum`

```js
{
    totalRevenue: {
        $sum: "$price"
    }
}
```

MongoDB visits every document inside the bucket.

```
Electronics

1000
2000
-----
3000
```

Output

```js
{
    totalRevenue: 3000
}
```

---

## `$avg`

```js
{
    averagePrice: {
        $avg: "$price"
    }
}
```

MongoDB again looks inside the same bucket.

```
Electronics

1000
2000
-----
1500
```

Output

```js
{
    averagePrice: 1500
}
```

---

## `$sum: 1`

This one confused me at first.

```js
{
    totalProducts: {
        $sum: 1
    }
}
```

Notice we're **not** summing a field.

Instead, MongoDB says:

"For every document I visit, add 1."

```
Electronics

Document 1 → +1
Document 2 → +1

Result = 2
```

That's why this is commonly used for counting documents.

---

## `$max`

```js
{
    highestPrice: {
        $max: "$price"
    }
}
```

MongoDB compares every document in the bucket.

```
1000
2000

Highest = 2000
```

---

## `$min`

```js
{
    lowestPrice: {
        $min: "$price"
    }
}
```

MongoDB compares every document.

```
1000
2000

Lowest = 1000
```

---

## `$push`

This is where it becomes really interesting.

```js
{
    details: {
        $push: {
            name: "$name",
            price: "$price"
        }
    }
}
```

Remember the temporary bucket?

```
Electronics

Document 1
Document 2
```

MongoDB visits every document and creates this object.

```js
{
    name: "$name",
    price: "$price"
}
```

Result

```js
details: [
    {
        name: "iPhone",
        price: 1000
    },
    {
        name: "MacBook",
        price: 2000
    }
]
```

Instead of calculating a number, `$push` collects values into an array.

---

# Putting everything together

```js
db.products.aggregate([
  {
    $group: {
      _id: "$category",

      totalRevenue: {
        $sum: "$price"
      },

      averagePrice: {
        $avg: "$price"
      },

      totalProducts: {
        $sum: 1
      },

      details: {
        $push: {
          productName: "$name",
          price: "$price"
        }
      }
    }
  }
]);
```

Output

```js
[
  {
    _id: "Electronics",
    totalRevenue: 3000,
    averagePrice: 1500,
    totalProducts: 2,
    details: [
      {
        productName: "iPhone",
        price: 1000
      },
      {
        productName: "MacBook",
        price: 2000
      }
    ]
  },
  {
    _id: "Furniture",
    totalRevenue: 800,
    averagePrice: 400,
    totalProducts: 2,
    details: [
      {
        productName: "Chair",
        price: 300
      },
      {
        productName: "Table",
        price: 500
      }
    ]
  }
]
```

---

# Anatomy of `$group`

```js
$group: {

    // How should MongoDB create the buckets?
    _id: <grouping field>,

    // What should MongoDB calculate
    // for every bucket?

    field1: {
        <accumulator>: <expression>
    },

    field2: {
        <accumulator>: <expression>
    }
}
```

---

# My Mental Model

Whenever I see this:

```js
{
    $group: {
        ...
    }
}
```

I don't think

> "Group these documents."

I think

```
Collection
    │
    ▼
Create temporary buckets

Electronics
├── document
└── document

Furniture
├── document
└── document

    │
    ▼
Run accumulator operators

$sum
$avg
$min
$max
$push
...

    │
    ▼
Each bucket becomes ONE output document.
```

That one idea made `$group` finally click for me.

Once you understand the **temporary buckets**, every accumulator suddenly makes sense because they're all just different ways of processing the documents inside each bucket.