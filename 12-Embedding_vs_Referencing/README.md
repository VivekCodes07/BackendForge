# MongoDB Schema Design

# Introduction

When I first started learning MongoDB, I thought the hardest part would be learning commands like:

```javascript
find()
insertOne()
updateOne()
```

But later I realized something much more important:

```text
How should I store my data?
```

MongoDB gives us multiple ways to store related data.

The challenge is not learning the syntax.

The challenge is deciding:

```text
Should I Embed?

or

Should I Reference?
```

This README contains my notes while learning MongoDB schema design.

---

# What Is Schema Design?

Schema design means deciding:

```text
How my data should be structured inside MongoDB.
```

For example:

Suppose I am building Instagram.

I need:

* Users
* Posts
* Comments
* Followers
* Likes

Now the question becomes:

```text
Should everything be stored inside a single document?

or

Should I split the data into multiple collections?
```

This is where Embedding and Referencing come into play.

---

# Embedding

## What Is Embedding?

Embedding means:

```text
Store related data inside the same document.
```

Example:

```javascript
{
  name: "Vivek",

  address: {
    city: "Jhumri Telaiya",
    state: "Jharkhand",
    pin: 825410
  }
}
```

Here:

```text
Address belongs to the user.
```

So we store it inside the user document.

This is called:

```text
Embedding
```

---

# Thinking About Embedding

When I look at a piece of data, I ask:

```text
Does this information naturally belong to this document?
```

If yes, embedding may be a good choice.

For example:

```javascript
{
  username: "vivek",

  preferences: {
    theme: "dark",
    language: "English"
  }
}
```

The preferences belong to the user.

Keeping them together feels natural.

---

# Real World Example: Netflix

Suppose Netflix stores user information.

```javascript
{
  username: "vivek",

  email: "vivek@gmail.com",

  subscription: {
    plan: "Premium",
    screens: 4,
    monthlyPrice: 999
  },

  preferences: {
    language: "English",
    favoriteGenre: "Sci-Fi"
  }
}
```

Why embed?

Because:

```text
Subscription belongs to user

Preferences belong to user

Data is small

Data is usually read together
```

One query can fetch everything.

```javascript
db.users.findOne({
  username: "vivek"
})
```

Simple.

Fast.

Clean.

---

# Benefits of Embedding

## 1. Natural Structure

The document resembles real life.

```text
User
 ├── Address
 ├── Preferences
 └── Subscription
```

---

## 2. Easy To Read

Everything is located together.

---

## 3. Faster Reads

MongoDB can fetch related information using a single query.

---

## 4. Fewer Collections

No unnecessary splitting of data.

---

# When Embedding Works Best

Embedding is usually a good choice when:

```text
Data belongs together

Data is small

Data has limited growth

Data is usually read together
```

Examples:

* Address
* Preferences
* Subscription
* Settings
* Profile Information

---

# Referencing

Embedding is powerful.

But it is not always the correct solution.

Let's look at another example.

---

# The Problem With Embedding Everything

Imagine Instagram stores posts like this:

```javascript
{
  username: "john",

  posts: [
    post1,
    post2,
    post3
  ]
}
```

Initially it looks fine.

But what happens after:

```text
100 posts

1000 posts

10000 posts

50000 posts
```

The user document becomes huge.

This is not ideal.

---

# MongoDB's Solution

Store posts separately.

Users Collection:

```javascript
{
  _id: ObjectId("u1"),
  username: "john"
}
```

Posts Collection:

```javascript
{
  _id: ObjectId("p1"),

  userId: ObjectId("u1"),

  caption: "Beautiful Sunset"
}
```

Notice:

```text
The post does not contain the entire user.
```

Instead:

```javascript
userId: ObjectId("u1")
```

creates a connection.

This is called:

```text
Referencing
```

---

# What Is Referencing?

Referencing means:

```text
Store data separately and connect documents using IDs.
```

Instead of putting everything inside one document.

---

# Real World Example: Instagram

Users Collection

```javascript
{
  _id: ObjectId("u1"),
  username: "vivek"
}
```

Posts Collection

```javascript
{
  _id: ObjectId("p1"),
  userId: ObjectId("u1"),
  caption: "Evening Vibes"
}
```

Another Post

```javascript
{
  _id: ObjectId("p2"),
  userId: ObjectId("u1"),
  caption: "Learning MongoDB"
}
```

One user.

Multiple posts.

All connected through:

```javascript
userId
```

---

# Why Referencing Exists

Imagine a popular Instagram creator.

```text
5 Million Followers

100 Thousand Posts

Millions of Likes
```

Embedding everything inside a user document would be a disaster.

Referencing allows MongoDB to store massive amounts of related data efficiently.

---

# When Referencing Works Best

Referencing is usually a good choice when:

```text
Data grows continuously

Data can become very large

Data can exist independently

One-to-many relationships exist
```

Examples:

* Posts
* Followers
* Comments
* Reviews
* Orders
* Transactions
* Likes

---

# Embedding vs Referencing

Now comes the most important question.

```text
When should I choose Embedding?

When should I choose Referencing?
```

---

# The Three Question Framework

Whenever I design a schema, I ask myself three questions.

---

## Question 1

```text
Does this data belong to this document?
```

If the answer is:

```text
No
```

I usually reference it.

---

## Question 2

```text
Can this data grow forever?
```

Examples:

```text
Followers

Comments

Posts

Reviews
```

If the answer is:

```text
Yes
```

I usually reference it.

---

## Question 3

```text
Is this data usually read together?
```

Examples:

```text
Address

Preferences

Subscription
```

If the answer is:

```text
Yes
```

Embedding becomes a strong choice.

---

# Example 1: User Address

Address belongs to user.

Address does not grow forever.

Address is usually read with user data.

Decision:

```text
Embed
```

```javascript
{
  name: "Vivek",

  address: {
    city: "Jhumri Telaiya",
    state: "Jharkhand"
  }
}
```

---

# Example 2: Instagram Followers

Followers belong to user.

But followers can become:

```text
100

1000

10000

1000000
```

Decision:

```text
Reference
```

---

# Example 3: Netflix Subscription

Subscription belongs to user.

Subscription is small.

Subscription is always read with the user profile.

Decision:

```text
Embed
```

---

# Example 4: Product Reviews

Reviews belong to product.

But reviews can become unlimited.

Decision:

```text
Reference
```

---

# Mental Model

Whenever I see a piece of data, I use this rule:

If the data is:

```text
Small

Limited

Belongs Together

Read Together
```

I choose:

```text
Embedding
```

---

If the data is:

```text
Large

Unlimited

Growing Constantly

Independent
```

I choose:

```text
Referencing
```

---

# Quick Comparison

| Situation           | Choice    |
| ------------------- | --------- |
| User Address        | Embed     |
| User Preferences    | Embed     |
| User Settings       | Embed     |
| User Subscription   | Embed     |
| Instagram Posts     | Reference |
| Instagram Followers | Reference |
| Comments            | Reference |
| Reviews             | Reference |
| Orders              | Reference |
| Transactions        | Reference |

---

# What I Learned

Before learning schema design, I thought MongoDB was mostly about commands.

Now I understand that:

```text
Good MongoDB design is about understanding how data behaves.
```

If data is:

```text
Small
Connected
Read Together
```

I embed it.

If data is:

```text
Large
Growing
Independent
```

I reference it.

This simple idea is the foundation of MongoDB schema design.
