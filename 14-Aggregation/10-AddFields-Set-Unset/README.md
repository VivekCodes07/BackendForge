# AddFields, Set & Unset (`$addFields`, `$set`, `$unset`)

So far, every aggregation stage I've learned has done one of these things.

- Filter documents
- Reshape documents
- Group documents
- Sort documents
- Skip documents
- Limit documents
- Expand arrays
- Join collections

But then I wondered.

> **What if I want to calculate something new without modifying my collection?**

Imagine I have this document.

```js
{
    name: "Mechanical Keyboard",
    price: 100,
    quantity: 3
}
```

The total cost is

```
100 × 3 = 300
```

But...

There is no field called

```js
totalPrice
```

Should I update the document?

No.

Sometimes I only need that value while running my aggregation pipeline.

That's exactly why MongoDB provides

- `$addFields`
- `$set`
- `$unset`

These stages let me temporarily modify documents flowing through the aggregation pipeline.

The original collection never changes.

---

# Sample Collection

Throughout this lesson, I'll use the following collection.

```js
[
    {
        name: "Mechanical Keyboard",
        category: "Accessories",
        price: 100,
        quantity: 3
    },
    {
        name: "Gaming Mouse",
        category: "Accessories",
        price: 50,
        quantity: 5
    },
    {
        name: "Monitor",
        category: "Electronics",
        price: 300,
        quantity: 2
    }
]
```

Notice something.

Every product has

- name
- category
- price
- quantity

But it doesn't have

```
totalPrice
```

We'll create that ourselves.

---

# What is `$addFields`?

`$addFields` creates new fields inside the aggregation pipeline.

Think of it like saying,

> "Before sending this document to the next stage, add some extra information."

The important part is

MongoDB **doesn't update the original document**.

The new field only exists inside the aggregation result.

---

# Syntax

```js
{
    $addFields: {
        newField: value
    }
}
```

Or

```js
{
    $addFields: {
        fieldOne: valueOne,
        fieldTwo: valueTwo
    }
}
```

You can add one field.

Or many fields.

---

# My First `$addFields`

Let's add a simple field.

```js
db.products.aggregate([
    {
        $addFields: {
            inStock: true
        }
    }
]);
```

Current Document

```js
{
    name: "Mechanical Keyboard",
    price: 100
}
```

MongoDB thinks

```
Take this document

↓

Add a new field

↓

Return the updated document
```

Result

```js
{
    name: "Mechanical Keyboard",
    price: 100,
    inStock: true
}
```

The original collection is still

```js
{
    name: "Mechanical Keyboard",
    price: 100
}
```

Only the aggregation result contains

```js
inStock
```

---

# Adding Multiple Fields

There's no limit to adding just one field.

```js
db.products.aggregate([
    {
        $addFields: {
            currency: "USD",
            available: true
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

    currency: "USD",
    available: true
}
```

MongoDB simply attaches the new fields before passing the document to the next stage.

---

# Creating Calculated Fields

This is where `$addFields` becomes really useful.

Suppose I want to calculate

```
Total Price

↓

Price × Quantity
```

MongoDB provides the `$multiply` operator.

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

Current Document

```js
{
    price: 100,
    quantity: 3
}
```

MongoDB calculates

```
100

×

3

=

300
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

This is much more useful than adding a static value.

Now every document gets its own calculated field.

---

# Overwriting Existing Fields

Another thing I learned is that `$addFields` can also replace existing values.

Suppose I write

```js
db.products.aggregate([
    {
        $addFields: {
            price: 120
        }
    }
]);
```

MongoDB doesn't create another `price` field.

Instead,

it replaces the existing value inside the aggregation result.

Current Document

```js
{
    price: 100
}
```

Result

```js
{
    price: 120
}
```

Again,

the original collection is completely unchanged.

Only the documents flowing through the pipeline are modified.

---

# Understanding the Flow

Whenever I see

```js
{
    $addFields: { ... }
}
```

I imagine MongoDB doing this.

```
Receive Document

        │
        ▼

Create Temporary Copy

        │
        ▼

Add New Fields

        │
        ▼

Pass Updated Document

        │
        ▼

