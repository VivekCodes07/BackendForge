# Unique Indexes

## Why Am I Learning This?

So far, I've learned:

- Why indexes exist
- How to create indexes
- Single Field Indexes
- Compound Indexes

All of those indexes were focused on one thing:

> Making queries faster.

But MongoDB indexes can do something else too.

They can enforce rules.

One of the most common rules in applications is:

```text
No duplicate values allowed.
```

For example:

- Two users should not have the same email.
- Two customers should not have the same Aadhaar number.
- Two accounts should not have the same username.
- Two products should not have the same SKU.

This is where Unique Indexes come in.

---

# The Problem

Imagine I am building a social media application.

Users collection:

```javascript
{
    username: "vivek",
    email: "vivek@gmail.com"
}

{
    username: "alex",
    email: "alex@gmail.com"
}
```

Everything looks fine.

Now suppose someone accidentally inserts:

```javascript
{
    username: "john",
    email: "vivek@gmail.com"
}
```

Notice the problem?

```text
vivek@gmail.com
```

already exists.

Now two users have the same email.

That can create serious problems:

- Login issues
- Password reset issues
- Identity confusion
- Data inconsistency

MongoDB needs a way to prevent this.

---

# What Is A Unique Index?

A Unique Index is a special type of index that ensures:

```text
No duplicate values can exist.
```

MongoDB checks every insert and update.

If a duplicate value is found:

```text
MongoDB rejects the operation.
```

---

# Creating A Unique Index

Syntax:

```javascript
db.collection.createIndex(
    {
        fieldName: 1
    },
    {
        unique: true
    }
)
```

Example:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true
    }
)
```

This tells MongoDB:

> Every email must be unique.

---

# What Happens Internally?

Suppose I have:

```javascript
{
    email: "vivek@gmail.com"
}

{
    email: "alex@gmail.com"
}
```

MongoDB creates an index like:

```text
alex@gmail.com      → Document

vivek@gmail.com     → Document
```

Now when someone tries to insert:

```javascript
{
    email: "vivek@gmail.com"
}
```

MongoDB checks the index first.

It finds:

```text
vivek@gmail.com
```

already exists.

Result:

```text
Insert Rejected ❌
```

---

# Real World Example

## User Emails

```javascript
{
    email: "vivek@gmail.com"
}
```

Should every user have a unique email?

```text
YES
```

Perfect use case for a Unique Index.

---

## Usernames

```javascript
{
    username: "vivek"
}
```

Should two users have the same username?

Usually:

```text
NO
```

Unique Index makes sense.

---

## Phone Numbers

```javascript
{
    phone: "9876543210"
}
```

Usually one account per phone number.

Again:

```text
Unique Index
```

---

# Example

Create unique index:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true
    }
)
```

Insert:

```javascript
db.users.insertOne({
    email: "vivek@gmail.com"
})
```

Success ✅

Insert same email again:

```javascript
db.users.insertOne({
    email: "vivek@gmail.com"
})
```

MongoDB:

```text
Duplicate Key Error ❌
```

---

# Understanding Duplicate Key Error

You will often see:

```text
E11000 duplicate key error
```

Example:

```text
E11000 duplicate key error collection: users
```

This simply means:

```text
A unique index prevented duplicate data.
```

This is actually a good thing.

MongoDB is protecting the integrity of the data.

---

# Unique Index vs Normal Index

## Normal Index

```javascript
db.users.createIndex({
    email: 1
})
```

Purpose:

```text
Improve query speed
```

Duplicates?

```text
Allowed
```

---

## Unique Index

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true
    }
)
```

Purpose:

```text
Improve query speed
+
Prevent duplicates
```

Duplicates?

```text
Not Allowed
```

---

# Compound Unique Indexes

Unique indexes can also work with multiple fields.

Example:

```javascript
db.students.createIndex(
    {
        studentId: 1,
        courseId: 1
    },
    {
        unique: true
    }
)
```

---

Imagine:

```javascript
{
    studentId: 101,
    courseId: "MONGO101"
}
```

and

```javascript
{
    studentId: 101,
    courseId: "NODE101"
}
```

Allowed ✅

Because the combination is different.

---

But:

```javascript
{
    studentId: 101,
    courseId: "MONGO101"
}
```

again?

Rejected ❌

Because the combination already exists.

---

# Real World Example: Udemy

Enrollment Collection:

```javascript
{
    userId: ObjectId("..."),
    courseId: ObjectId("...")
}
```

A student should not enroll in the same course twice.

Solution:

```javascript
db.enrollments.createIndex(
    {
        userId: 1,
        courseId: 1
    },
    {
        unique: true
    }
)
```

Now duplicate enrollments become impossible.

---

# Checking Existing Indexes

To view indexes:

```javascript
db.users.getIndexes()
```

Output:

```javascript
[
  {
    key: {
      email: 1
    },
    unique: true
  }
]
```

Notice:

```javascript
unique: true
```

This confirms it's a Unique Index.

---

# Common Beginner Mistakes

## Mistake 1

Thinking Unique Indexes are only for performance.

Wrong.

Their main purpose is:

```text
Data Integrity
```

---

## Mistake 2

Creating a unique index on a field that already contains duplicates.

MongoDB will reject index creation.

Example:

```javascript
vivek@gmail.com
vivek@gmail.com
```

already exists.

Then:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true
    }
)
```

will fail.

---

## Mistake 3

Trying to enforce uniqueness in application code only.

MongoDB should enforce important uniqueness rules.

The database is the final source of truth.

---

# Mental Model

Whenever I create:

```javascript
db.users.createIndex(
    {
        email: 1
    },
    {
        unique: true
    }
)
```

I read it as:

```text
MongoDB,

create a shortcut for email

and

never allow duplicate email addresses.
```

---

# Quick Practice

Create a unique index on username:

```javascript
db.users.createIndex(
    {
        username: 1
    },
    {
        unique: true
    }
)
```

---

Create a unique index on phone:

```javascript
db.users.createIndex(
    {
        phone: 1
    },
    {
        unique: true
    }
)
```

---

Create a compound unique index:

```javascript
db.enrollments.createIndex(
    {
        userId: 1,
        courseId: 1
    },
    {
        unique: true
    }
)
```

---

# Summary

In this lesson I learned:

✅ What a Unique Index is

✅ Why applications need uniqueness

✅ How MongoDB prevents duplicates

✅ How to create Unique Indexes

✅ What Duplicate Key Errors mean

✅ Difference between Normal and Unique Indexes

✅ Compound Unique Indexes

✅ Real-world use cases

Most importantly, I learned that Unique Indexes are not just about speed.

They help MongoDB protect the quality and consistency of my data.