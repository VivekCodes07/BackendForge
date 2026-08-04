# Creating My First Schema Validation

## Why Am I Learning This?

In the previous lesson, I learned **why Schema Validation exists.**

MongoDB is schema-less by default, which means it doesn't force every document to follow the same structure.

That's flexible.

But flexibility also means invalid data can accidentally enter my database.

Today, I'm finally going to teach MongoDB **what a valid document looks like.**

---

# Before Learning The Syntax

Imagine I'm building an E-Commerce application.

Every product should have:

* Name
* Price
* Category

A valid product should look like this:

```javascript
{
    name: "Gaming Mouse",
    price: 2499,
    category: "Electronics"
}
```

If someone accidentally inserts:

```javascript
{
    name: "Gaming Mouse",
    price: "2499"
}
```

I want MongoDB to reject it.

So the question becomes:

> **How do I tell MongoDB these rules?**

The answer is:

```
validator
```

---

# The `validator`

Whenever I create a collection,

I can also attach validation rules.

Think of it like hiring a security guard while constructing a building.

Without a validator:

```
Collection

↓

Anyone can enter.
```

With a validator:

```
Collection

↓

Validator

↓

Only valid documents enter.
```

The validator stays attached to the collection forever unless I change or remove it.

---

# Creating A Collection With Validation

```javascript
db.createCollection("products", {
    validator: {
        $jsonSchema: {
            bsonType: "object"
        }
    }
})
```

At first glance,

this looks like a lot.

But it's actually made up of very small pieces.

Let's understand each one.

---

# `validator`

```javascript
validator: { ... }
```

This tells MongoDB:

> "Every document entering this collection must first pass these validation rules."

Think of it as the **gatekeeper**.

---

# `$jsonSchema`

```javascript
$jsonSchema: { ... }
```

MongoDB uses something called **JSON Schema**.

JSON Schema is simply a **rule book**.

Inside it,

I describe what a valid document should look like.

For example,

* Required fields
* Data types
* String lengths
* Number ranges
* Allowed values

Everything goes inside `$jsonSchema`.

---

# `bsonType`

One thing confused me.

Why is it called:

```javascript
bsonType
```

instead of

```javascript
type
```

The reason is simple.

MongoDB doesn't store JSON internally.

It stores **BSON** (Binary JSON).

That means MongoDB validates **BSON data types**, not plain JSON types.

Examples:

```javascript
bsonType: "string"
```

```javascript
bsonType: "int"
```

```javascript
bsonType: "double"
```

```javascript
bsonType: "bool"
```

```javascript
bsonType: "array"
```

```javascript
bsonType: "object"
```

So whenever I see `bsonType`,

I remind myself:

> "MongoDB is checking the BSON type of this value."

---

# Why `object`?

Every MongoDB document looks like this:

```javascript
{
    name: "Vivek",
    age: 20
}
```

That entire document is an **object**.

So the very first rule is usually:

```javascript
bsonType: "object"
```

It tells MongoDB:

> "Every document inside this collection must be an object."

---

# Making Fields Required

Suppose every product must always have:

* name
* price
* category

I can tell MongoDB that using:

```javascript
required: [
    "name",
    "price",
    "category"
]
```

Now,

if even one of those fields is missing,

MongoDB rejects the document.

---

# Defining Field Types

Now I want stricter rules.

The `name` should always be a string.

The `price` should always be a number.

The `category` should always be a string.

That's done using:

```javascript
properties
```

Example:

```javascript
properties: {

    name: {
        bsonType: "string"
    },

    price: {
        bsonType: "int"
    },

    category: {
        bsonType: "string"
    }

}
```

Notice something.

I'm not validating the whole document anymore.

I'm validating **individual fields**.

---

# My First Complete Schema

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
                    bsonType: "string"
                },

                price: {
                    bsonType: "int"
                },

                category: {
                    bsonType: "string"
                }

            }

        }
    }
})
```

Read it like English.

```
Every document

↓

Must be an object

↓

Must contain

• name
• price
• category

↓

name must be a string

↓

price must be an integer

↓

category must be a string
```

That's exactly how I mentally read every JSON Schema.

---

# What Happens Now?

Valid document:

```javascript
db.products.insertOne({
    name: "Gaming Mouse",
    price: 2499,
    category: "Electronics"
})
```

MongoDB says:

```
✅ Accepted
```

---

Invalid document:

```javascript
db.products.insertOne({
    name: "Gaming Mouse",
    price: "2499"
})
```

MongoDB says:

```
❌ Rejected
```

Because:

* `category` is missing.
* `price` is a string instead of an integer.

Exactly what I wanted.

---

# Memory Perspective

Whenever I insert a document,

MongoDB roughly thinks like this:

```
Insert Request

↓

Collection

↓

Validator Exists?

↓

Yes

↓

Check JSON Schema

↓

All Rules Passed?

↓

Yes

↓

Write To Disk

OR

↓

No

↓

Reject Document
```

Notice something important.

The validation happens **before** the document is stored.

That means invalid data never enters the database.

---

# My Mental Model

Whenever I see:

```javascript
validator
```

I think:

> "The security guard."

Whenever I see:

```javascript
$jsonSchema
```

I think:

> "The rule book."

Whenever I see:

```javascript
required
```

I think:

> "Fields that must always exist."

Whenever I see:

```javascript
properties
```

I think:

> "Rules for each individual field."

Whenever I see:

```javascript
bsonType
```

I think:

> "What type of data should this field store?"

Once these five ideas clicked,

writing Schema Validation became much easier.

---

# Quick Revision

`validator`

* Enables validation for a collection.

`$jsonSchema`

* Defines the validation rules.

`bsonType`

* Checks the BSON data type.

`required`

* Lists fields that must exist.

`properties`

* Defines rules for individual fields.

Together,

they describe what a valid document looks like.

---

# Most Important Thing I Learned

Today I learned that Schema Validation isn't just one command.

It's a combination of small building blocks.

Each one has a single responsibility.

When combined together,

they allow MongoDB to reject invalid documents before they are ever stored.

That's exactly how real applications maintain clean and reliable data.
