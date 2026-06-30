# Count, Facet & Bucket (`$count`, `$facet`, `$bucket`)

Until now, every aggregation stage I've learned helped me transform data.

I learned how to

- filter documents using `$match`
- reshape documents using `$project`
- summarize data using `$group`
- sort documents using `$sort`
- join collections using `$lookup`

But then I started wondering.

> **How do companies build dashboards?**

Think about an admin dashboard of an e-commerce website.

It usually shows things like

- Total Orders
- Pending Orders
- Delivered Orders
- Total Revenue
- Orders by Price Range

When I first saw dashboards like these, I assumed the backend was making lots of separate database queries.

Something like

```
Count all orders.

↓

Count pending orders.

↓

Count delivered orders.

↓

Calculate revenue.

↓

Return everything.
```

Then I learned about MongoDB Aggregation.

Most of these analytics can be generated using a **single aggregation pipeline**.

That's where today's stages come in.

- `$count`
- `$facet`
- `$bucket`

These aren't stages I would use for every query.

Instead,

they shine when building dashboards, reports, and analytics.

---

# Sample Collection

Throughout this lesson, I'll use an `orders` collection.

```js
[
    {
        customer: "John",
        amount: 250,
        status: "Delivered",
        paymentMethod: "Card"
    },
    {
        customer: "Emma",
        amount: 1800,
        status: "Pending",
        paymentMethod: "UPI"
    },
    {
        customer: "Alex",
        amount: 650,
        status: "Delivered",
        paymentMethod: "Cash"
    },
    {
        customer: "Sophia",
        amount: 4200,
        status: "Delivered",
        paymentMethod: "Card"
    },
    {
        customer: "Mike",
        amount: 120,
        status: "Cancelled",
        paymentMethod: "Cash"
    }
]
```

This collection is simple,

but it represents something very real.

Every online store has data like this.

Now let's see how MongoDB can turn it into meaningful insights.

---

# What is `$count`?

The `$count` stage returns the number of documents currently flowing through the aggregation pipeline.

Notice the words

> **currently flowing through the pipeline.**

That's important.

`$count` doesn't always count every document in the collection.

It counts whatever documents are left after the previous stages have finished.

---

# Syntax

```js
{
    $count: "totalOrders"
}
```

The string

```js
"totalOrders"
```

becomes the name of the field in the output.

MongoDB will return something like

```js
{
    totalOrders: 5
}
```

---

# My First `$count`

Suppose I simply write

```js
db.orders.aggregate([
    {
        $count: "totalOrders"
    }
]);
```

MongoDB thinks

```
Receive all documents

↓

Count them

↓

Return only the count
```

Result

```js
{
    totalOrders: 5
}
```

Notice something.

MongoDB no longer returns the actual orders.

Instead,

it returns a brand new document containing the count.

---

# `$count` After `$match`

This is where `$count` becomes much more useful.

Suppose an admin wants to know

> **How many delivered orders do we have?**

Instead of counting everything,

I first filter the orders.

```js
db.orders.aggregate([
    {
        $match: {
            status: "Delivered"
        }
    },
    {
        $count: "deliveredOrders"
    }
]);
```

Execution

```
Orders

↓

Keep Delivered Orders

↓

Count Remaining Documents

↓

Return Result
```

Result

```js
{
    deliveredOrders: 3
}
```

This is why I think of `$count` as

> "Count whatever reaches this stage."

Not

> "Count everything in the collection."

---

# `$count` vs `countDocuments()`

At first,

I wondered why MongoDB even has `$count`.

Doesn't this already exist?

```js
db.orders.countDocuments()
```

Yes,

but there's a difference.

`countDocuments()` simply counts documents in a collection.

It isn't part of an aggregation pipeline.

`$count` works **inside** the pipeline.

That means I can do things like

```text
Match

↓

Lookup

↓

Group

↓

Count
```

The count is based on everything that happened before it.

That's why `$count` is so useful in analytics.

---

# What is `$facet`?

This was one of the coolest aggregation stages I learned.

Normally,

an aggregation pipeline follows one path.

