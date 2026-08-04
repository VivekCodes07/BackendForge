# MongoDB Schema Validation

## 🎯 Goal

Today I learned how to make sure that only valid documents are stored inside a MongoDB collection. Instead of trusting the user to send the correct data, I can define rules and MongoDB will validate every document before storing it.

---

# What is Schema Validation?

By default, MongoDB is **schema-less**, which means I can insert any kind of document.

Example:

```javascript
{ name: "Peter" }

{ age: 20 }

{ city: "New York" }

{ randomField: true }
```

Sometimes this flexibility is useful, but in real projects it can create inconsistent data.

To solve this, MongoDB provides **Schema Validation**, where I define rules that every document must follow.

---

# How Schema Validation Works

```
Application
      │
      ▼
Insert Document
      │
      ▼
Schema Validation
      │
      ├── Rules Passed ✅
      │       │
      │       ▼
      │   Store Document
      │
      └── Rules Failed ❌
              │
              ▼
      Document Rejected
```

---

# Important Keywords

## validator

Used to validate every document before MongoDB stores it.

```javascript
validator: { ... }
```

---

## $jsonSchema

Lets me define validation rules using JSON Schema.

```javascript
validator: {
    $jsonSchema: { ... }
}
```

---

## bsonType

Checks the actual BSON data type.

Examples:

```javascript
bsonType: "string"
bsonType: "int"
bsonType: "object"
bsonType: "array"
bsonType: "objectId"
```

Remember:

> BSON = Binary JSON = MongoDB's internal storage format.

---

## required

Makes fields mandatory.

```javascript
required: ["name", "age"]
```

Without these fields, MongoDB rejects the document.

---

## additionalProperties

Controls whether extra fields are allowed.

```javascript
additionalProperties: false
```

This means:

> Only the fields defined inside `properties` are allowed.

**Important:** Since MongoDB automatically creates an `_id` field, I also need to define `_id` inside `properties` when using `additionalProperties: false`.

---

## properties

Defines validation rules for each field.

```javascript
properties: {
    name: { ... },
    age: { ... }
}
```

Think of it as:

> Rules for every property inside an object.

---

## items

Used only with arrays.

It defines the validation rules for **every element inside an array**.

```javascript
orders: {
    bsonType: "array",

    items: {
        bsonType: "object"
    }
}
```

Think of it as:

> Rules for every item inside the array.

---

## minimum & maximum

Restricts numeric values.

```javascript
minimum: 18
maximum: 100
```

---

## enum

Allows only specific values.

```javascript
status: {
    enum: [
        "Pending",
        "Shipped",
        "Delivered",
        "Cancelled"
    ]
}
```

If the value isn't in this list, MongoDB rejects the document.

---

## validationAction

Tells MongoDB what to do if validation fails.

```javascript
validationAction: "error"
```

`error` means the document will not be inserted.

---

# Nested Object Validation

Objects can have their own validation rules.

```javascript
address: {
    bsonType: "object",

    properties: {
        city: { bsonType: "string" },
        state: { bsonType: "string" }
    }
}
```

This lets me validate nested objects separately.

---

# Array Validation

Arrays can contain objects.

Using `items`, MongoDB validates **every object inside the array**.

```
orders
│
├── Order 1 ✔
├── Order 2 ✔
├── Order 3 ✔
└── ...
```

Every order must follow the same schema.

---

# Validation Flow

```
Document
    │
    ▼
Is it an Object?
    │
    ▼
Required Fields Present?
    │
    ▼
Any Extra Fields?
    │
    ▼
Field Types Correct?
    │
    ▼
Nested Objects Valid?
    │
    ▼
Array Items Valid?
    │
    ▼
Document Stored ✅
```

If any step fails:

```
Document Failed Validation ❌
```

---

# Things I Learned

* MongoDB is schema-less by default.
* Schema Validation keeps my data consistent.
* `validator` enables validation.
* `$jsonSchema` is used to define validation rules.
* `bsonType` checks the actual BSON data type.
* `required` makes fields mandatory.
* `properties` defines rules for object fields.
* `items` defines rules for array elements.
* `additionalProperties: false` prevents unexpected fields.
* `_id` must be included in `properties` when using `additionalProperties: false`.
* `minimum` and `maximum` validate numeric ranges.
* `enum` restricts values to a fixed list.
* `validationAction: "error"` rejects invalid documents.

---

# Quick Revision

| Keyword                | Meaning                      |
| ---------------------- | ---------------------------- |
| `validator`            | Enables document validation  |
| `$jsonSchema`          | Defines validation rules     |
| `bsonType`             | Checks BSON data type        |
| `required`             | Mandatory fields             |
| `properties`           | Rules for object fields      |
| `items`                | Rules for array elements     |
| `additionalProperties` | Allows/blocks extra fields   |
| `minimum`              | Smallest allowed value       |
| `maximum`              | Largest allowed value        |
| `enum`                 | Fixed list of allowed values |
| `validationAction`     | Action when validation fails |

---

# One-Line Summary

> **Schema Validation lets me define rules for my documents so MongoDB only stores clean, consistent, and valid data.**
