# Updating Validation Rules with `collMod`

## Why Am I Learning This?

So far, every time I wanted Schema Validation, I created a brand-new collection.

Example:

```javascript
db.createCollection("products", {
    validator: {
        $jsonSchema: {
            ...
        }
    }
})
```

That works perfectly while learning.

But real applications don't work like that.

Imagine I'm working at Amazon.

The `products` collection already exists.

It contains millions of product documents.

One day my team decides:

> "We should validate every product before storing it."

Can I simply do this?

```javascript
db.createCollection("products", {
    ...
})
```

No.

The collection already exists.

MongoDB won't let me create it again.

So the question becomes:

> **How do I change the validation rules of an existing collection?**

The answer is:

```javascript
collMod
```

---

# What Is `collMod`?

`collMod` stands for:

```text
Collection Modify
```

Exactly as the name suggests,

it modifies an existing collection.

Think of it like renovating a house.

Creating a collection is like building a new house.

`collMod` is like renovating that house without demolishing it.

The collection stays.

The data stays.

Only its configuration changes.

---

# Basic Syntax

```javascript
db.runCommand({

    collMod: "products",

    validator: {

        $jsonSchema: {
            ...
        }

    }

})
```

Read it like English.

> Modify the **products** collection and update its validation rules.

---

# Updating Validation Rules

Suppose I originally created this collection:

```javascript
db.createCollection("products")
```

No validation.

Anything can be inserted.

Later I decide:

Every product should have:

* name
* price

I don't recreate the collection.

Instead, I update it.

```javascript
db.runCommand({

    collMod: "products",

    validator: {

        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price"
            ],

            properties: {

                name: {
                    bsonType: "string"
                },

                price: {
                    bsonType: "int",
                    minimum: 0
                }

            }

        }

    }

})
```

From this point onward,

MongoDB starts validating new operations using the updated schema.

---

# Updating Validation Action

Earlier I learned:

```javascript
validationAction
```

Suppose I originally used:

```javascript
validationAction: "error"
```

Later my team decides:

> "Don't reject documents yet. Just warn us."

I can update only that setting.

```javascript
db.runCommand({

    collMod: "products",

    validationAction: "warn"

})
```

No need to recreate the collection.

---

# Updating Validation Level

Similarly,

I can update:

```javascript
validationLevel
```

Example:

```javascript
db.runCommand({

    collMod: "products",

    validationLevel: "moderate"

})
```

Again,

only the collection settings change.

The documents remain untouched.

---

# Updating Everything Together

Most real applications update everything in one command.

```javascript
db.runCommand({

    collMod: "products",

    validator: {

        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price"
            ],

            properties: {

                name: {
                    bsonType: "string"
                },

                price: {
                    bsonType: "int",
                    minimum: 0
                }

            }

        }

    },

    validationLevel: "strict",

    validationAction: "error"

})
```

This completely updates how MongoDB validates the existing collection.

---

# Real World Example

Imagine Instagram launches a new feature.

Every user profile should now have:

```javascript
bio
```

Their `users` collection already contains millions of documents.

Instead of deleting the collection,

Instagram simply updates the validator using:

```javascript
collMod
```

New profiles now follow the updated schema,

while the collection and its data remain intact.

---

# Memory Perspective

Imagine the collection already exists.

```text
Users Collection

↓

Millions of Documents
```

Now I run:

```javascript
db.runCommand({

    collMod: "users",

    ...
})
```

MongoDB thinks:

```text
Existing Collection

↓

Update Configuration

↓

Replace Validation Rules

↓

Keep Existing Data

↓

Use New Rules For Future Operations
```

Notice something important.

`collMod` changes the **collection's configuration**.

It does **not** recreate the collection.

It does **not** delete existing documents.

---

# My Mental Model

Whenever I see:

```javascript
db.createCollection(...)
```

I think:

> "I'm creating a brand-new collection."

Whenever I see:

```javascript
collMod
```

I think:

> "I'm modifying an existing collection."

That's the biggest difference.

---

# Quick Revision

`createCollection`

* Creates a new collection.
* Validation rules are added during creation.

`collMod`

* Modifies an existing collection.
* Can update:

  * `validator`
  * `validationLevel`
  * `validationAction`

Existing documents remain in the collection.

Only the validation configuration changes.

---

# Most Important Thing I Learned

Creating validation rules is useful when building a new collection.

But in real-world applications, collections already exist.

Instead of deleting and recreating them,

MongoDB lets me update their validation rules using `collMod`.

That's why `collMod` is the standard way to evolve a database schema without losing existing data.
