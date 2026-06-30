# Aggregation Operators

Until now, I've learned a lot of aggregation stages.

For example,

- `$match`
- `$project`
- `$group`
- `$sort`
- `$lookup`
- `$unwind`

Every stage had a specific job.

Some filtered documents.

Some grouped documents.

Some joined collections.

But while learning those stages, I kept seeing things like

```js
$sum

$avg

$multiply

$cond
```

At first, I thought these were aggregation stages too.

They aren't.

They're called **aggregation operators**.

This lesson is all about understanding the difference.

---

# Stages vs Operators

This confused me when I first started learning aggregation.

I kept mixing stages and operators.

Here's the easiest way I remember them.

### Aggregation Stages

Stages decide **where the document goes next**.

For example,

```js
{
    $match: {
        category: "Electronics"
    }
}
```

`$match` filters documents.

Or

```js
{
    $group: {
        _id: "$category"
    }
}
```

`$group` creates groups.

These are aggregation stages.

---

### Aggregation Operators

Operators do the actual work **inside** a stage.

For example,

```js
{
    $group: {
        _id: "$category",

        totalRevenue: {
            $sum: "$price"
        }
    }
}
```

Here,

`$group`

is the stage.

Inside it,

`$sum`

is the operator.

That's the biggest difference.

I now think about it like this.

```
Pipeline

↓

Stage

↓

Operator

↓

Result
```

Stages control the flow.

Operators perform calculations.

---

# Sample Collection

Throughout this lesson, I'll use a simple products collection.

```js
[
    {
        name: "Mechanical Keyboard",
        category: "Accessories",
        price: 100,
        quantity: 3,
        brand: "KeyPro",
        tags: ["gaming", "rgb", "wireless"]
    },
    {
        name: "Gaming Mouse",
        category: "Accessories",
        price: 50,
        quantity: 5,
        brand: "ClickX",
        tags: ["gaming", "lightweight"]
    },
    {
        name: "Monitor",
        category: "Electronics",
        price: 300,
        quantity: 2,
        brand: "ViewMax",
        tags: ["4k", "ips"]
    }
]
```

Instead of memorizing operators,

I'll use this collection to solve real problems.

---

# Arithmetic Operators

Arithmetic operators help me perform mathematical calculations.

The ones I use most are

- `$add`
- `$subtract`
- `$multiply`
- `$divide`

Let's see where they're actually useful.

---

# `$multiply`

Suppose I'm building an e-commerce website.

Every product has

```js
price
```

and

```js
quantity
```

But customers usually care about

```
Total Price

↓

Price × Quantity
```

Instead of storing

```js
totalPrice
```

inside MongoDB,

I can calculate it.

```js
db.products.aggregate([
    {
        $addFields: {
            totalPrice: {
                $multiply: [
                    "$price",
                    "$quantity"
                ]
            }
        }
    }
]);
```

Result

```js
{
    name: "Mechanical Keyboard",
    price: 100,
    quantity: 3,
    totalPrice: 300
}
```

This is one of the most common uses of `$multiply`.

---

# `$add`

Imagine an online shopping cart.

The customer buys

- Keyboard → ₹100
- Mouse Pad → ₹20

Instead of manually adding them,

MongoDB can calculate the total.

```js
{
    $add: [
        100,
        20
    ]
}
```

Result

```
120
```

Whenever I need to add multiple values,

`$add` is the operator to use.

---

# `$subtract`

Now imagine the customer has a discount coupon.

Original Price

```
₹1000
```

Discount

```
₹150
```

I can calculate the final price.

```js
{
    $subtract: [
        1000,
        150
    ]
}
```

Result

```
850
```

This is useful for

- Discounts
- Refunds
- Remaining balances

---

# `$divide`

Suppose a product has

```text
Total Sales

↓

₹12,000
```

And

```text
Units Sold

↓

40
```

To calculate the average selling price,

I can divide one value by another.

