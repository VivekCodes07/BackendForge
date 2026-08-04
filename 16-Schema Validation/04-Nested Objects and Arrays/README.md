# Validating Nested Objects & Arrays

## Why Am I Learning This?

So far, every Schema Validation example I've written has looked something like this:

```javascript
{
    name: "Vivek",
    age: 20,
    email: "vivek@gmail.com"
}
```

Everything is stored at the top level.

That's fine for learning.

But real applications rarely store data like this.

Imagine I'm building Amazon.

A product doesn't just have a name and price.

It also has:

* Manufacturer details
* Shipping address
* Specifications
* Reviews
* Tags

These are usually stored as **nested objects** or **arrays**.

If I only validate the top-level fields, invalid data can still hide inside these nested structures.

That's why MongoDB lets me validate them too.

---

# Understanding Nested Objects

Imagine I'm storing user information.

```javascript
{
    name: "Vivek",

    address: {
        city: "Mohali",
        state: "Punjab",
        pincode: 140307
    }
}
```

Notice something.

The `address` field isn't a string or a number.

It's another **object**.

So MongoDB must validate two things:

1. `address` itself should be an object.
2. The fields inside `address` should also follow rules.

---

# Validating A Nested Object

```javascript
address: {

    bsonType: "object",

    required: [
        "city",
        "state",
        "pincode"
    ],

    properties: {

        city: {
            bsonType: "string"
        },

        state: {
            bsonType: "string"
        },

        pincode: {
            bsonType: "int"
        }

    }

}
```

Notice what happened.

Inside `address`,

I'm writing another mini schema.

The structure is exactly the same:

* `bsonType`
* `required`
* `properties`

It's just nested one level deeper.

---

# Understanding Arrays

Now imagine I'm building Udemy.

Each course teaches multiple technologies.

```javascript
{
    title: "Node.js Bootcamp",

    technologies: [
        "JavaScript",
        "Node.js",
        "Express",
        "MongoDB"
    ]
}
```

The `technologies` field isn't a string.

It's an **array**.

MongoDB can validate arrays too.

---

# Validating An Array

```javascript
technologies: {

    bsonType: "array"

}
```

This only checks that the field is an array.

But what about the values inside it?

---

# The `items` Keyword

Imagine someone inserts:

```javascript
technologies: [
    "JavaScript",
    123,
    true
]
```

That's not what I want.

Every technology should be a string.

That's where `items` comes in.

```javascript
technologies: {

    bsonType: "array",

    items: {
        bsonType: "string"
    }

}
```

Now MongoDB checks every element inside the array.

---

# Real World Example — Amazon

Imagine every product stores tags.

```javascript
tags: [
    "Gaming",
    "Laptop",
    "Electronics"
]
```

Validation:

```javascript
tags: {

    bsonType: "array",

    items: {
        bsonType: "string"
    }

}
```

Now this is rejected:

```javascript
tags: [
    "Gaming",
    123,
    true
]
```

Because every tag should be a string.

---

# Putting Everything Together

```javascript
db.createCollection("users", {
    validator: {
        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "address",
                "skills"
            ],

            properties: {

                name: {
                    bsonType: "string"
                },

                address: {

                    bsonType: "object",

                    required: [
                        "city",
                        "state"
                    ],

                    properties: {

                        city: {
                            bsonType: "string"
                        },

                        state: {
                            bsonType: "string"
                        }

                    }

                },

                skills: {

                    bsonType: "array",

                    items: {
                        bsonType: "string"
                    }

                }

            }

        }
    }
})
```

Read it like English:

* Every user must have a name.
* Every user must have an address object.
* The address object must contain `city` and `state`.
* Every user must have a `skills` array.
* Every value inside `skills` must be a string.

---

# Memory Perspective

When MongoDB validates a document like this:

```javascript
{
    name: "Vivek",

    address: {
        city: "Mohali",
        state: "Punjab"
    },

    skills: [
        "Java",
        "MongoDB"
    ]
}
```

It doesn't stop after checking the first level.

It goes deeper.

Think of it like walking through folders.

```text
Document
│
├── name ✔
│
├── address
│     ├── city ✔
│     └── state ✔
│
└── skills
      ├── Java ✔
      └── MongoDB ✔
```

MongoDB recursively validates nested objects and arrays before storing the document.

---

# My Mental Model

Whenever I see:

```javascript
bsonType: "object"
```

I think:

> "This field contains another document."

Whenever I see:

```javascript
bsonType: "array"
```

I think:

> "This field contains multiple values."

Whenever I see:

```javascript
items
```

I think:

> "Rules for every element inside the array."

---

# Quick Revision

Nested Object

* Validated using another schema.
* Can have its own `required` and `properties`.

Array

* Validated using `bsonType: "array"`.

`items`

* Defines rules for every element inside an array.

MongoDB validates nested data recursively before storing it.

---

# Most Important Thing I Learned

Real-world MongoDB documents are rarely flat.

They usually contain nested objects and arrays.

Schema Validation doesn't stop at the first level.

MongoDB can validate every nested object and every array element, ensuring that even complex documents follow the rules I define.

That's what makes Schema Validation practical for real production applications.
