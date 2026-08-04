# Validation Levels & Validation Actions

## Why Am I Learning This?

So far, I've learned how to create validation rules.

Whenever I insert a document, MongoDB checks those rules before storing it.

But then a question came to my mind.

> "What if a document doesn't follow the rules?"

Should MongoDB always reject it?

Or should it simply warn me?

And what about old documents that already exist before I enabled validation?

That's exactly what `validationAction` and `validationLevel` control.

They don't define **what** the rules are.

They define **how MongoDB should enforce them.**

---

# Understanding The Difference

I like to think of it this way:

Validation Rules answer:

> **"What makes a document valid?"**

While these settings answer:

> **"How strictly should MongoDB apply those rules?"**

---

# `validationAction`

This decides what MongoDB should do when validation fails.

There are two options.

## `error`

```javascript
validationAction: "error"
```

This is the default.

If a document breaks any validation rule:

* ❌ MongoDB rejects the operation.
* ❌ The document is not stored.

Think of it as a strict security guard.

If you don't meet the requirements,

you don't get in.

---

## `warn`

```javascript
validationAction: "warn"
```

Now MongoDB behaves differently.

If validation fails:

* ⚠ MongoDB records a warning.
* ✅ The document is still stored.

Think of it as a teacher saying:

> "This isn't correct, but I'll let it pass this time."

This is useful when introducing validation into an existing application without immediately blocking users.

---

# `validationLevel`

This decides **when** MongoDB should apply validation.

There are two levels you'll use most often.

## `strict`

```javascript
validationLevel: "strict"
```

This is the default.

MongoDB validates every insert and every update according to the schema.

It's the safest option for production.

---

## `moderate`

```javascript
validationLevel: "moderate"
```

Imagine you already have thousands of old documents that don't follow the new schema.

You don't want to break your application overnight.

`moderate` helps with that.

It mainly focuses on documents that already satisfy the validation rules, allowing legacy invalid documents to continue existing until they're cleaned up gradually.

This makes it useful when migrating older databases to a stricter schema.

---

# Putting Everything Together

```javascript
db.createCollection("products", {
    validator: {
        $jsonSchema: {
            bsonType: "object"
        }
    },

    validationLevel: "strict",

    validationAction: "error"
})
```

Read it like English:

* Validate every document.
* Apply the rules strictly.
* Reject anything that doesn't pass.

---

# Real World Example

Imagine Amazon introduces Schema Validation today.

Their database already contains millions of old product documents.

If they immediately use:

```javascript
validationLevel: "strict",
validationAction: "error"
```

Some updates could start failing because older documents don't match the new schema.

Instead, they might temporarily use:

```javascript
validationLevel: "moderate",
validationAction: "warn"
```

This lets developers identify bad data without immediately breaking the application.

Later, once the data has been cleaned, they can switch back to:

```javascript
validationLevel: "strict",
validationAction: "error"
```

---

# My Mental Model

Whenever I see:

```javascript
validationLevel
```

I think:

> **"When should MongoDB validate?"**

Whenever I see:

```javascript
validationAction
```

I think:

> **"What should MongoDB do if validation fails?"**

---

# Quick Revision

`validationLevel`

* `strict` → Validate all documents normally.
* `moderate` → Helps when working with older collections that already contain invalid documents.

`validationAction`

* `error` → Reject invalid operations.
* `warn` → Allow the operation but log a warning.

Together they control **how Schema Validation behaves**, not **what the validation rules are**.

---

# Most Important Thing I Learned

Creating validation rules is only half the job.

MongoDB also lets me decide how aggressively those rules should be enforced.

That's especially useful when introducing Schema Validation into an existing production database where invalid legacy data may already exist.