```
Collection

↓

Stage 1

↓

Stage 2

↓

Stage 3

↓

Result
```

But `$facet` changes that.

Instead of one pipeline,

MongoDB creates multiple pipelines.

All of them receive the same input.

Think of it like a road splitting into multiple lanes.

```
Orders

        │
        ▼

──────────────┬──────────────┬──────────────

              │              │

              ▼              ▼

       Count Orders     Pending Orders

              │              │

              ▼              ▼

        Delivered       Revenue

──────────────┴──────────────┴──────────────

                │

                ▼

          One Combined Result
```

This is why dashboards can often be built with a single aggregation query.

---

# Why Do We Need `$facet`?

Imagine building an admin dashboard.

The dashboard needs

- Total Orders
- Pending Orders
- Delivered Orders
- Cancelled Orders

One option is to run four separate queries.

```
Query 1

↓

Query 2

↓

Query 3

↓

Query 4
```

It works,

but it's inefficient.

Instead,

MongoDB lets me calculate everything in one aggregation using `$facet`.

That's what makes this stage so powerful.

---

# My First `$facet`

```js
db.orders.aggregate([
    {
        $facet: {
            totalOrders: [
                {
                    $count: "count"
                }
            ],

            deliveredOrders: [
                {
                    $match: {
                        status: "Delivered"
                    }
                },
                {
                    $count: "count"
                }
            ]
        }
    }
]);
```

Instead of returning one result,

MongoDB now returns multiple results together.

```js
{
    totalOrders: [
        {
            count: 5
        }
    ],

    deliveredOrders: [
        {
            count: 3
        }
    ]
}
```

Each field inside `$facet` is its own mini aggregation pipeline.

That was the biggest "aha!" moment for me.

MongoDB isn't running one pipeline anymore.

It's running several pipelines in parallel on the same set of documents.

---

# Understanding the Flow

Whenever I see

```js
{
    $facet: { ... }
}
```

I imagine MongoDB doing this.

```
Receive Orders

        │
        ▼

Duplicate the Stream

        │
        ├──────────────► Pipeline 1

        ├──────────────► Pipeline 2

        ├──────────────► Pipeline 3

        └──────────────► Pipeline 4

Each pipeline works independently.

        │
        ▼

Combine Every Result

        │
        ▼

Return One Document
```

That mental model made `$facet` much easier to understand.

Instead of thinking about one long pipeline,

I now think about multiple smaller pipelines running side by side.

---

# What is `$bucket`?

After learning `$group`, I thought I already knew how to group documents.

Then I discovered `$bucket`.

At first, I assumed it was just another version of `$group`.

It isn't.

The biggest difference is this.

- `$group` groups documents by **exact values**.
- `$bucket` groups documents by **ranges of values**.

For example,

Suppose I have products with these prices.

```text
₹150
₹350
₹700
₹1200
₹2800
```

Using `$group`

MongoDB would create a separate group for every unique price.

```
150

350

700

1200

2800
```

That's usually **not** what I want.

Instead,

I might want to know

- Budget Products
- Mid-range Products
- Premium Products

That's exactly what `$bucket` does.

---

# Syntax

```js
{
    $bucket: {
        groupBy: "$amount",
        boundaries: [0, 500, 1000, 5000],
        default: "Other"
    }
}
```

Let's understand each option.

## `groupBy`

This is the field MongoDB uses to decide which bucket a document belongs to.

```js
groupBy: "$amount"
```

Here,

MongoDB looks at the order amount.

---

## `boundaries`

These define the bucket ranges.

```js
[0, 500, 1000, 5000]
```

This creates

```text
₹0      - ₹499

₹500    - ₹999

₹1000   - ₹4999
```

---

## `default`

If a document doesn't fit inside any boundary,

MongoDB places it here.

```js
default: "Other"
```

---

# My First `$bucket`

Let's group orders by their amount.

```js
db.orders.aggregate([
    {
        $bucket: {
            groupBy: "$amount",
            boundaries: [0, 500, 1000, 5000],
            default: "Other"
        }
    }
]);
```

MongoDB starts checking every order.

