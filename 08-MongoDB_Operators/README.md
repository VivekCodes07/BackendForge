# MongoDB Operators - From Beginner to Real Developer

> These are my notes while learning MongoDB operators. Instead of memorizing syntax, I want to understand the problem first and then learn why a particular operator exists to solve it.

---

# Introduction

When I first started learning MongoDB, I tried memorizing operators.

```javascript
$gt
$lt
$in
$or
$and
```

A week later I forgot most of them.

The reason was simple:

I was memorizing syntax instead of understanding problems.

Real developers don't think:

> Should I use `$gt`?

They think:

> Show users with more than 1000 followers.

MongoDB operators are simply tools for expressing business requirements.

This README is my attempt to learn operators the way backend developers actually use them.

---

# Chapter 1: MongoDB Is Like Asking Questions

Imagine an Instagram database.

```javascript
{
  username: "john",
  followers: 5000,
  verified: true,
  country: "India"
}
```

Every MongoDB query is basically a question.

```text
Is this user from India?

Does this user have more than 1000 followers?

Is this user verified?
```

Operators help MongoDB answer these questions.

---

# Chapter 2: Equality Operators

Before we ask complex questions, we need to ask simple ones.

---

## Problem: Find Indian Users

Data:

```javascript
{
  username: "john",
  country: "India"
}

{
  username: "emma",
  country: "USA"
}
```

Business Requirement:

```text
Show users from India.
```

Query:

```javascript
db.users.find({
  country: {
    $eq: "India"
  }
})
```

### How MongoDB Thinks

```text
Document 1:

India === India

YES
```

```text
Document 2:

USA === India

NO
```

### Mental Model

```text
$eq

Exactly This
```

### Real World Uses

```text
Instagram
→ Users from India

Netflix
→ Movies in English

Amazon
→ Products from Apple
```

---

## Problem: Exclude Admins

Business Requirement:

```text
Show everyone except admins.
```

Query:

```javascript
db.users.find({
  role: {
    $ne: "admin"
  }
})
```

### Mental Model

```text
$ne

Everything Except This
```

---

# Chapter 3: Comparison Operators

Imagine Instagram wants influencers.

What defines an influencer?

```text
Followers > 1000
```

MongoDB needs operators for numeric comparisons.

---

## $gt (Greater Than)

```javascript
db.users.find({
  followers: {
    $gt: 1000
  }
})
```

### Mental Model

```text
More Than
```

### Real World

```text
Instagram
Followers > 1000

YouTube
Views > 1M

Amazon
Price > 500
```

---

## $gte (Greater Than Equal To)

```javascript
db.users.find({
  followers: {
    $gte: 1000
  }
})
```

### Mental Model

```text
At Least
```

Returns:

```text
1000
1001
5000
10000
```

---

## $lt (Less Than)

```javascript
db.products.find({
  price: {
    $lt: 500
  }
})
```

### Mental Model

```text
Less Than
```

---

## $lte (Less Than Equal To)

```javascript
db.products.find({
  price: {
    $lte: 500
  }
})
```

### Mental Model

```text
At Most
```

---

## Comparison Operator Family

| Operator | Meaning               |
| -------- | --------------------- |
| `$gt`    | Greater Than          |
| `$gte`   | Greater Than Equal To |
| `$lt`    | Less Than             |
| `$lte`   | Less Than Equal To    |

---

## How I Remember Them

| Requirement | Operator |
| ----------- | -------- |
| More than   | `$gt`    |
| At least    | `$gte`   |
| Less than   | `$lt`    |
| At most     | `$lte`   |

---

# Chapter 4: Multiple Choice Queries

Suppose Netflix asks:

```text
Show Action movies OR Sci-Fi movies.
```

This introduces list operators.

---

## $in

```javascript
db.movies.find({
  genre: {
    $in: [
      "Action",
      "Sci-Fi"
    ]
  }
})
```

### Mental Model

```text
Allowed List
```

Imagine a nightclub.

Guest list:

* John
* Emma
* Alex

If your name is on the list:

✅ Entry

Otherwise:

❌ No Entry

That's exactly what `$in` does.

---

## $nin

```javascript
db.users.find({
  country: {
    $nin: [
      "India",
      "USA"
    ]
  }
})
```

### Mental Model

```text
Blocked List
```

Meaning:

```text
Everyone except India and USA.
```

---

# Chapter 5: Combining Conditions

Real applications rarely use one condition.

---

Instagram Requirement:

```text
Verified users

AND

More than 1000 followers
```

---

## $and

```javascript
db.users.find({
  $and: [
    {
      verified: true
    },
    {
      followers: {
        $gt: 1000
      }
    }
  ]
})
```

### Mental Model

```text
Every Rule Must Pass
```

---

### MongoDB Shortcut

Instead of:

```javascript
{
  $and: [
    { verified: true },
    { country: "India" }
  ]
}
```

We usually write:

```javascript
{
  verified: true,
  country: "India"
}
```

MongoDB automatically applies AND.

---

## $or

```javascript
db.users.find({
  $or: [
    {
      verified: true
    },
    {
      followers: {
        $gt: 10000
      }
    }
  ]
})
```

### Mental Model

```text
Any Rule May Pass
```

---

# Chapter 6: Missing Fields

One of MongoDB's biggest strengths is flexible documents.

