# MongoDB Pagination - Complete Self-Learning Guide

## 📖 What is Pagination?

Pagination is the process of dividing a large dataset into smaller chunks called **pages**.

Imagine you have a MongoDB collection containing:

```text
1,000,000 users
```

Fetching all users at once would:

* Consume excessive memory
* Increase response time
* Slow down the application
* Waste network bandwidth

Instead, we fetch only a small subset of records at a time.

Example:

```text
Page 1 → Users 1 - 10
Page 2 → Users 11 - 20
Page 3 → Users 21 - 30
```

This approach is called **Pagination**.

---

# Why Do We Need Pagination?

Without Pagination:

```javascript
const users = await User.find();
```

Problems:

* Loads all documents into memory
* Slow API response
* Poor user experience
* Not scalable

With Pagination:

```javascript
const users = await User.find()
  .skip(0)
  .limit(10);
```

Benefits:

✅ Faster APIs

✅ Less Memory Usage

✅ Better User Experience

✅ Scalable Applications

---

# Method 1: Skip and Limit Pagination

This is the most common pagination approach beginners learn.

MongoDB provides:

* `skip()`
* `limit()`

## Understanding limit()

`limit()` tells MongoDB how many documents to return.

Example:

```javascript
db.users.find().limit(5);
```

Result:

```text
Returns only 5 documents
```

---

## Understanding skip()

`skip()` tells MongoDB how many documents to ignore before returning results.

Example:

```javascript
db.users.find()
  .skip(5)
  .limit(5);
```

MongoDB:

```text
Skip first 5 documents
Return next 5 documents
```

---

# Visual Understanding

Collection:

```text
1
2
3
4
5
6
7
8
9
10
11
12
```

Query:

```javascript
db.users.find()
  .skip(5)
  .limit(3);
```

Execution:

```text
Skip:
1
2
3
4
5

Return:
6
7
8
```

---

# Pagination Formula

This formula is used in almost every API.

```javascript
skip = (page - 1) * limit
```

Example:

```javascript
page = 3
limit = 10
```

Calculation:

```javascript
skip = (3 - 1) * 10
skip = 20
```

Query:

```javascript
db.users.find()
  .skip(20)
  .limit(10);
```

Result:

```text
Users 21 - 30
```

---

# API Example Using Express and Mongoose

```javascript
app.get("/users", async (req, res) => {

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit);

  res.json(users);

});
```

Request:

```http
GET /users?page=2&limit=10
```

Response:

```json
[
  {},
  {},
  {}
]
```

---

# Getting Total Documents

Most frontends need information like:

```text
Page 2 of 50
```

For that we need the total number of documents.

```javascript
const totalDocuments = await User.countDocuments();
```

Example:

```javascript
const totalPages = Math.ceil(
  totalDocuments / limit
);
```

---

# Complete Pagination Response

```javascript
app.get("/users", async (req, res) => {

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const totalDocuments =
    await User.countDocuments();

  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    page,
    limit,
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    data: users
  });

});
```

Response:

```json
{
  "page": 2,
  "limit": 10,
  "totalDocuments": 500,
  "totalPages": 50,
  "data": []
}
```

---

# The Big Problem with Skip()

Many developers stop learning here.

But understanding this limitation is important for interviews and production systems.

Suppose you have:

```text
10 Million Documents
```

Request:

```javascript
skip(9000000)
```

MongoDB cannot magically jump to document 9,000,001.

Instead it:

```text
Read
↓
Read
↓
Read
↓
Skip 9 Million Records
↓
Return Next Records
```

This is expensive.

As page number increases:

```text
Performance Decreases
```

---

# Why Skip Gets Slower

Example:

Page 1

```javascript
skip(0)
```

Fast ✅

---

Page 100

```javascript
skip(990)
```

Still okay ✅

---

Page 10,000

```javascript
skip(99990)
```

Slow ❌

---

Page 1,000,000

```javascript
skip(9999990)
```

Very Slow ❌