```
₹250

↓

0–499 Bucket


₹650

↓

500–999 Bucket


₹4200

↓

1000–4999 Bucket
```

Result

```js
{
    _id: 0,
    count: 2
}

{
    _id: 500,
    count: 1
}

{
    _id: 1000,
    count: 2
}
```

Notice something.

MongoDB automatically creates a `count` field for every bucket.

That tells me how many documents belong to that range.

---

# Real-World Example

Imagine I own an online store.

Instead of showing thousands of products,

I want analytics like this.

```
Budget Orders

↓

12 Orders


Mid-range Orders

↓

34 Orders


Premium Orders

↓

8 Orders
```

That's much more meaningful than seeing every order individually.

This is exactly the kind of report `$bucket` is designed for.

---

# Building a Dashboard with `$facet`

Let's go back to our admin dashboard.

The dashboard needs

- Total Orders
- Delivered Orders
- Pending Orders
- Cancelled Orders

Instead of four different queries,

I can build everything in one aggregation.

```js
db.orders.aggregate([
    {
        $facet: {

            totalOrders: [
                {
                    $count: "count"
                }
            ],

            deliveredOrders: [
                {
                    $match: {
                        status: "Delivered"
                    }
                },
                {
                    $count: "count"
                }
            ],

            pendingOrders: [
                {
                    $match: {
                        status: "Pending"
                    }
                },
                {
                    $count: "count"
                }
            ],

            cancelledOrders: [
                {
                    $match: {
                        status: "Cancelled"
                    }
                },
                {
                    $count: "count"
                }
            ]
        }
    }
]);
```

Result

```js
{
    totalOrders: [
        {
            count: 5
        }
    ],

    deliveredOrders: [
        {
            count: 3
        }
    ],

    pendingOrders: [
        {
            count: 1
        }
    ],

    cancelledOrders: [
        {
            count: 1
        }
    ]
}
```

Everything comes back in one response.

That's much more efficient than making multiple database queries.

---

# When Would I Use These Stages?

### Use `$count`

When I only need the number of documents.

Examples

- Total users
- Total orders
- Total products

---

### Use `$facet`

When I need multiple reports at once.

Examples

- Admin dashboards
- Analytics pages
- Business reports

---

### Use `$bucket`

When I want to group data into ranges.

Examples

- Products by price
- Customers by age
- Employees by salary
- Students by marks

---

# Common Mistakes

## Mistake 1

Thinking `$count` always counts the entire collection.

It doesn't.

It only counts the documents that reach that stage.

---

## Mistake 2

Thinking `$facet` runs one pipeline.

It actually runs multiple independent pipelines on the same input.

---

## Mistake 3

Using `$group` when ranges are needed.

If I need

```
18–25

26–35

36–45
```

I should use `$bucket`.

Not `$group`.

---

# Mental Model

Whenever I see

```js
$count
```

I think

> "How many documents made it this far?"

Whenever I see

```js
$facet
```

I think

> "Split the pipeline into multiple mini pipelines and combine their results."

Whenever I see

```js
$bucket
```

I think

> "Place documents into predefined ranges."

---

# Quick Summary

| Stage | Purpose |
| ------ | ------- |
| `$count` | Count the documents currently in the pipeline |
| `$facet` | Run multiple aggregation pipelines in parallel |
| `$bucket` | Group documents into ranges |

---

# Biggest Takeaway

Until this lesson, most aggregation stages helped me transform individual documents.

This lesson felt different.

Instead of changing documents,

these stages helped me answer business questions.

- How many orders do we have?
- How many are delivered?
- Which price range has the most orders?
- Can I build an entire dashboard with one query?

The answer to all of those is **yes**.

Whenever I see

```js
$count
```

I think,

> "Count what's currently flowing through the pipeline."

Whenever I see

```js
$facet
```

I think,

> "Run multiple reports at the same time."

Whenever I see

```js
$bucket
```

I think,

> "Organize data into meaningful ranges."

This lesson showed me that aggregation isn't just about transforming data.

It's also about turning raw data into insights—the kind of insights that power admin dashboards, analytics pages, and business reports.