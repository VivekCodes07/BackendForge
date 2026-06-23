# Creating Indexes

## Why Am I Learning This?

In the previous lesson, I learned that indexes help MongoDB avoid scanning every document in a collection.

Without an index, MongoDB performs a:

```text
COLLSCAN (Collection Scan)
```

which means checking documents one by one until it finds a match.

Now the obvious question becomes:

> If indexes are so useful, how do I actually create one?

This lesson is all about creating indexes and understanding what happens behind the scenes when I tell MongoDB to maintain a shortcut for a field.

---

# The Problem

Suppose I am building Instagram.

My users collection looks like this:

```javascript
{
    username: "john",
    followers: 100
}

{
    username: "emma",
    followers: 500
}

{
    username: "cristiano",
    followers: 600000000
}
```

A common query might be:

```javascript
db.users.find({
    username: "cristiano"
})
```

MongoDB can find the document.

But if no index exists, MongoDB has to inspect documents one by one.

That might be okay for:

```text
10 users
```

but not for:

```text
500 million users
```

---

# Creating My First Index

MongoDB provides a method called:

```javascript
createIndex()
```

Syntax:

```javascript
db.collection.createIndex({
    fieldName: 1
})
```

Example:

```javascript
db.users.createIndex({
    username: 1
})
```

This tells MongoDB:

```text
Please maintain an index on the username field.
```

---

# What Does The 1 Mean?

When I first saw:

```javascript
{
    username: 1
}
```

I was confused.

The:

```javascript
1
```

means:

```text
Ascending Order
```

MongoDB stores the index in ascending order.

Example:

```text
alex
emma
john
vivek
```

---

# What About -1?

I can also write:

```javascript
db.users.createIndex({
    username: -1
})
```

The:

```javascript
-1
```

means:

```text
Descending Order
```

Conceptually:

```text
vivek
john
emma
alex
```

---

# Important Note

For basic searching:

```javascript
db.users.find({
    username: "vivek"
})
```

both:

```javascript
{ username: 1 }
```

and

```javascript
{ username: -1 }
```

work perfectly fine.

The direction becomes more important when sorting data, which I'll learn in a later lesson.

---

# What Happens Internally?

Suppose I create:

```javascript
db.users.createIndex({
    username: 1
})
```

MongoDB builds something conceptually like:

```text
alex       → Document Pointer

cristiano  → Document Pointer

emma       → Document Pointer

john       → Document Pointer
```

Notice:

```text
The index does NOT store full documents.
```

Instead it stores:

```text
Indexed Value
      +
Pointer To Document
```

This allows MongoDB to quickly locate documents without scanning the entire collection.

---

# Real World Example

Imagine a college library.

Without an index:

```text
Walk through every shelf
until you find the book.
```

With an index:

```text
Open catalog
Find shelf number
Go directly to the book
```

The catalog is essentially the index.

---

# Creating An Index On Another Field

Suppose people frequently search by followers count.

I could create:

```javascript
db.users.createIndex({
    followers: 1
})
```

Now MongoDB also maintains a shortcut for:

```javascript
followers
```

---

# Multiple Indexes

MongoDB allows multiple indexes.

Example:

```javascript
db.users.createIndex({
    username: 1
})

db.users.createIndex({
    email: 1
})

db.users.createIndex({
    followers: 1
})
```

Now MongoDB maintains three separate indexes.

---

# Does MongoDB Automatically Update Indexes?

Yes.

Suppose I have:

```javascript
{
    username: "john"
}
```

and later update it:

```javascript
db.users.updateOne(
    { username: "john" },
    {
        $set: {
            username: "john_smith"
        }
    }
)
```

MongoDB automatically updates the index.

I don't have to do anything manually.

---

# Why Not Create Indexes Everywhere?

At first I thought:

```text
More indexes = More speed
```

Not exactly.

Every index:

* Consumes storage
* Uses memory
* Needs maintenance

Whenever a document changes, MongoDB must update:

```text
The document
+
All affected indexes
```

So unnecessary indexes can hurt write performance.

---

# When Should I Create An Index?

A good rule of thumb:

Create indexes on fields that are frequently used for:

```javascript
find()
```

```javascript
sort()
```

```javascript
lookup()
```

or filtering operations.

Example:

```javascript
username
email
userId
orderId
productId
```

are often good index candidates.

---

# Common Beginner Mistakes

## Mistake 1

Thinking indexes store entire documents.

Wrong.

Indexes store values and pointers.

---

## Mistake 2

Creating indexes before understanding query patterns.

Always ask:

```text
What fields are searched most often?
```

---

## Mistake 3

Creating indexes on every field.

More indexes can slow down inserts and updates.

---

# Mental Model

Whenever I write:

```javascript
db.users.createIndex({
    username: 1
})
```

I read it as:

```text
MongoDB,

please maintain a shortcut
for the username field
so future searches become faster.
```

---

# Quick Practice

### Create an index on email

```javascript
db.users.createIndex({
    email: 1
})
```

---

### Create an index on followers

```javascript
db.users.createIndex({
    followers: 1
})
```

---

### Create a descending index

```javascript
db.users.createIndex({
    username: -1
})
```

---

# Summary

In this lesson I learned:

✅ How to create an index

✅ What `createIndex()` does

✅ What `1` means

✅ What `-1` means

✅ How MongoDB stores index entries

✅ That indexes store pointers, not full documents

✅ MongoDB automatically updates indexes

✅ Why creating too many indexes can be harmful

Most importantly, I learned that creating an index is basically telling MongoDB:

> "Please maintain a shortcut for this field because I will search it frequently."