Next Aggregation Stage
```

That's the key idea.

`$addFields` edits a temporary copy of the document.

It never edits the document stored inside the database.

---

# Why is `$addFields` Useful?

Instead of storing calculated values inside the database,

I can calculate them whenever I need them.

For example,

I don't need to permanently store

```js
totalPrice
```

because MongoDB can calculate it every time I run the pipeline.

That keeps the stored data clean while still giving me all the information I need during aggregation.

---

# What is `$set`?

While learning aggregation, I came across another stage called

```js
$set
```

At first, I thought it was something completely different.

But it isn't.

`$set` is simply an alias for `$addFields`.

That means these two pipelines produce the exact same result.

Using `$addFields`

```js
db.products.aggregate([
    {
        $addFields: {
            inStock: true
        }
    }
]);
```

Using `$set`

```js
db.products.aggregate([
    {
        $set: {
            inStock: true
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
    inStock: true
}
```

MongoDB treats both stages the same way.

The only difference is the name.

Some developers prefer `$addFields` because it clearly explains what's happening.

Others prefer `$set` because it's shorter.

You'll see both in real-world projects.

---

# What is `$unset`?

If `$addFields` adds fields,

and `$set` adds or updates fields,

then `$unset` removes fields.

Again,

this only affects the aggregation result.

The original collection remains unchanged.

Suppose I have this document.

```js
{
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 100,
    quantity: 3
}
```

What if I don't want to return the `quantity` field?

I can use

```js
db.products.aggregate([
    {
        $unset: "quantity"
    }
]);
```

Result

```js
{
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 100
}
```

The `quantity` field is removed only from the pipeline result.

---

# Removing Multiple Fields

`$unset` can also remove multiple fields at once.

```js
db.products.aggregate([
    {
        $unset: [
            "price",
            "quantity"
        ]
    }
]);
```

Result

```js
{
    name: "Mechanical Keyboard",
    category: "Accessories"
}
```

This is useful when there are fields that don't need to be included in the final output.

---

# Combining `$addFields` and `$unset`

These stages are often used together.

Suppose I want to calculate the total price,

but I don't want to return the original `quantity`.

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
    },
    {
        $unset: "quantity"
    }
]);
```

Current Document

```js
{
    name: "Mechanical Keyboard",
    price: 100,
    quantity: 3
}
```

Step 1

```text
Add totalPrice

↓

300
```

Step 2

```text
Remove quantity
```

Result

```js
{
    name: "Mechanical Keyboard",
    price: 100,
    totalPrice: 300
}
```

This creates a much cleaner result while keeping the original collection untouched.

---

# Real-World Example

Imagine I'm building an e-commerce application.

Products Collection

```js
{
    name: "Gaming Mouse",
    price: 50,
    quantity: 5,
    supplierEmail: "supplier@example.com"
}
```

For the customer,

I want to return

- Product name
- Price
- Total price

But I don't want to expose the supplier's email.

Pipeline

```js
[
    {
        $addFields: {
            totalPrice: {
                $multiply: [
                    "$price",
                    "$quantity"
                ]
            }
        }
    },
    {
        $unset: "supplierEmail"
    }
]
```

Now the customer receives only the information they actually need.

---

# Another Real-World Example

Suppose I joined two collections using `$lookup`.

Result

```js
{
    product: "Keyboard",

    user: {
        name: "John"
    },

    quantity: 3,

    price: 100
}
```

Now I want to calculate the total price.

```js
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
```

Then remove the quantity.

```js
{
    $unset: "quantity"
}
```

This is a common pattern after `$lookup`.

---

# Common Mistakes

## Mistake 1

Thinking `$addFields` updates the collection.

It doesn't.

The original documents remain exactly the same.

Only the aggregation result is modified.

---

## Mistake 2

Thinking `$set` is different from `$addFields`.

It isn't.

Both stages perform the same job.

The only difference is the name.

---

## Mistake 3

Thinking `$unset` deletes fields from MongoDB.

It doesn't.

It only removes fields from the documents flowing through the pipeline.

The stored documents remain unchanged.

---

# Mental Model

Whenever I see

```js
{
    $addFields: { ... }
}
```

or

```js
{
    $set: { ... }
}
```

I imagine MongoDB doing this.

```text
Receive Document

        │
        ▼

Create Temporary Copy

        │
        ▼

Add or Update Fields

        │
        ▼

Pass Updated Document
```

Whenever I see

```js
{
    $unset: ...
}
```

I imagine

```text
Receive Document

        │
        ▼

Hide Unwanted Fields

        │
        ▼

Pass Cleaner Document
```

The collection itself is never modified.

Only the documents flowing through the aggregation pipeline are changed.

---

# Quick Summary

| Stage | Purpose |
| ------ | ------- |
| `$addFields` | Add new fields or overwrite existing fields |
| `$set` | Alias for `$addFields` |
| `$unset` | Remove fields from the aggregation result |

---

# Biggest Takeaway

Whenever I see

```js
{
    $addFields: { ... }
}
```

or

```js
{
    $set: { ... }
}
```

I don't think

> "Update the database."

I think

> "Create a temporary version of the document with extra or updated fields."

Whenever I see

```js
{
    $unset: ...
}
```

I don't think

> "Delete this field."

I think

> "Hide this field from the aggregation result."

That's the most important idea from this lesson.

These stages only change the documents **inside the aggregation pipeline**.

The original collection is never modified.

Once I understood that, `$addFields`, `$set`, and `$unset` became much easier to use because I stopped thinking about database updates and started thinking about building the exact output I wanted from my aggregation pipeline.