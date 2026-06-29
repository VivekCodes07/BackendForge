# Unwind Stage (`$unwind`)

In the previous lessons, every aggregation stage I learned had one thing in common.

One document went in.

One document came out.

For example,

`$match`

```
1 Document

↓

1 Document
```

`$project`

```
1 Document

↓

1 Document
```

`$sort`

```
5 Documents

↓

Same 5 Documents

(Just in a different order.)
```

Even `$group` reduced multiple documents into summary documents.

But today I learned something completely different.

`$unwind`

This stage can take **one document** and turn it into **multiple documents**.

That completely changed the way I think about aggregation.

---

# Sample Collection

Throughout this lesson, I'll use the following collection.

```js
[
    {
        name: "John",
        hobbies: ["Gaming", "Reading", "Coding"]
    },
    {
        name: "Emma",
        hobbies: ["Cooking", "Traveling"]
    },
    {
        name: "Alex",
        hobbies: ["Photography"]
    }
]
```

Notice something.

The **hobbies** field is an array.

Instead of storing a single value,

each document stores multiple values.

That's exactly where `$unwind` becomes useful.

---

# What is `$unwind`?

The `$unwind` stage breaks an array into individual documents.

Instead of returning the entire array,

MongoDB creates a new document for **each element** inside the array.

Think of it like opening a box.

Before `$unwind`

```
📦

Gaming

Reading

Coding
```

After `$unwind`

```
📄 Gaming

📄 Reading

📄 Coding
```

The array disappears.

Each element becomes its own document.

---

# Syntax

```js
{
    $unwind: "$hobbies"
}
```

Notice something.

Unlike `$sort`

```js
{
    $sort: {
        price: -1
    }
}
```

or `$limit`

```js
{
    $limit: 5
}
```

`$unwind` only needs the path of the array.

MongoDB already knows

> "Break this array into separate documents."

---

# My First `$unwind`

Suppose I write

```js
db.users.aggregate([
    {
        $unwind: "$hobbies"
    }
]);
```

Current Collection

```text
John

Gaming
Reading
Coding
```

MongoDB thinks

```
Gaming

↓

Create Document

Reading

↓

Create Document

Coding

↓

Create Document
```

Result

```js
{
    name: "John",
    hobbies: "Gaming"
}

{
    name: "John",
    hobbies: "Reading"
}

{
    name: "John",
    hobbies: "Coding"
}
```

One document became three documents.

That is the entire purpose of `$unwind`.

---

# Understanding What Actually Changes

At first, I thought MongoDB was splitting the array.

That's only partially true.

MongoDB isn't modifying the original collection.

Instead,

it's creating new documents inside the aggregation pipeline.

Original Document

```js
{
    name: "John",
    hobbies: [
        "Gaming",
        "Reading",
        "Coding"
    ]
}
```

After `$unwind`

```js
{
    name: "John",
    hobbies: "Gaming"
}
```

```js
{
    name: "John",
    hobbies: "Reading"
}
```

```js
{
    name: "John",
    hobbies: "Coding"
}
```

The original document still exists inside the collection.

Only the aggregation result changes.

---

# Multiple Documents

Let's include every user.

Current Collection

```text
John

Gaming
Reading
Coding

Emma

Cooking
Traveling

Alex

Photography
```

Now apply

```js
{
    $unwind: "$hobbies"
}
```

MongoDB creates

```text
John
Gaming

John
Reading

John
Coding

Emma
Cooking

Emma
Traveling

Alex
Photography
```

Notice something interesting.

John still appears three times.

Emma appears twice.

Alex appears once.

Why?

Because every value inside the array becomes a new document.

---

# Why Do We Need `$unwind`?

Suppose someone asks

> "How many users enjoy Coding?"

Can MongoDB group arrays directly?

Not in the way we want.

Instead,

we first convert every hobby into its own document.

Then grouping becomes easy.

Pipeline

```js
[
    {
        $unwind: "$hobbies"
    },
    {
        $group: {
            _id: "$hobbies",
            totalUsers: {
                $sum: 1
            }
        }
    }
]
```

Execution

```
Collection

↓

$unwind

↓

Gaming

Reading

Coding

Cooking

Traveling

Photography

↓

$group

↓

Count Every Hobby
```

Now MongoDB can calculate

```
Gaming

↓

1 User

Reading

↓

1 User

Coding

↓

1 User
```

Without `$unwind`,

MongoDB would still see arrays.

After `$unwind`,

MongoDB sees normal documents again.

That's why these two stages are so commonly used together.

---

# One Document Becomes Many

This is the biggest mindset shift.

Before today,

every stage I learned either

- filtered documents,
- reshaped documents,
- or reordered documents.

`$unwind` does something completely different.

It changes the **number of documents**.

```
Before

1 Document

↓

After

3 Documents
```

That's why `$unwind` feels so different from the other stages.

It's the first stage that can increase the number of documents flowing through the pipeline.

---

# Combining `$unwind` and `$match`

Now that every hobby becomes its own document,

I can filter them just like any other field.

Suppose I only want users whose hobby is **Coding**.

