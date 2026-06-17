# MongoDB Projection - Explained Like a Real Developer

## The Problem Projection Solves

Imagine you're building Netflix.

You have a collection called `movies`.

A movie document looks like this:

```json
{
  "_id": 1,
  "title": "Interstellar",
  "director": "Christopher Nolan",
  "releaseYear": 2014,
  "genre": "Sci-Fi",
  "budget": 165000000,
  "rating": 8.7
}
```

Now suppose you're building the Netflix homepage.

The UI only needs:

```text
Movie Name
Rating
```

Something like:

```text
Interstellar ⭐ 8.7
```

Question:

Do we really need to fetch:

```text
director
budget
releaseYear
genre
```

No.

That would be like ordering a pizza and receiving the entire kitchen.

We only need specific information.

This is where **Projection** comes in.

---

# What is Projection?

Projection means:

> "From the documents you found, return only the fields I care about."

Think:

```text
Query
↓
Finds Documents

Projection
↓
Selects Fields
```

---

# Real World Analogy

Imagine Instagram.

A user document:

```json
{
  "_id": 1,
  "username": "vivek",
  "email": "vivek@gmail.com",
  "password": "secret123",
  "followers": 1200,
  "following": 300,
  "bio": "Software Engineer"
}
```

Now Instagram wants to show:

```text
Username
Bio
Followers
```

Would Instagram send:

```text
Password
Email
```

to every visitor?

Of course not.

That would be dangerous.

Instead, Instagram uses Projection.

---

# MongoDB Syntax

```javascript
db.collection.find(
    query,
    projection
)
```

Example:

```javascript
db.users.find(
    {},
    {
        username: 1,
        bio: 1
    }
)
```

---

# Understanding find()

MongoDB asks two questions.

## Question 1

```javascript
{}
```

means:

> Which documents should I return?

Answer:

```text
All documents
```

---

## Question 2

```javascript
{
   username: 1,
   bio: 1
}
```

means:

> Which fields should I return?

Answer:

```text
username
bio
```

---

# The Camera Analogy

Imagine a movie set.

The entire scene contains:

```text
Actors
Cars
Buildings
Roads
Trees
```

But your camera focuses only on:

```text
Actor
```

Everything else exists.

You simply choose not to show it.

Projection works exactly like that.

---

# Inclusion Projection

Use:

```javascript
1
```

to include a field.

Example:

```javascript
db.users.find(
    {},
    {
        username: 1,
        followers: 1
    }
)
```

Result:

```json
{
   "_id": 1,
   "username": "vivek",
   "followers": 1200
}
```

---

# Wait... Why Is _id Coming Back?

Many beginners ask this.

We requested:

```javascript
{
   username: 1,
   followers: 1
}
```

but MongoDB returns:

```javascript
_id
```

too.

Why?

MongoDB assumes:

> "You might still want the identity of the document."

So `_id` is included automatically.

---

# Removing _id

If you don't want it:

```javascript
db.users.find(
    {},
    {
        _id: 0,
        username: 1,
        followers: 1
    }
)
```

Result:

```json
{
   "username": "vivek",
   "followers": 1200
}
```

---

# Exclusion Projection

Sometimes it's easier to say:

> Return everything except a few fields.

Example:

```javascript
db.users.find(
    {},
    {
        password: 0
    }
)
```

Think:

```text
Give me the whole document

BUT

Hide password
```

Result:

```json
{
   "_id": 1,
   "username": "vivek",
   "email": "vivek@gmail.com",
   "followers": 1200
}
```

Password is gone.

---

# Why Companies Use Projection

Imagine Instagram has:

```text
10 million users
```

Every profile document contains:

```text
Username
Bio
Email
Password
Settings
Notifications
Messages
Followers
Following
```

Now a visitor opens your profile.

Should Instagram fetch everything?

No.

That would:

* Transfer unnecessary data
* Increase network cost
* Slow down responses
* Expose sensitive information

Instead:

```javascript
db.users.find(
    {username: "vivek"},
    {
        username: 1,
        bio: 1,
        followers: 1
    }
)
```

Only the required data travels over the network.

---

# Projection With Multiple Documents

Suppose Netflix has:

```json
{
   "title": "Interstellar",
   "rating": 8.7,
   "director": "Christopher Nolan"
}
```

```json
{
   "title": "Inception",
   "rating": 8.8,
   "director": "Christopher Nolan"
}
```

```json
{
   "title": "Tenet",
   "rating": 7.3,
   "director": "Christopher Nolan"
}
```

Query:

```javascript
db.movies.find(
    {},
    {
        _id: 0,
        title: 1,
        rating: 1
    }
)
```

MongoDB applies projection to every matching document.

Result:

```json
{
   "title": "Interstellar",
   "rating": 8.7
}
```

```json
{
   "title": "Inception",
   "rating": 8.8
}
```

```json
{
   "title": "Tenet",
   "rating": 7.3
}
```

---

# Nested Fields and Projection

Suppose we have:

```json
{
   "name": "Leanne Graham",
   "address": {
      "city": "Gwenborough",
      "zipcode": "92998-3874"
   }
}
```

We only need the city.

MongoDB provides **Dot Notation**.

```javascript
db.users.find(
    {},
    {
        _id: 0,
        "address.city": 1
    }
)
```

Result:

```json
{
   "address": {
      "city": "Gwenborough"
   }
}
```

---

# Real Dataset Example

Using our users collection:

```javascript
db.users.find(
    {username: "Bret"},
    {
        _id: 0,
        name: 1,
        email: 1,
        "company.name": 1
    }
)
```

Result:

```json
{
   "name": "Leanne Graham",
   "email": "Sincere@april.biz",
   "company": {
      "name": "Romaguera-Crona"
   }
}
```

---

# The Biggest Mistake Beginners Make

Many beginners think:

```text
Projection decides which documents come back
```

❌ Wrong

Projection never chooses documents.

Query chooses documents.

Projection chooses fields.

Remember:

```text
Collection
    ↓
Query
    ↓
Matching Documents
    ↓
Projection
    ↓
Selected Fields
```

---

# Interview Definition

If someone asks:

> Why do we use Projection?

Answer:

> Projection is used to return only the required fields from matching documents. It reduces data transfer, improves performance, keeps responses clean, and prevents unnecessary exposure of sensitive information.

---

# Quick Revision

| Concept      | Meaning              |
| ------------ | -------------------- |
| Query        | Selects documents    |
| Projection   | Selects fields       |
| 1            | Include field        |
| 0            | Exclude field        |
| _id          | Included by default  |
| _id: 0       | Excludes _id         |
| Dot Notation | Access nested fields |

---

# Golden Rule

Remember:

> Query decides **which documents** come back.

> Projection decides **which parts of those documents** come back.

Or in one line:

> "I found the right document. Now show me only the parts I care about."

That's exactly how Netflix, Instagram, Amazon, and most modern applications use MongoDB every day.
