# Common Validation Keywords

## Why Am I Learning This?

In the previous lesson, I learned how to create my first validated collection using:

* `validator`
* `$jsonSchema`
* `bsonType`
* `required`
* `properties`

That was enough to make sure:

* Required fields exist.
* Fields have the correct data types.

But then I realized something.

Just because the data type is correct doesn't mean the data itself is valid.

For example:

```javascript
{
    name: "",
    price: -500,
    category: "Electronics"
}
```

MongoDB would accept this if I only checked the data types.

The `name` is still a string.

The `price` is still an integer.

But this isn't meaningful data.

That's why MongoDB provides additional validation keywords.

These keywords let me validate the **value**, not just the **type**.

---

# `minLength`

Imagine every product should have a meaningful name.

Would this be useful?

```javascript
{
    name: ""
}
```

No.

Or even:

```javascript
{
    name: "A"
}
```

Probably not.

I can tell MongoDB that the name must contain at least 3 characters.

```javascript
name: {
    bsonType: "string",
    minLength: 3
}
```

Now:

```javascript
{
    name: "TV"
}
```

❌ Rejected

Because its length is only 2.

---

# `maxLength`

Sometimes I also want to prevent extremely long values.

For example,

a username shouldn't contain 500 characters.

```javascript
username: {
    bsonType: "string",
    maxLength: 20
}
```

Now MongoDB rejects usernames longer than 20 characters.

---

# `minimum`

Suppose I'm storing product prices.

A product can't cost a negative amount.

```javascript
price: {
    bsonType: "int",
    minimum: 0
}
```

Now:

```javascript
{
    price: -100
}
```

❌ Rejected

---

# `maximum`

Sometimes values also have an upper limit.

Imagine I'm storing exam marks.

```javascript
marks: {
    bsonType: "int",
    minimum: 0,
    maximum: 100
}
```

Now:

```javascript
{
    marks: 120
}
```

❌ Rejected

because marks cannot exceed 100.

---

# `enum`

This is one of my favorite validation keywords.

Sometimes I don't want users to enter anything they like.

Suppose an e-commerce website only supports these categories:

* Electronics
* Clothing
* Books

Instead of allowing random values,

I can define:

```javascript
category: {
    bsonType: "string",
    enum: [
        "Electronics",
        "Clothing",
        "Books"
    ]
}
```

Now:

```javascript
{
    category: "Furniture"
}
```

❌ Rejected

Only the listed values are accepted.

---

# `pattern`

Sometimes I want to validate the format of a string.

For example,

an email should contain:

```text
@
```

I can use a regular expression.

```javascript
email: {
    bsonType: "string",
    pattern: "@"
}
```

This is a very simple example.

Real applications usually use much more detailed regular expressions.

The important idea is:

`pattern` validates the format of a string.

---

# `description`

This one confused me at first.

```javascript
description
```

does **not** validate anything.

Instead,

it's simply documentation.

Example:

```javascript
price: {
    bsonType: "int",
    minimum: 0,
    description: "Price must be a positive integer."
}
```

If validation fails,

this description helps explain why.

Think of it as writing notes for future developers (or your future self).

---

# Putting Everything Together

```javascript
db.createCollection("products", {
    validator: {
        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price",
                "category"
            ],

            properties: {

                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 50
                },

                price: {
                    bsonType: "int",
                    minimum: 0
                },

                category: {
                    bsonType: "string",
                    enum: [
                        "Electronics",
                        "Books",
                        "Clothing"
                    ]
                }

            }

        }
    }
})
```

Now MongoDB checks much more than just the data type.

It checks whether the values themselves make sense.

---

# Real World Example — Amazon

Suppose someone tries to insert:

```javascript
{
    name: "",
    price: -2500,
    category: "Cars"
}
```

MongoDB rejects it because:

* `name` is too short.
* `price` is negative.
* `category` isn't one of the allowed values.

That's exactly the kind of bad data Schema Validation is designed to stop.

---

# My Mental Model

Whenever I see:

`minLength`

I think:

> "How short can this string be?"

Whenever I see:

`maxLength`

I think:

> "How long can this string be?"

Whenever I see:

`minimum`

I think:

> "What's the smallest allowed number?"

Whenever I see:

`maximum`

I think:

> "What's the largest allowed number?"

Whenever I see:

`enum`

I think:

> "Only these values are allowed."

Whenever I see:

`pattern`

I think:

> "Does this string follow the expected format?"

Whenever I see:

`description`

I think:

> "Helpful notes for humans, not validation."

---

# Quick Revision

| Keyword       | Purpose                      |
| ------------- | ---------------------------- |
| `minLength`   | Minimum number of characters |
| `maxLength`   | Maximum number of characters |
| `minimum`     | Smallest allowed number      |
| `maximum`     | Largest allowed number       |
| `enum`        | Restricts allowed values     |
| `pattern`     | Validates string format      |
| `description` | Explains the validation rule |

---

# Most Important Thing I Learned

Last lesson taught me how to validate **data types**.

This lesson taught me how to validate **data quality**.

That's a huge difference.

A value can have the correct type but still be meaningless.

These validation keywords help MongoDB reject data that doesn't make sense for my application.