```js
{
    $divide: [
        12000,
        40
    ]
}
```

Result

```
300
```

This operator is useful whenever I need averages or ratios.

---

# String Operators

Numbers aren't the only thing I need to work with.

Sometimes,

I need to format text.

MongoDB provides several string operators for that.

The ones I use most are

- `$concat`
- `$toUpper`
- `$toLower`

---

# `$concat`

Imagine a user profile.

```js
{
    firstName: "John",
    lastName: "Doe"
}
```

Instead of storing

```text
fullName
```

inside the database,

I can generate it whenever I need it.

```js
db.users.aggregate([
    {
        $addFields: {
            fullName: {
                $concat: [
                    "$firstName",
                    " ",
                    "$lastName"
                ]
            }
        }
    }
]);
```

Result

```js
{
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe"
}
```

---

# `$toUpper`

Suppose I want product brands to appear in uppercase.

Instead of

```
KeyPro
```

I want

```
KEYPRO
```

```js
{
    $toUpper: "$brand"
}
```

Result

```
KEYPRO
```

---

# `$toLower`

The opposite is also possible.

```js
{
    $toLower: "$brand"
}
```

Result

```
keypro
```

This is useful when I want consistent formatting before comparing strings.

---

# What I Learned So Far

Aggregation operators are not stages.

Stages decide the flow of the pipeline.

Operators perform calculations inside those stages.

Arithmetic operators help me work with numbers.

String operators help me work with text.

Instead of memorizing syntax,

I'm starting to think about the problems they solve.

Whenever I need to calculate something,

I reach for an arithmetic operator.

Whenever I need to format text,

I reach for a string operator.

---

# Array Operators

Arrays are everywhere.

Think about a product on Amazon.

```js
{
    name: "Mechanical Keyboard",
    tags: [
        "gaming",
        "wireless",
        "rgb"
    ]
}
```

Or a student.

```js
{
    name: "Alex",
    marks: [85, 91, 78]
}
```

Or even a blog post.

```js
{
    title: "Learning MongoDB",
    comments: [
        { user: "John" },
        { user: "Emma" },
        { user: "Mike" }
    ]
}
```

Working with arrays is a common task.

MongoDB provides several operators that make this much easier.

---

# `$size`

Suppose I'm building an online store.

Each product has tags.

```js
{
    tags: [
        "gaming",
        "wireless",
        "rgb"
    ]
}
```

Sometimes I don't need the tags themselves.

I only need to know

> **How many tags does this product have?**

That's where `$size` comes in.

```js
db.products.aggregate([
    {
        $addFields: {
            totalTags: {
                $size: "$tags"
            }
        }
    }
]);
```

Result

```js
{
    tags: [
        "gaming",
        "wireless",
        "rgb"
    ],

    totalTags: 3
}
```

---

# `$arrayElemAt`

Sometimes I only need one item from an array.

Suppose I want the first tag.

```js
{
    $arrayElemAt: [
        "$tags",
        0
    ]
}
```

Result

```
gaming
```

Or maybe the second tag.

```js
{
    $arrayElemAt: [
        "$tags",
        1
    ]
}
```

Result

```
wireless
```

Think of it exactly like accessing an array in JavaScript.

```js
tags[0]
```

---

# `$first`

If all I want is the first element,

MongoDB gives me a cleaner option.

```js
{
    $first: "$tags"
}
```

Result

```
gaming
```

---

# `$last`

Likewise,

to get the final element,

I can use

```js
{
    $last: "$tags"
}
```

Result

```
rgb
```

---

# Conditional Operators

Real applications constantly make decisions.

Imagine an e-commerce website.

If a product costs more than ₹1000,

I want to label it

```
Premium
```

Otherwise,

```
Budget
```

That's exactly what `$cond` is for.

---

# `$cond`

```js
db.products.aggregate([
    {
        $addFields: {
            categoryLabel: {
                $cond: {
                    if: {
                        $gte: [
                            "$price",
                            1000
                        ]
                    },
                    then: "Premium",
                    else: "Budget"
                }
            }
        }
    }
]);
```

