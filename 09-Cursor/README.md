# MongoDB Cursor - Understanding What `find()` Actually Returns

> These are my notes while learning MongoDB Cursors. Instead of memorizing definitions, I want to understand why cursors exist, what problem they solve, and how real applications use them.

---

# Introduction

When I first learned MongoDB, I thought:

```javascript
db.users.find({})
```

returns:

```javascript
[
  { name: "John" },
  { name: "Emma" },
  { name: "Alex" }
]
```

Seems reasonable.

After all, I asked MongoDB for documents.

Why wouldn't it return documents?

But that's not what actually happens.

MongoDB returns something called a:

```text
Cursor
```

At first this sounded confusing.

Why return a cursor instead of the actual data?

The answer becomes obvious once we understand the problem MongoDB is trying to solve.

---

# Chapter 1: The Problem Cursors Solve

Imagine a small collection.

```javascript
[
  { name: "John" },
  { name: "Emma" },
  { name: "Alex" }
]
```

Running:

```javascript
db.users.find({})
```

is easy.

MongoDB can return all documents instantly.

No problem.

---

Now imagine Instagram.

Instead of:

```text
3 users
```

we have:

```text
500 Million Users
```

Now ask yourself:

Should MongoDB do this?

```text
1. Read all 500 million users

2. Load all users into memory

3. Send everything to the application
```

Absolutely not.

That would:

```text
❌ Consume huge memory

❌ Slow down the server

❌ Increase network traffic

❌ Hurt performance
```

MongoDB needed a smarter solution.

That solution is:

```text
Cursor
```

---

# Chapter 2: What Is A Cursor?

A Cursor is not the data itself.

A Cursor is a way to access the data gradually.

Think:

```text
Cursor = Pointer to results
```

or

```text
Cursor = Bookmark
```

or

```text
Cursor = Position Tracker
```

MongoDB says:

```text
I found the matching documents.

I won't send everything immediately.

I'll give them to you as needed.
```

---

# Chapter 3: Library Analogy

Imagine entering a massive library.

You ask:

```text
Show me every book in the library.
```

The librarian does NOT:

```text
Bring every book and dump them on your table.
```

😂

Instead:

```text
Here's a way to browse them.

Need more?

Ask again.
```

That's exactly how a cursor works.

---

# Chapter 4: What Actually Happens Internally?

Suppose our collection contains:

```javascript
[
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 }
]
```

Now we run:

```javascript
db.numbers.find({})
```

Many beginners imagine:

```javascript
[
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 },
  { value: 5 }
]
```

being returned.

Not exactly.

MongoDB creates something conceptually like:

```text
Cursor
  ↓

1
2
3
4
5
```

Notice:

```text
Documents stay inside collection.

Cursor only knows where to read from.
```

This distinction is extremely important.

---

# Chapter 5: Cursor Does NOT Store Documents

Many beginners think:

```text
Cursor contains documents
```

Wrong.

Think:

```text
Cursor points to documents
```

Similar to:

```text
Netflix remembers current episode

Browser remembers current tab

Bookmark remembers current page

Cursor remembers current position
```

The data remains where it originally exists.

---

# Chapter 6: The Biggest Beginner Mistake

When people see:

```javascript
db.users.find({})
```

they assume:

```text
find() returns documents
```

Not exactly.

The real flow is:

```text
find()
    ↓
Cursor
    ↓
Documents
```

This is one of the most important MongoDB concepts.

---

# Chapter 7: Why Mongo Shell Looks Confusing

Consider:

```javascript
db.users.find({})
```

Output:

```javascript
{ name: "John" }
{ name: "Emma" }
{ name: "Alex" }
```

Looks like documents.

Right?

Internally:

```text
find()
returns Cursor
```

Then:

```text
Mongo Shell automatically reads the cursor
```

and displays documents.

Think:

```text
Cursor
   ↓
Mongo Shell reads it
   ↓
Documents appear
```

---

# Chapter 8: Understanding next()

Let's create a cursor.

```javascript
const cursor = db.users.find({})
```

Current state:

```text
Cursor
 ↓

John
Emma
Alex
David
```

Now:

```javascript
cursor.next()
```

Output:

```javascript
{
  name: "John"
}
```

Cursor moves forward.

```text
John

Cursor
 ↓

Emma
Alex
David
```

Call again:

```javascript
cursor.next()
```

Output:

```javascript
{
  name: "Emma"
}
```

Cursor continues moving.

---

# Chapter 9: Understanding hasNext()

Before reading another document:

```javascript
cursor.hasNext()
```

MongoDB checks:

```text
Are there more documents available?
```

