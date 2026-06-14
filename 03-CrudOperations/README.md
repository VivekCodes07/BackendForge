# MongoDB CRUD Operations - Complete Beginner's Guide

## Introduction

CRUD is the foundation of MongoDB and almost every database system.

CRUD stands for:

| Letter | Meaning |
| ------ | ------- |
| C      | Create  |
| R      | Read    |
| U      | Update  |
| D      | Delete  |

Before learning advanced MongoDB topics such as Query Operators, Aggregation Pipelines, Indexing, and Transactions, it is essential to understand CRUD operations deeply.

Think of CRUD as the four basic actions that can happen to data:

* Create → Add new data
* Read → View existing data
* Update → Modify existing data
* Delete → Remove existing data

Every application you use daily performs CRUD operations.

Examples:

* Instagram → Create a post
* WhatsApp → Read messages
* LinkedIn → Update profile
* Gmail → Delete emails

---

# Understanding CRUD Through a Real-World Example

Imagine you are managing a school.

You maintain a collection called `students`.

Initially:

```json
[]
```

No students exist.

As students join, leave, or update information, you perform CRUD operations.

---

# CREATE Operation

## What is CREATE?

CREATE means storing new information inside the database.

Whenever new data enters the system, we use CREATE.

### Real-Life Examples

* New student admission
* User registration
* New product added to an e-commerce website
* Creating a new Instagram account

---

## insertOne()

Used when inserting a single document.

```javascript
db.students.insertOne({
  name: "Rahul",
  age: 22,
  city: "Mohali"
})
```

### Understanding the Command

```javascript
db
```

Current database.

```javascript
students
```

Students collection.

```javascript
insertOne()
```

Insert one document.

MongoDB reads this as:

> Go to the students collection and store one student document.

---

### Result

MongoDB stores:

```json
{
  "_id": ObjectId("..."),
  "name": "Rahul",
  "age": 22,
  "city": "Mohali"
}
```

Notice that MongoDB automatically creates an `_id` field.

---

## Why Does MongoDB Create _id?

Imagine there are 500 students named Rahul.

How can MongoDB uniquely identify a particular Rahul?

MongoDB solves this problem using `_id`.

Think of `_id` as:

* Aadhaar Number
* Passport Number
* Roll Number

Every document gets a unique identity.

---

## insertMany()

Used when inserting multiple documents.

```javascript
db.students.insertMany([
  {
    name: "Rahul",
    age: 22
  },
  {
    name: "Priya",
    age: 20
  },
  {
    name: "Aman",
    age: 21
  }
])
```

MongoDB inserts all documents at once.

---

# READ Operation

## What is READ?

READ means retrieving data that already exists.

Whenever we want to view information, we perform a READ operation.

### Real-Life Examples

* Viewing a profile
* Opening a WhatsApp chat
* Searching products on Amazon
* Checking student records

---

## find()

Used to retrieve multiple documents.

```javascript
db.students.find()
```

MongoDB interprets this as:

> Show me all students.

Example output:

```json
[
  {
    "name": "Rahul",
    "age": 22
  },
  {
    "name": "Priya",
    "age": 20
  }
]
```

---

## Why Does find() Return Many Documents?

Imagine asking:

> Show all students.

There may be hundreds of students.

Therefore `find()` returns multiple matching documents.

---

## findOne()

Used to retrieve a single document.

```javascript
db.students.findOne({
  name: "Rahul"
})
```

MongoDB interprets this as:

> Find Rahul and stop after the first match.

Result:

```json
{
  "name": "Rahul",
  "age": 22
}
```

---

# Understanding Filters

A filter tells MongoDB what to search for.

Example:

```javascript
db.students.find({
  age: 22
})
```

Filter:

```javascript
{
  age: 22
}
```

MongoDB reads it as:

> Find documents where age equals 22.

Think of filters as search conditions.

Just as Google searches based on keywords, MongoDB searches based on filters.

---

## Multiple Conditions

```javascript
db.students.find({
  age: 22,
  city: "Mohali"
})
```

MongoDB reads this as:

> Find students whose age is 22 AND city is Mohali.

---

# UPDATE Operation

## What is UPDATE?

UPDATE means modifying information that already exists.

Instead of creating a new document, we change an existing one.

### Real-Life Examples

* Changing phone number
* Updating email address
* Editing Instagram bio
* Updating product price

---

## updateOne()

Used to update the first matching document.

Before:

```json
{
  "name": "Rahul",
  "age": 22
}
```

Command:

```javascript
db.students.updateOne(
  {
    name: "Rahul"
  },
  {
    $set: {
      age: 23
    }
  }
)
```

After:

```json
{
  "name": "Rahul",
  "age": 23
}
```

---

# Understanding $set

`$set` is one of the most important MongoDB operators.

It means:

> Change the value of a field.

Example:

```javascript
{
  $set: {
    city: "Chandigarh"
  }
}
```

MongoDB changes only the specified field.

Without `$set`, MongoDB would not know whether to modify the document or replace it entirely.

---

## Updating Multiple Fields

```javascript
db.students.updateOne(
  {
    name: "Rahul"
  },
  {
    $set: {
      age: 23,
      city: "Chandigarh"
    }
  }
)
```

MongoDB updates both fields together.

---

## updateMany()

Used when updating multiple documents.

Example:

```javascript
db.students.updateMany(
  {
    city: "Mohali"
  },
  {
    $set: {
      city: "Chandigarh"
    }
  }
)
```

MongoDB updates every student whose city is Mohali.

---

# DELETE Operation

## What is DELETE?

DELETE removes data from the database.

### Real-Life Examples

* Student leaves school
* User deletes account
* Product removed from catalog
* Email moved to trash

---

## deleteOne()

Used to remove the first matching document.

```javascript
db.students.deleteOne({
  name: "Rahul"
})
```

MongoDB reads:

> Find Rahul and remove the document.

---

## deleteMany()

Used to remove multiple matching documents.

```javascript
db.students.deleteMany({
  city: "Delhi"
})
```

MongoDB removes all students whose city is Delhi.

---

# Complete CRUD Flow

Imagine a student's journey.

### Student Joins School

```javascript
insertOne()
```

CREATE

---

### School Searches Student Record

```javascript
find()
```

READ

---

### Student Updates Address

```javascript
updateOne()
```

UPDATE

---

### Student Leaves School

```javascript
deleteOne()
```

DELETE

---

# CRUD Cheat Sheet

## CREATE

```javascript
db.students.insertOne({})
db.students.insertMany([])
```

---

## READ

```javascript
db.students.find()
db.students.findOne({})
```

---

## UPDATE

```javascript
db.students.updateOne({}, {})
db.students.updateMany({}, {})
```

---

## DELETE

```javascript
db.students.deleteOne({})
db.students.deleteMany({})
```

---

# Mental Model for Developers

Whenever you face a database problem, ask:

### Is new data being added?

Use CREATE.

### Is data being viewed?

Use READ.

### Is existing data changing?

Use UPDATE.

### Is data being removed?

Use DELETE.

If you can answer these four questions, you can identify the correct MongoDB CRUD operation.

---

# Final Revision

CRUD is the language of databases.

* Create adds data.
* Read retrieves data.
* Update modifies data.
* Delete removes data.

Every modern application, from Instagram to Netflix, relies on CRUD operations thousands of times every second.