Result

```js
{
    price: 1500,
    categoryLabel: "Premium"
}
```

This operator is basically an

```
if...else
```

inside the aggregation pipeline.

---

# `$ifNull`

Missing values are very common.

Imagine a user profile.

```js
{
    name: "John",
    nickname: null
}
```

Showing

```
null
```

to users doesn't look great.

Instead,

I can provide a fallback.

```js
{
    $ifNull: [
        "$nickname",
        "Anonymous"
    ]
}
```

Result

```
Anonymous
```

This makes the output much cleaner.

---

# Date Operators

Most applications store timestamps.

For example,

```js
{
    createdAt: ISODate("2025-08-15T10:30:00Z")
}
```

Sometimes I don't need the full date.

I only need the year.

Or the month.

Or the day.

MongoDB provides operators for that too.

---

# `$year`

```js
{
    $year: "$createdAt"
}
```

Result

```
2025
```

Useful for yearly reports.

---

# `$month`

```js
{
    $month: "$createdAt"
}
```

Result

```
8
```

Useful for monthly analytics.

---

# `$dayOfMonth`

```js
{
    $dayOfMonth: "$createdAt"
}
```

Result

```
15
```

Useful for daily reports or calendars.

---

# Real-World Examples

By this point, I started noticing that aggregation operators solve real business problems.

An online store might use

- `$multiply` to calculate the total cost of an order.
- `$subtract` to apply discounts.
- `$cond` to label premium products.
- `$size` to count product tags.
- `$year` and `$month` to generate sales reports.

A social media platform might use

- `$concat` to display a user's full name.
- `$ifNull` to handle missing profile information.
- `$first` to show the first uploaded image.

These operators aren't random syntax.

They're tools for answering real questions.

---

# Common Mistakes

## Mistake 1

Thinking operators are stages.

They're not.

Stages control the pipeline.

Operators perform work inside a stage.

---

## Mistake 2

Trying to use an operator by itself.

This won't work.

```js
{
    $multiply: [
        "$price",
        "$quantity"
    ]
}
```

Operators always live inside a stage like

- `$project`
- `$group`
- `$addFields`
- `$set`

---

## Mistake 3

Memorizing operators.

Instead,

remember the problem they solve.

Need math?

Use arithmetic operators.

Need text formatting?

Use string operators.

Need array manipulation?

Use array operators.

Need decisions?

Use conditional operators.

---

# Mental Model

Whenever I write an aggregation pipeline,

I think

```
Collection

↓

Aggregation Stage

↓

Aggregation Operator

↓

Result
```

The stage controls **where** the document goes.

The operator controls **what happens** to the document.

That simple distinction helped everything click.

---

# Quick Summary

| Category | Common Operators |
| -------- | ---------------- |
| Arithmetic | `$add`, `$subtract`, `$multiply`, `$divide` |
| String | `$concat`, `$toUpper`, `$toLower` |
| Array | `$size`, `$arrayElemAt`, `$first`, `$last` |
| Conditional | `$cond`, `$ifNull` |
| Date | `$year`, `$month`, `$dayOfMonth` |

---

# Biggest Takeaway

When I first started learning aggregation,

I thought everything beginning with `$` was an aggregation stage.

Now I know that's not true.

Stages and operators have different responsibilities.

Stages decide how documents move through the pipeline.

Operators decide what happens to those documents inside each stage.

Instead of trying to memorize dozens of operators, I now focus on the kind of problem I'm solving.

If I need to calculate values, I use arithmetic operators.

If I need to format text, I use string operators.

If I need to work with arrays, I use array operators.

If I need decision-making, I use conditional operators.

And if I need information from dates, I use date operators.

That shift in thinking made aggregation feel much more intuitive.

Instead of remembering syntax, I'm learning to recognize patterns and choose the right operator for the job.