User A:

```javascript
{
  username: "john",
  bio: "Developer"
}
```

User B:

```javascript
{
  username: "emma"
}
```

Notice:

```text
No bio field.
```

How do we find users who completed their profile?

---

## $exists

```javascript
db.users.find({
  bio: {
    $exists: true
  }
})
```

### Mental Model

```text
Does The Field Exist?
```

---

### Find Users Without Bio

```javascript
db.users.find({
  bio: {
    $exists: false
  }
})
```

---

# Chapter 7: Arrays

MongoDB shines when working with arrays.

Instagram User:

```javascript
{
  interests: [
    "Coding",
    "AI",
    "Gaming"
  ]
}
```

---

## $all

Business Requirement:

```text
Must know Coding
AND
AI
```

Query:

```javascript
db.users.find({
  interests: {
    $all: [
      "Coding",
      "AI"
    ]
  }
})
```

### Mental Model

```text
Required Checklist
```

---

## $size

Business Requirement:

```text
Users with exactly 3 interests.
```

Query:

```javascript
db.users.find({
  interests: {
    $size: 3
  }
})
```

### Mental Model

```text
Array Length
```

---

# Chapter 8: Nested Documents

MongoDB allows objects inside objects.

Example:

```javascript
{
  address: {
    city: "Delhi",
    state: "Delhi"
  }
}
```

---

## Dot Notation

```javascript
db.users.find({
  "address.city": "Delhi"
})
```

### Mental Model

```text
address
   ↓
city
```

Follow the path.

---

# Chapter 9: Updating Data

So far we've only read data.

Now we change it.

---

## $set

```javascript
db.users.updateOne(
  {
    username: "john"
  },
  {
    $set: {
      bio: "Learning MongoDB"
    }
  }
)
```

### Mental Model

```text
Create Or Update
```

---

## $unset

```javascript
db.users.updateOne(
  {
    username: "john"
  },
  {
    $unset: {
      website: ""
    }
  }
)
```

### Mental Model

```text
Delete Field
```

---

## $rename

```javascript
db.users.updateOne(
  {},
  {
    $rename: {
      username: "userName"
    }
  }
)
```

### Mental Model

```text
Rename Field
```

---

# Chapter 10: Building Real Features

Now we reach the operators behind social media applications.

---

## $inc

Imagine YouTube.

Current document:

```javascript
{
  title: "MongoDB Tutorial",
  views: 100
}
```

A user watches the video.

Should we manually set:

```javascript
views: 101
```

No.

We simply increase by 1.

```javascript
db.videos.updateOne(
  {
    title: "MongoDB Tutorial"
  },
  {
    $inc: {
      views: 1
    }
  }
)
```

### Mental Model

```text
Current Value + Number
```

### Real World

```text
YouTube Views

Instagram Followers Count

Post Likes Count
```

---

## $push

Imagine Instagram comments.

Current document:

```javascript
{
  comments: [
    "Great post!"
  ]
}
```

Add another comment.

```javascript
db.posts.updateOne(
  {},
  {
    $push: {
      comments: "Amazing content!"
    }
  }
)
```

### Mental Model

```text
Always Add To Array
```

---

## $addToSet

Problem:

```javascript
[
  "john",
  "emma",
  "john"
]
```

Duplicate likes.

Not good.

Use:

```javascript
db.posts.updateOne(
  {},
  {
    $addToSet: {
      likes: "john"
    }
  }
)
```

### Mental Model

```text
Add Only If Missing
```

### Perfect For

```text
Likes

Followers

Tags

Watchlists
```

---

## $pull

Imagine a user unlikes a post.

```javascript
db.posts.updateOne(
  {},
  {
    $pull: {
      likes: "john"
    }
  }
)
```

### Mental Model

```text
Remove From Array
```

### Perfect For

```text
Unlike

Unfollow

Remove Tag

Remove Cart Item
```

---

# Operator Cheat Sheet

| Requirement               | Operator    |
| ------------------------- | ----------- |
| Exactly this value        | `$eq`       |
| Not this value            | `$ne`       |
| More than                 | `$gt`       |
| At least                  | `$gte`      |
| Less than                 | `$lt`       |
| At most                   | `$lte`      |
| In allowed list           | `$in`       |
| In blocked list           | `$nin`      |
| All conditions            | `$and`      |
| Any condition             | `$or`       |
| Field exists              | `$exists`   |
| Array contains all values | `$all`      |
| Array length              | `$size`     |
| Create / Update field     | `$set`      |
| Delete field              | `$unset`    |
| Rename field              | `$rename`   |
| Increase number           | `$inc`      |
| Add to array              | `$push`     |
| Add without duplicates    | `$addToSet` |
| Remove from array         | `$pull`     |

---

# Final Thought

The goal is not:

```text
Memorize Operators
```

The goal is:

```text
Business Requirement
        ↓
Translate To MongoDB
        ↓
Choose Operator
```

When someone says:

```text
Increase views
```

You should immediately think:

```javascript
$inc
```

When someone says:

```text
Add follower without duplicates
```

You should immediately think:

```javascript
$addToSet
```

When someone says:

```text
Remove a like
```

You should immediately think:

```javascript
$pull
```

That's when MongoDB starts feeling natural instead of something you're trying to memorize.
