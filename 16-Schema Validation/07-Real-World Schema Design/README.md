# Real-World Schema Design

## Why Am I Learning This?

Over the last few lessons, I've learned almost everything MongoDB offers for Schema Validation.

I learned:

* `validator`
* `$jsonSchema`
* `bsonType`
* `required`
* `properties`
* Validation keywords (`minLength`, `minimum`, `enum`, etc.)
* Nested objects
* Arrays
* `items`
* `validationLevel`
* `validationAction`
* `collMod`

Those are the tools.

But knowing the tools isn't enough.

A backend engineer's real job is deciding **how to use them together** to protect the application's data.

That's what this lesson is about.

---

# Step 1 — Think About The Business

When designing a schema, I shouldn't start with MongoDB syntax.

I should start by asking:

> **"What rules does my business need?"**

MongoDB only enforces the rules I define.

It doesn't know what makes sense for my application.

For example, in an e-commerce app:

* Every product should have a name.
* Price should never be negative.
* Category should be from a fixed list.
* Stock should never be less than 0.

These are **business rules**, not MongoDB rules.

My schema simply translates them into validation.

---

# Example 1 — User Collection

Imagine I'm building a social media app.

Every user should have:

```javascript
{
    username: "vivek",

    email: "vivek@gmail.com",

    age: 20,

    address: {

        city: "Mohali",

        state: "Punjab"

    },

    interests: [

        "Programming",

        "Music"

    ]

}
```

Now I ask myself:

* Should `username` exist? → Yes.
* Should it be a string? → Yes.
* Should it have a minimum length? → Yes.
* Should `email` contain a valid format? → Yes.
* Should `address` always exist? → Yes.
* Should every interest be a string? → Yes.

Notice something.

I'm not thinking about MongoDB commands.

I'm thinking about **the data first**.

---

# Example 2 — Product Collection

Imagine I'm building Amazon.

Every product should have:

```javascript
{
    name: "Gaming Mouse",

    price: 2499,

    stock: 50,

    category: "Electronics",

    tags: [

        "Gaming",

        "Wireless"

    ]

}
```

Business rules:

* Product name is required.
* Price must be positive.
* Stock can't be negative.
* Category must be one of the supported categories.
* Tags should be strings.

MongoDB simply enforces those rules.

---

# Example 3 — Course Collection

Imagine I'm building Udemy.

```javascript
{
    title: "Node.js Bootcamp",

    instructor: "Akshay",

    price: 3999,

    technologies: [

        "Node.js",

        "MongoDB",

        "Express"

    ]

}
```

Again, I ask:

* Is the title required?
* Should price be positive?
* Should every technology be a string?

Schema Validation turns those answers into rules.

---

# My Design Process

Whenever I design a new collection, I follow the same thought process.

### Step 1

What information does this document need?

### Step 2

Which fields are required?

### Step 3

What data type should each field have?

### Step 4

Are there any limits?

Examples:

* Minimum length
* Maximum length
* Minimum value
* Maximum value

### Step 5

Should any field allow only specific values?

If yes,

I use `enum`.

### Step 6

Does the document contain nested objects?

If yes,

I validate them separately.

### Step 7

Does it contain arrays?

If yes,

I validate every element using `items`.

Only after answering all these questions do I start writing the schema.

---

# My Mental Checklist

Whenever I create a new schema, I mentally ask:

```text
What fields are required?

↓

What data type should each field have?

↓

Do any values need limits?

↓

Do I need enum?

↓

Do I need pattern?

↓

Any nested objects?

↓

Any arrays?

↓

Should every array item follow a rule?
```

If I can answer these questions,

writing the validator becomes straightforward.

---

# The Biggest Mistake Beginners Make

When I first learned Schema Validation,

I focused too much on memorizing syntax.

But syntax isn't the hard part.

The difficult part is deciding:

> **"What rules should my application enforce?"**

Good schemas come from understanding the business requirements.

The MongoDB syntax is just the implementation.

---

# How I'll Think From Now On

Whenever someone asks me to design a collection, I won't immediately start typing:

```javascript
validator: {
```

Instead, I'll first think:

* What data am I storing?
* What should always exist?
* What should never be allowed?
* What values make sense?
* What mistakes should MongoDB prevent?

Only then will I write the validation schema.

---

# Quick Revision

Schema Validation is all about protecting data quality.

My workflow is:

1. Understand the business.
2. Decide the rules.
3. Convert those rules into a JSON Schema.
4. Let MongoDB enforce them automatically.

---

# Most Important Thing I Learned

Schema Validation isn't about memorizing keywords.

It's about thinking like a backend engineer.

MongoDB gives me powerful tools, but it's my responsibility to decide what good data looks like.

If I design good validation rules, my database becomes more reliable, my backend becomes simpler, and my application becomes much easier to maintain.

That's the real purpose of Schema Validation.