---

# Cursor Pagination (Recommended)

Professional applications rarely use large skip values.

Instead they use:

## Cursor-Based Pagination

Cursor Pagination uses a unique indexed field.

Usually:

```javascript
_id
```

Because MongoDB automatically creates an index on `_id`.

---

# How Cursor Pagination Works

First Query:

```javascript
db.users.find()
  .sort({ _id: 1 })
  .limit(10);
```

Assume the last document returned is:

```javascript
{
  _id: ObjectId("65abc123")
}
```

Save:

```text
65abc123
```

This becomes our cursor.

---

# Fetch Next Page

```javascript
db.users.find({
  _id: {
    $gt: ObjectId("65abc123")
  }
})
.sort({ _id: 1 })
.limit(10);
```

MongoDB uses the index and immediately finds the next records.

---

# Visual Explanation

First Page:

```text
1
2
3
4
5
6
7
8
9
10
```

Cursor:

```text
10
```

Next Query:

```text
Find _id > 10
```

Result:

```text
11
12
13
14
15
16
17
18
19
20
```

No skipping required.

---

# Why Cursor Pagination is Faster

Skip Pagination:

```text
Read Records
↓
Skip Records
↓
Return Results
```

Cursor Pagination:

```text
Use Index
↓
Jump Directly
↓
Return Results
```

Time Complexity:

```text
Skip Pagination:
O(n)

Cursor Pagination:
Near O(log n)
```

---

# Cursor Pagination API Example

```javascript
app.get("/users", async (req, res) => {

  const limit = 10;

  const cursor = req.query.cursor;

  const query = cursor
    ? { _id: { $gt: cursor } }
    : {};

  const users = await User.find(query)
    .sort({ _id: 1 })
    .limit(limit);

  const nextCursor =
    users.length
      ? users[users.length - 1]._id
      : null;

  res.json({
    data: users,
    nextCursor
  });

});
```

---

# When to Use Skip Pagination?

Use Skip Pagination when:

* Small datasets
* Admin dashboards
* Internal tools
* Less than a few thousand records

Example:

```text
Employee Management System
```

Good choice ✅

---

# When to Use Cursor Pagination?

Use Cursor Pagination when:

* Large datasets
* Social media feeds
* E-commerce websites
* Chat applications
* Production APIs

Examples:

```text
Instagram Feed
Twitter Timeline
Facebook Posts
YouTube Comments
```

Best choice ✅

---

# Interview Questions

## Q1: What is Pagination?

Pagination is the process of dividing a large dataset into smaller pages and retrieving only the required records.

---

## Q2: What are skip() and limit()?

* `skip()` ignores documents.
* `limit()` restricts the number of returned documents.

---

## Q3: What is the formula for pagination?

```javascript
skip = (page - 1) * limit
```

---

## Q4: Why is skip() slow?

MongoDB must traverse and discard skipped documents before returning results.

---

## Q5: Why is Cursor Pagination better?

Because it uses indexed fields and avoids scanning or skipping large numbers of documents.

---

## Q6: Which field is commonly used as a cursor?

```javascript
_id
```

Because MongoDB automatically indexes it.

---

# Quick Revision Notes

### Skip Pagination

```javascript
.find()
.skip((page - 1) * limit)
.limit(limit)
```

Pros:

* Easy to implement
* Easy page navigation

Cons:

* Slow on large datasets

---

### Cursor Pagination

```javascript
.find({
  _id: { $gt: cursor }
})
.limit(limit)
```

Pros:

* Very fast
* Scales well
* Used in production

Cons:

* Cannot directly jump to page 100

---

# Final Rule to Remember

If you're learning MongoDB:

```text
Start with Skip + Limit
```

If you're building production APIs:

```text
Prefer Cursor Pagination
```

If an interviewer asks:

"Which pagination strategy would you choose for millions of records?"

Answer:

```text
Cursor Pagination because it leverages indexes and avoids expensive document skipping operations.
```
