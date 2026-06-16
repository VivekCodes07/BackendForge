# 🚀 MongoDB CRUD Practice Project

A hands-on MongoDB practice project covering database creation, collections, CRUD operations, filtering, updates, deletion, and a mini Instagram Clone simulation.

---

## 📚 Learning Objectives

By completing this project, you will learn how to:

* Create and manage MongoDB databases
* Create collections
* Insert single and multiple documents
* Query data using filters
* Update existing documents
* Delete documents
* Count documents
* Build a simple real-world database structure
* Practice common MongoDB interview questions

---

# 🟢 Level 1 — Database Setup

### Tasks

* View all available databases
* Create a new database: `shopApp`
* Switch to the database
* Verify database creation
* Create a collection called `users`

---

# 👤 Level 2 — User Management System

Imagine users are signing up on a website.

### Tasks

#### Create a User

Insert a user with the following information:

| Field | Value                                     |
| ----- | ----------------------------------------- |
| Name  | Rahul                                     |
| Email | [rahul@gmail.com](mailto:rahul@gmail.com) |
| City  | Los Angeles                               |
| Age   | 22                                        |

#### Additional Practice

* Add another user
* Insert 3 users at once
* Display all users
* Find users from Los Angeles

---

# 🛒 Level 3 — E-Commerce Product System

Create a simple product catalog for an e-commerce website.

### Create Collection

```text
products
```

### Insert Products

* iPhone
* Laptop
* Headphones
* Shoes

### Suggested Fields

| Field    | Description        |
| -------- | ------------------ |
| name     | Product Name       |
| price    | Product Price      |
| category | Product Category   |
| stock    | Available Quantity |

### Practice Queries

* Show all products
* Find electronics products
* Count total products

---

# 🔄 Level 4 — Update Operations

Real-world applications constantly update data.

### Tasks

* Update a user's city
* Update a user's email
* Update a product price
* Update stock for all products

---

# 🗑️ Level 5 — Delete Operations

### Tasks

* Delete a user named Amit
* Delete all users younger than 18
* Delete a product

---

# 🎯 Level 6 — Interview Practice Questions

These are common MongoDB interview-style questions.

### Queries

1. Find users older than 20
2. Find products cheaper than 5000
3. Find the user named Rahul
4. Count users from Mumbai
5. Display all collections

---

# 🚀 Challenge Project — Instagram Clone

Create a mini Instagram database simulation.

## Database

```text
instagramClone
```

## Collections

```text
users
posts
```

### Practice Features

✅ User Signup

✅ Create Post

✅ Update Post Caption

✅ Delete Post

✅ Find All Posts By A User

---

# 💡 Solution

## 1️⃣ Database Setup

### Show Databases

```javascript
show dbs
```

### Create / Switch Database

```javascript
use shopApp
```

### Show Collections

```javascript
show collections
```

### Create Users Collection

```javascript
db.createCollection("users")
```

---

## 2️⃣ User System

### Insert One User

```javascript
db.users.insertOne({
  name: "Rahul",
  email: "rahul@gmail.com",
  city: "Los Angeles",
  age: 22
})
```

### Insert Another User

```javascript
db.users.insertOne({
  name: "Amit",
  email: "amit@gmail.com",
  city: "Patna",
  age: 19
})
```

### Insert Multiple Users

```javascript
db.users.insertMany([
  {
    name: "Neha",
    email: "neha@gmail.com",
    city: "Delhi",
    age: 24
  },
  {
    name: "Ravi",
    email: "ravi@gmail.com",
    city: "Los Angeles",
    age: 21
  },
  {
    name: "Priya",
    email: "priya@gmail.com",
    city: "Mumbai",
    age: 23
  }
])
```

### Find Users From Los Angeles

```javascript
db.users.find({ city: "Los Angeles" })
```

---

## 3️⃣ Product System

### Create Products Collection

```javascript
db.createCollection("products")
```

### Insert Products

```javascript
db.products.insertMany([
  {
    name: "iPhone",
    price: 80000,
    category: "electronics",
    stock: 10
  },
  {
    name: "Laptop",
    price: 60000,
    category: "electronics",
    stock: 5
  },
  {
    name: "Headphones",
    price: 2000,
    category: "electronics",
    stock: 20
  },
  {
    name: "Shoes",
    price: 3000,
    category: "fashion",
    stock: 15
  }
])
```

---

## 4️⃣ Update Operations

```javascript
db.users.updateOne(
  { name: "Rahul" },
  { $set: { city: "Mumbai" } }
)

db.products.updateOne(
  { name: "Laptop" },
  { $set: { price: 65000 } }
)

db.products.updateMany(
  {},
  { $set: { stock: 25 } }
)

db.users.updateOne(
  { name: "Neha" },
  { $set: { email: "neha123@gmail.com" } }
)
```

---

## 5️⃣ Delete Operations

```javascript
db.users.deleteOne({ name: "Amit" })

db.users.deleteMany({
  age: { $lt: 18 }
})

db.products.deleteOne({
  name: "Shoes"
})
```

---

## 6️⃣ Interview Queries

```javascript
db.users.find({
  age: { $gt: 20 }
})

db.products.find({
  price: { $lt: 5000 }
})

db.users.find({
  name: "Rahul"
})

db.users.countDocuments({
  city: "Mumbai"
})

show collections
```

---

# 🎉 Bonus Challenge

Try adding:

* User Login System
* Product Reviews
* Order Collection
* Shopping Cart Collection
* Post Comments
* Post Likes
* Followers / Following System

These features will help you understand how real-world MongoDB applications are designed.