Result:

```javascript
true
```

or

```javascript
false
```

---

Example:

```javascript
while(cursor.hasNext()) {
  printjson(cursor.next())
}
```

Meaning:

```text
Keep reading documents
until none remain.
```

---

# Chapter 10: Understanding toArray()

Sometimes we genuinely want everything.

Example:

```javascript
db.users.find({}).toArray()
```

Now MongoDB converts:

```text
Cursor
```

into:

```javascript
[
  { name: "John" },
  { name: "Emma" },
  { name: "Alex" }
]
```

Now it becomes an actual array.

---

# Why toArray() Can Be Dangerous

Imagine:

```text
50 Million Documents
```

Then:

```javascript
db.users.find({}).toArray()
```

means:

```text
Load all 50 million documents into memory
```

Potential disaster.

Always be careful with:

```javascript
toArray()
```

on large collections.

---

# Chapter 11: Understanding limit()

Imagine Instagram.

Should the homepage load:

```text
1 million posts?
```

No.

Maybe:

```text
10 posts
```

Example:

```javascript
db.posts.find({})
        .limit(10)
```

Meaning:

```text
Only return first 10 documents.
```

---

Visual Example

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
.limit(5)
```

Result:

```text
1
2
3
4
5
```

Stop.

---

# Chapter 12: Understanding skip()

Suppose Page 1 already displayed:

```text
1
2
3
4
5
```

Now user clicks:

```text
Next Page
```

Query:

```javascript
db.posts.find({})
        .skip(5)
        .limit(5)
```

Meaning:

```text
Ignore first 5 documents

Return next 5
```

Result:

```text
6
7
8
9
10
```

---

# Chapter 13: Pagination - The Real Reason Cursors Matter

If someone asks me:

> Why should I learn cursors?

My answer would be:

```text
Because cursors make pagination possible.
```

Almost every application I use daily depends on pagination.

Examples:

* Instagram Feed
* Netflix Movies
* Amazon Products
* YouTube Videos
* LinkedIn Posts
* Facebook Feed

Without pagination, applications would become extremely slow.

---

# What Problem Does Pagination Solve?

Imagine Instagram has:

```text
500 Million Posts
```

When a user opens Instagram, should MongoDB return:

```text
500 Million Posts
```

Obviously not.

That would:

```text
❌ Consume huge memory

❌ Slow down the database

❌ Slow down the network

❌ Make the application unusable
```

Instead Instagram says:

```text
Give me only the first few posts.
```

This idea is called:

```text
Pagination
```

---

# What Is Pagination?

Pagination means:

```text
Divide a large result into smaller chunks.
```

Instead of:

```text
1 - 1000000 Posts
```

We show:

```text
Page 1 -> Posts 1-10

Page 2 -> Posts 11-20

Page 3 -> Posts 21-30
```

and so on.

---

# Visual Example

Suppose our collection contains:

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

If page size is:

```text
3
```

Then:

```text
Page 1

1
2
3
```

```text
Page 2

4
5
6
```

```text
Page 3

7
8
9
```

```text
Page 4

10
11
12
```

This is pagination.

---

# Pagination Using limit()

To show only first 3 documents:

```javascript
db.posts.find({})
        .limit(3)
```

Result:

```text
1
2
3
```

MongoDB creates a cursor and stops after 3 documents.

---

# Pagination Using skip()

Suppose user clicks:

```text
Next Page
```

Now we don't want:

```text
1
2
3
```

again.

We want:

```text
4
5
6
```

Query:

```javascript
db.posts.find({})
        .skip(3)
        .limit(3)
```

Meaning:

```text
Skip first 3 documents

Return next 3 documents
```

Result:

```text
4
5
6
```

---

# Understanding skip() + limit()

Think of it like a queue.

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
```

Query:

```javascript
db.posts.find({})
        .skip(4)
        .limit(3)
```

Step 1:

```text
Skip

1
2
3
4
```

Step 2:

Cursor starts here:

```text
5
6
7
8
9
10
```

Step 3:

Take 3 documents:

```text
5
6
7
```

Final Result:

```text
5
6
7
```

---

# Real World Example: Instagram

Imagine Instagram loads:

```text
10 posts at a time
```

Homepage:

```javascript
db.posts.find({})
        .limit(10)
```

User scrolls down.

Load next batch:

```javascript
db.posts.find({})
        .skip(10)
        .limit(10)
```

User scrolls again.

```javascript
db.posts.find({})
        .skip(20)
        .limit(10)
```

And so on.

---

# Real World Example: Netflix

Suppose Netflix has:

```text
50,000 Movies
```

