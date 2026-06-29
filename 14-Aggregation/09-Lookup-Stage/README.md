# Lookup Stage (`$lookup`)

So far, every aggregation stage I've learned has worked with **a single collection**.

For example,

`$match`

filters documents from one collection.

`$project`

reshapes documents from one collection.

`$group`

creates summary documents from one collection.

Even `$unwind`

still works with documents from the same collection.

But then I had a question.

> **What if the data I need is stored in another collection?**

Imagine I have two collections.

Users

```js
{
    _id: 1,
    name: "John",
    city: "New York"
}
```

Orders

```js
{
    _id: 101,
    userId: 1,
    product: "Keyboard",
    price: 120
}
```

Looking at the **orders** collection,

I know the `userId`.

But I don't know the user's name.

I don't know their city.

I don't know anything about the user except their ID.

That's where `$lookup` comes in.

---

# What is `$lookup`?

The `$lookup` stage lets MongoDB retrieve matching documents from another collection.

You can think of it like asking MongoDB

> "For every document I'm currently looking at, go to another collection, find the matching document, and attach it here."

Unlike previous stages,

`$lookup` doesn't calculate anything.

It doesn't filter documents.

It doesn't sort documents.

Instead,

it combines related data from two collections.

If you've used SQL before,

this is very similar to a **JOIN**.

---

# Sample Collections

Throughout this lesson, I'll use these two collections.

## Users Collection

```js
[
    {
        _id: 1,
        name: "John",
        city: "New York"
    },
    {
        _id: 2,
        name: "Emma",
        city: "London"
    },
    {
        _id: 3,
        name: "Alex",
        city: "Toronto"
    }
]
```

---

## Orders Collection

```js
[
    {
        _id: 101,
        userId: 1,
        product: "Keyboard",
        price: 120
    },
    {
        _id: 102,
        userId: 2,
        product: "Mouse",
        price: 60
    },
    {
        _id: 103,
        userId: 1,
        product: "Monitor",
        price: 350
    }
]
```

Notice something.

The `orders` collection doesn't store the user's name.

Instead,

it stores

```js
userId
```

That field points to a document inside the **users** collection.

---

# What Problem Does `$lookup` Solve?

Suppose I query the orders collection.

```js
db.orders.find()
```

Result

```js
{
    _id: 101,
    userId: 1,
    product: "Keyboard"
}
```

This tells me

- Which product was ordered.

But not

- Who ordered it.

To find that information,

I'd need another query.

Instead,

MongoDB allows me to do everything inside one aggregation pipeline.

That's exactly what `$lookup` is for.

---

# Syntax

```js
{
    $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
    }
}
```

At first,

these four fields looked confusing.

After breaking them down,

they became much easier to remember.

---

## `from`

```js
from: "users"
```

This tells MongoDB

> Which collection should I search?

Here,

MongoDB searches inside

```
users
```

---

## `localField`

```js
localField: "userId"
```

This field exists in the **current collection**.

In our case,

MongoDB starts with

```
orders
```

Each order has

```js
userId
```

---

## `foreignField`

```js
foreignField: "_id"
```

This field exists in the other collection.

MongoDB compares

```
orders.userId
```

with

```
users._id
```

If they match,

MongoDB has found the correct user.

---

## `as`

```js
as: "user"
```

After MongoDB finds the matching document,

where should it store it?

Inside a new field called

```
user
```

---

# My First `$lookup`

Let's put everything together.

```js
db.orders.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    }
]);
```

Now let's imagine what MongoDB is doing.

Current Order

```js
{
    _id: 101,
    userId: 1,
    product: "Keyboard"
}
```

MongoDB thinks

```
Current userId

↓

1

↓

Go to users collection

↓

Find _id = 1

↓

Found John

↓

Attach user information
```

Result

```js
{
    _id: 101,
    userId: 1,
    product: "Keyboard",

    user: [
        {
            _id: 1,
            name: "John",
            city: "New York"
        }
    ]
}
```

Something surprised me here.

The result wasn't

```js
user: { ... }
```

Instead,

MongoDB returned

```js
user: [
    {
        ...
    }
]
```

An array.

Why?

Because `$lookup` **always returns an array**.

Even if only one document matches.

That confused me at first,

but it actually makes sense.

Sometimes one document can match multiple documents.

MongoDB keeps the result consistent by always returning an array.

---

# Understanding the Flow

Whenever I see

```js
{
    $lookup: { ... }
}
```

I imagine MongoDB doing this.

```
Orders Collection

        │
        ▼

Take One Order

        │
        ▼

Read userId

        │
        ▼

Search Users Collection

        │
        ▼

Find Matching User

        │
        ▼

Attach User Information

        │
        ▼

Return Updated Document
```

Notice something.

MongoDB doesn't permanently merge the collections.

The original collections remain unchanged.

The joined data only exists in the aggregation result.

---

# One Order at a Time

This was another thing I misunderstood.