```js
db.users.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $match: {
            hobbies: "Coding"
        }
    }
]);
```

Let's visualize the execution.

Current Collection

```text
John
Gaming
Reading
Coding

Emma
Cooking
Traveling

Alex
Photography
```

### Step 1

Apply `$unwind`.

```text
John - Gaming

John - Reading

John - Coding

Emma - Cooking

Emma - Traveling

Alex - Photography
```

### Step 2

Apply `$match`.

```text
John - Coding ✅
```

Result

```js
{
    name: "John",
    hobbies: "Coding"
}
```

Notice how `$match` becomes much simpler once every hobby is its own document.

---

# Combining `$unwind` and `$group`

This is probably the most common use of `$unwind`.

Suppose I want to know

> **How many users have each hobby?**

```js
db.users.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $group: {
            _id: "$hobbies",
            totalUsers: {
                $sum: 1
            }
        }
    }
]);
```

Execution

```text
Collection
      │
      ▼

$unwind

      │
      ▼

Gaming

Reading

Coding

Cooking

Traveling

Photography

      │
      ▼

$group

      │
      ▼

Count each hobby
```

Result

```text
Gaming      → 1

Reading     → 1

Coding      → 1

Cooking     → 1

Traveling   → 1

Photography → 1
```

Without `$unwind`, MongoDB would group entire arrays instead of individual hobbies.

---

# Combining `$unwind` and `$sort`

Once every array element becomes its own document,

we can sort them like any other value.

```js
db.users.aggregate([
    {
        $unwind: "$hobbies"
    },
    {
        $sort: {
            hobbies: 1
        }
    }
]);
```

MongoDB now sorts

```text
Coding

↓

Cooking

↓

Gaming

↓

Photography

↓

Reading

↓

Traveling
```

Again,

this only works because `$unwind` transformed array elements into normal field values.

---

# Real-World Example

Imagine an e-commerce application.

Each order looks like this.

```js
{
    orderId: 101,
    customer: "John",
    products: [
        "Keyboard",
        "Mouse",
        "Monitor"
    ]
}
```

Now suppose I want to know

> **How many times each product was sold?**

If I group immediately,

MongoDB groups entire arrays.

Instead,

I first unwind the products.

```js
[
    {
        $unwind: "$products"
    },
    {
        $group: {
            _id: "$products",
            totalSales: {
                $sum: 1
            }
        }
    }
]
```

Execution

```text
Order

↓

Keyboard
Mouse
Monitor

↓

$unwind

↓

Keyboard

Mouse

Monitor

↓

$group

↓

Count Sales
```

This is one of the biggest real-world uses of `$unwind`.

---

# Empty Arrays

What happens if the array is empty?

Example

```js
{
    name: "Alex",
    hobbies: []
}
```

By default,

MongoDB doesn't have any array elements to create documents from.

So that document disappears from the pipeline.

The same happens if the field is missing.

---

# `preserveNullAndEmptyArrays`

Sometimes,

I don't want those documents to disappear.

MongoDB provides an option for that.

```js
{
    $unwind: {
        path: "$hobbies",
        preserveNullAndEmptyArrays: true
    }
}
```

Now,

even if

```js
hobbies: []
```

or

```js
hobbies: null
```

the document continues through the pipeline.

This option is especially useful when working with incomplete or optional data.

---

# Common Mistakes

## Mistake 1

Thinking `$unwind` changes the collection.

It doesn't.

The original document stays exactly the same.

Only the aggregation pipeline receives the unwound documents.

---

## Mistake 2

Thinking arrays are deleted.

They're not.

MongoDB simply creates new documents where each document contains one array element.

---

## Mistake 3

Grouping arrays without unwinding.

Instead of

```js
$group
```

I should usually think

```text
$unwind

↓

$group
```

That combination solves many analytics problems.

---

# Mental Model

Whenever I see

```js
{
    $unwind: "$hobbies"
}
```

I imagine MongoDB doing this.

```text
Receive Document

        │
        ▼

Gaming
Reading
Coding

        │
        ▼

Create Document

Create Document

Create Document

        │
        ▼

Pass all three documents
to the next stage.
```

The original document isn't modified.

The pipeline simply receives more documents than before.

---

# Quick Summary

| Stage | Purpose |
| ------ | ------- |
| `$match` | Filter documents |
| `$project` | Reshape documents |
| `$group` | Create summary documents |
| `$sort` | Change document order |
| `$limit` | Keep the first N documents |
| `$skip` | Ignore the first N documents |
| `$unwind` | Convert array elements into separate documents |

---

# Biggest Takeaway

Whenever I see

```js
{
    $unwind: "$arrayField"
}
```

I don't think

> "Split the array."

I think

> "Create one new document for every element inside the array."

That's a much better mental model.

The original collection never changes.

Only the aggregation pipeline receives more documents.

Once I understood that,

`$unwind` became much easier to combine with stages like `$match`, `$group`, and `$sort`.

Instead of seeing one document containing an array,

I now imagine many individual documents flowing through the rest of the aggregation pipeline.

That single idea unlocked one of the most powerful stages in MongoDB Aggregation.