Homepage:

```javascript
db.movies.find({})
         .limit(20)
```

Only first 20 movies appear.

When user navigates further:

```javascript
db.movies.find({})
         .skip(20)
         .limit(20)
```

Next 20 movies appear.

This is pagination.

---

# Real World Example: Amazon

Amazon may have:

```text
Millions of Products
```

Search:

```text
Laptop
```

Should Amazon show:

```text
All laptops at once?
```

No.

Instead:

```text
Page 1 -> 25 products

Page 2 -> Next 25 products

Page 3 -> Next 25 products
```

MongoDB query:

```javascript
db.products.find({})
           .skip(25)
           .limit(25)
```

---

# The Pagination Formula

This is one of the most common formulas in backend development.

```javascript
skip = (pageNumber - 1) * pageSize
```

---

Example

Page Number:

```text
1
```

Page Size:

```text
10
```

Calculation:

```javascript
skip = (1 - 1) * 10
skip = 0
```

Query:

```javascript
db.posts.find({})
        .skip(0)
        .limit(10)
```

---

Example

Page Number:

```text
3
```

Page Size:

```text
10
```

Calculation:

```javascript
skip = (3 - 1) * 10
skip = 20
```

Query:

```javascript
db.posts.find({})
        .skip(20)
        .limit(10)
```

Result:

```text
21-30
```

---

# How Cursor Helps Pagination

Remember:

```javascript
db.posts.find({})
```

returns:

```text
Cursor
```

Now:

```javascript
db.posts.find({})
        .skip(20)
        .limit(10)
```

MongoDB does not load every document.

Instead:

```text
Cursor
    ↓
Moves forward
    ↓
Skips 20 documents
    ↓
Reads next 10 documents
```

This is why pagination is efficient.

---

# My Mental Model

When I see:

```javascript
db.posts.find({})
        .skip(20)
        .limit(10)
```

I imagine:

```text
Cursor
  ↓

1
2
3
...
20

(Cursor skips these)

21
22
23
24
25
26
27
28
29
30

(Cursor returns these)
```

This makes pagination very easy to understand.

---

# Quick Revision

Pagination means:

```text
Breaking large result sets into smaller pages.
```

Main methods:

```javascript
limit()
```

Returns limited documents.

```javascript
skip()
```

Ignores documents.

Together:

```javascript
db.posts.find({})
        .skip(20)
        .limit(10)
```

Meaning:

```text
Ignore first 20 documents

Return next 10 documents
```

This is one of the most common patterns used in real-world backend development.

---

# Chapter 14: Real World Examples

## Instagram

Homepage feed:

```javascript
db.posts.find({})
        .limit(10)
```

Load more:

```javascript
db.posts.find({})
        .skip(10)
        .limit(10)
```

---

## Netflix

Display first batch of movies:

```javascript
db.movies.find({})
         .limit(20)
```

---

## Amazon

First page of products:

```javascript
db.products.find({})
           .limit(25)
```

Next page:

```javascript
db.products.find({})
           .skip(25)
           .limit(25)
```

---

# Chapter 15: How I Think About Cursors

Whenever I see:

```javascript
find()
```

I immediately think:

```text
Cursor
```

Whenever I see:

```javascript
next()
```

I think:

```text
Move cursor forward
```

Whenever I see:

```javascript
hasNext()
```

I think:

```text
Check if more documents exist
```

Whenever I see:

```javascript
toArray()
```

I think:

```text
Convert cursor into array
```

Whenever I see:

```javascript
limit(10)
```

I think:

```text
Restrict output to 10 documents
```

Whenever I see:

```javascript
skip(20)
```

I think:

```text
Move ahead by 20 documents
```

---

# The Golden Rule

Most beginners think:

```text
find()
    ↓
Documents
```

A MongoDB developer thinks:

```text
find()
    ↓
Cursor
    ↓
Documents
```

That tiny difference is the entire lesson.

---

# One-Line Definition

A Cursor is an object returned by `find()` that points to query results and allows MongoDB to fetch documents gradually instead of loading everything into memory at once.

---

# Final Thought

The purpose of a cursor is not to make MongoDB complicated.

The purpose of a cursor is to make MongoDB scalable.

Without cursors:

```text
Large collections
↓
Huge memory usage
↓
Slow applications
```

With cursors:

```text
Large collections
↓
Read data gradually
↓
Efficient memory usage
↓
Better performance
```

Whenever I write:

```javascript
db.users.find({})
```

I no longer think:

```text
Give me documents
```

I think:

```text
Give me a cursor that can read documents.
```

And that is the mindset of a MongoDB developer.