I thought MongoDB somehow joined the entire collections together.

That's not really what's happening.

Instead,

MongoDB processes one document at a time.

Imagine the orders collection.

```text
Order 101

↓

Find User

↓

Attach User
```

Then

```text
Order 102

↓

Find User

↓

Attach User
```

Then

```text
Order 103

↓

Find User

↓

Attach User
```

Every order gets its own lookup.

That's why it's easier for me to think about `$lookup` as

> "For every document currently flowing through the pipeline, fetch related documents from another collection."

That mental model makes the stage much easier to understand.

---

# Why Does `$lookup` Return an Array?

This was the first thing that confused me.

I expected something like this.

```js
{
    user: {
        _id: 1,
        name: "John"
    }
}
```

Instead,

MongoDB returned

```js
{
    user: [
        {
            _id: 1,
            name: "John"
        }
    ]
}
```

Why?

Because MongoDB doesn't know how many documents might match.

Sometimes,

there may be only one matching document.

Sometimes,

there may be many.

Instead of changing the output format every time,

MongoDB always returns an array.

This makes the result predictable.

Even if there's only one matching document,

it's still wrapped inside an array.

---

# Combining `$lookup` and `$unwind`

This is probably the most common aggregation pattern.

After `$lookup`,

the joined data looks like this.

```js
{
    _id: 101,
    product: "Keyboard",

    user: [
        {
            _id: 1,
            name: "John",
            city: "New York"
        }
    ]
}
```

Since `user` is an array,

I can use `$unwind`.

```js
db.orders.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    }
]);
```

Now the result becomes

```js
{
    _id: 101,
    product: "Keyboard",

    user: {
        _id: 1,
        name: "John",
        city: "New York"
    }
}
```

Much cleaner.

Now `user` is a normal object instead of an array.

This is one of the reasons learning `$unwind` before `$lookup` was helpful.

---

# Real-World Example

Imagine an e-commerce application.

Products Collection

```js
{
    _id: 1,
    name: "Keyboard",
    categoryId: 101
}
```

Categories Collection

```js
{
    _id: 101,
    name: "Accessories"
}
```

Looking only at the product,

I know

```js
categoryId
```

But I don't know the category name.

Using `$lookup`

```js
db.products.aggregate([
    {
        $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
        }
    }
]);
```

MongoDB attaches the matching category.

Result

```js
{
    name: "Keyboard",

    category: [
        {
            _id: 101,
            name: "Accessories"
        }
    ]
}
```

Exactly the same idea as the users and orders example.

The only thing that changes is the collections.

---

# Another Real-World Example

Suppose I'm building a blogging platform.

Posts Collection

```js
{
    title: "Learning Aggregation",
    authorId: 5
}
```

Authors Collection

```js
{
    _id: 5,
    name: "Vivek"
}
```

Without `$lookup`

I only know

```
authorId
```

With `$lookup`

MongoDB can attach the author's details.

Now every blog post also contains information about its author.

---

# Common Mistakes

## Mistake 1

Mixing up `localField` and `foreignField`.

Remember

```
Current Collection

↓

localField
```

```
Other Collection

↓

foreignField
```

That's an easy way to remember it.

---

## Mistake 2

Expecting an object instead of an array.

Remember,

`$lookup` always returns an array.

If I need a single object,

I can use

```js
{
    $unwind: "$user"
}
```

---

## Mistake 3

Thinking `$lookup` permanently joins collections.

It doesn't.

The original collections remain unchanged.

The joined data only exists inside the aggregation result.

---

# Mental Model

Whenever I see

```js
{
    $lookup: {
        from: "...",
        localField: "...",
        foreignField: "...",
        as: "..."
    }
}
```

I imagine MongoDB doing this.

```text
Current Document

        │
        ▼

Read Local Field

        │
        ▼

Go to Another Collection

        │
        ▼

Find Matching Document

        │
        ▼

Attach Matching Document

        │
        ▼

Return Updated Document
```

That's all `$lookup` really does.

It fetches related data and temporarily attaches it to the current document.

---

# Quick Summary

| Option | Purpose |
| ------- | ------- |
| `from` | Collection to search |
| `localField` | Field in the current collection |
| `foreignField` | Matching field in the other collection |
| `as` | Name of the new field that stores the matched documents |

---

# Biggest Takeaway

Whenever I see

```js
{
    $lookup: { ... }
}
```

I don't think

> "Join two collections."

I think

> "For every document currently flowing through the pipeline, find the matching documents from another collection and temporarily attach them."

That mental model is much easier to understand.

Another important thing I learned is that `$lookup` **always returns an array**, even if only one document matches.

If I want a normal object instead of an array, I can simply use `$unwind` after `$lookup`.

That's why these two stages are often used together.

By the end of this lesson, I no longer see `$lookup` as something complicated.

I simply see it as MongoDB's way of bringing related data from another collection into the current aggregation pipeline, one document at a time.