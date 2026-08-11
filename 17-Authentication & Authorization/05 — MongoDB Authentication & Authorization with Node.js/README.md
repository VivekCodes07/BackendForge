# MongoDB Authentication With Node.js

## Why Am I Learning This?

I've already learned how MongoDB authentication and authorization work.

I know about:

```text
Users
Roles
Built-in Roles
Custom Roles
Privileges
Permissions
```

But there was still one important question in my mind:

> "Okay, but how does my Node.js backend actually connect to MongoDB using these permissions?"

Because in a real application, I won't manually open MongoDB Compass and perform every operation.

My backend will do it.

Something like:

```text
Node.js / Express
       ↓
    MongoDB
       ↓
  Authenticate
       ↓
 Check User's Role
       ↓
 Allow / Deny Operation
```

So this lesson is about connecting what I've learned about MongoDB security with my actual backend.

---

# The Big Picture

Let's say I have an application:

```text
My E-Commerce App
       │
       ▼
Node.js + Express
       │
       ▼
MongoDB
```

My Node.js backend needs to connect to MongoDB.

MongoDB shouldn't simply trust every connection.

So I create a MongoDB user:

```text
backendApp
```

and give it a role:

```text
readWrite
```

Now the relationship becomes:

```text
Node.js
   ↓
backendApp
   ↓
readWrite
   ↓
shopDb
```

This means my backend can perform the operations allowed by that role.

---

# Authentication vs Authorization

This was one of the most important things I learned.

These two words sound similar, but they answer different questions.

## Authentication

Authentication asks:

> **"Who are you?"**

For example:

```text
username:
backendApp

password:
********
```

MongoDB checks the credentials.

If they're correct:

```text
Authentication
      ↓
    SUCCESS
```

---

## Authorization

After MongoDB knows who I am, it asks:

> **"What are you allowed to do?"**

For example:

```text
backendApp
     ↓
readWrite
     ↓
shopDb
```

Now MongoDB knows what operations this user is allowed to perform.

So:

```text
Authentication
    ↓
Who are you?

Authorization
    ↓
What can you do?
```

I want to remember this forever.

> **Authentication = Identity**

> **Authorization = Permissions**

---

# There Are Actually Two Authentication Layers

This confused me initially.

Suppose I build an e-commerce application.

A customer logs into my website:

```text
Vivek
   ↓
email + password
   ↓
Node.js / Express
```

That's **my application's authentication**.

But then my Node.js server needs to connect to MongoDB:

```text
Node.js
   ↓
MongoDB username + password
   ↓
MongoDB
```

That's **MongoDB authentication**.

These are different.

My mental model:

```text
                MY APPLICATION
                     │
                     ▼
              Application Login
                     │
                     ▼
              Node.js / Express
                     │
                     ▼
              MongoDB Connection
                     │
                     ▼
             MongoDB Authentication
                     │
                     ▼
              MongoDB Authorization
```

A user logging into my website does NOT automatically mean MongoDB knows who that user is.

---

# Creating A MongoDB Application User

For my backend, I don't want to use:

```text
root
```

That's way too powerful.

Instead, I create a dedicated application user.

For example:

```javascript
use("admin");

db.createUser({
    user: "backendApp",

    pwd: "backendPassword123",

    roles: [
        {
            role: "readWrite",
            db: "shopDb"
        }
    ]
});
```

Now I have:

```text
User:
backendApp

Role:
readWrite

Database:
shopDb
```

My mental model:

```text
backendApp
     │
     ▼
 readWrite
     │
     ▼
  shopDb
```

This is the account my backend can use.

---

# Why Should My Backend Have Its Own User?

I could technically use an admin account.

But that's a terrible idea.

Imagine:

```text
Node.js
   ↓
root
   ↓
MongoDB
```

If my application's credentials are leaked, an attacker potentially gets extremely powerful database access.

Instead:

```text
Node.js
   ↓
backendApp
   ↓
readWrite
   ↓
shopDb
```

Now the application's permissions are limited.

This follows the principle I've already learned:

> **Least Privilege**

Give my backend only the access it actually needs.

---

# My MongoDB Connection String

Now comes the part I'll actually see in Node.js.

A MongoDB connection string can look something like:

```text
mongodb://backendApp:backendPassword123@localhost:27017/shopDb?authSource=admin
```

Let's break it down.

```text
mongodb://
```

This tells the driver:

> "I'm connecting using MongoDB's connection protocol."

---

Then:

```text
backendApp
```

is my MongoDB username.

---

Then:

```text
:
```

separates the username and password.

---

Then:

```text
backendPassword123
```

is the MongoDB user's password.

---

Then:

```text
@
```

separates the credentials from the server address.

---

Then:

```text
localhost:27017
```

means:

```text
Host:
localhost

Port:
27017
```

---

Then:

```text
/shopDb
```

is the database my application is going to work with.

---

And finally:

```text
?authSource=admin
```

tells MongoDB where the credentials should be authenticated.

This last part is VERY important.

---

# What Is `authSource`?

This confused me at first.

Suppose I created the user using:

```javascript
use("admin");

db.createUser({
    user: "backendApp",
    pwd: "backendPassword123",

    roles: [
        {
            role: "readWrite",
            db: "shopDb"
        }
    ]
});
```

Notice something:

The user was created in:

```text
admin
```

but the user has permissions on:

```text
shopDb
```

These are two different things.

```text
User lives in:
admin

Permissions apply to:
shopDb
```

So my connection string needs to tell MongoDB:

```text
authSource=admin
```

My mental model:

```text
                 backendApp
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    Authentication          Permissions
          │                     │
          ▼                     ▼
        admin                 shopDb
```

This distinction is extremely important.

---

# Connecting From Node.js

Now I can use the MongoDB Node.js driver.

First:

```bash
npm install mongodb
```

Then:

```javascript
import { MongoClient } from "mongodb";

const uri =
    "mongodb://backendApp:backendPassword123@localhost:27017/shopDb?authSource=admin";

const client = new MongoClient(uri);

async function connectDB() {

    try {

        await client.connect();

        console.log("Connected to MongoDB");

        const db = client.db("shopDb");

        const orders = db.collection("orders");

        const result = await orders.find().toArray();

        console.log(result);

    } catch (error) {

        console.error("MongoDB connection failed:", error);

    }

}

connectDB();
```

Now the flow is:

```text
Node.js
   ↓
MongoClient
   ↓
Connection String
   ↓
backendApp
   ↓
MongoDB Authentication
   ↓
readWrite Role
   ↓
shopDb
   ↓
orders collection
```

---

# What Actually Happens During Connection?

When I run:

```javascript
await client.connect();
```

a lot is happening behind the scenes.

Conceptually:

```text
Node.js
   │
   │ username + password
   ▼
MongoDB Server
   │
   ▼
"Who are you?"
   │
   ▼
backendApp
   │
   ▼
MongoDB checks credentials
   │
   ▼
Authentication successful
   │
   ▼
MongoDB checks roles
   │
   ▼
readWrite on shopDb
   │
   ▼
Connection allowed
```

Now my backend can perform operations according to its permissions.

---

# Testing The Permission

Suppose my backend runs:

```javascript
const orders = db.collection("orders");

await orders.find({}).toArray();
```

MongoDB checks:

```text
Who?

backendApp
```

Then:

```text
What role?

readWrite
```

Then:

```text
What database?

shopDb
```

Then MongoDB decides:

```text
Is this operation allowed?

YES ✅
```

---

# What If The User Doesn't Have Permission?

Suppose I create another user:

```text
analyticsApp
```

and give it only:

```text
read
```

Then:

```text
analyticsApp
     ↓
   read
     ↓
  shopDb
```

This user can read data.

But if my backend tries to insert:

```javascript
await orders.insertOne({
    customer: "Vivek",
    amount: 5000
});
```

MongoDB checks the permissions.

The user doesn't have the required write permission.

So:

```text
Operation
   ↓
Permission Check
   ↓
Not Allowed
   ↓
MongoDB rejects it ❌
```

That's authorization in action.

---

# This Is Why Roles Matter

Without roles, I would have no fine-grained control.

With roles:

```text
backendApp
    ↓
readWrite
    ↓
shopDb
```

and:

```text
analyticsApp
    ↓
read
    ↓
shopDb
```

I can give different services different capabilities.

For example:

```text
Backend API
→ readWrite

Analytics service
→ read

Backup service
→ specific backup permissions

Admin
→ administrative role
```

Each service gets what it actually needs.

---

# Using A Custom Role

This is where my previous lesson connects directly.

Suppose I created:

```text
orderManager
```

with:

```text
shopDb.orders
    ↓
find
insert
update
```

Now I can give that role to my backend user.

```javascript
use("admin");

db.createUser({
    user: "orderService",
    pwd: "orderServicePassword123",

    roles: [
        {
            role: "orderManager",
            db: "shopDb"
        }
    ]
});
```

Now:

```text
Node.js
   ↓
orderService
   ↓
orderManager
   ↓
shopDb.orders
   ↓
find + insert + update
```

This is much more realistic for a production backend.

---

# Why I Should Never Hardcode Credentials

For learning, I might write:

```javascript
const uri =
    "mongodb://backendApp:backendPassword123@localhost:27017/shopDb";
```

But I should NOT do this in a real project.

Why?

Because my password would literally be sitting inside my source code.

If I push that code to GitHub:

```text
GitHub
   ↓
MongoDB password exposed
   ↓
Very bad day 💀
```

Instead, I should use environment variables.

---

# Using Environment Variables

I can create a `.env` file:

```env
MONGODB_URI=mongodb://backendApp:backendPassword123@localhost:27017/shopDb?authSource=admin
```

Then in Node.js:

```javascript
import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();

console.log("Connected to MongoDB");
```

Now my credentials aren't directly written into my JavaScript file.

---

# `.gitignore`

I also need to make sure `.env` isn't committed.

My `.gitignore` should contain:

```gitignore
.env
```

So:

```text
.env
   ↓
Contains secrets
   ↓
.gitignore
   ↓
Git doesn't track it
```

This is a basic but very important backend security habit.

---

# What About MongoDB Atlas?

The same idea applies when I'm using MongoDB Atlas.

Instead of:

```text
localhost:27017
```

I'll have an Atlas connection string.

Conceptually:

```text
Node.js
   ↓
MongoDB Atlas
   ↓
MongoDB User
   ↓
Role
   ↓
Permissions
```

My application still authenticates with a MongoDB user.

The main difference is that the database is hosted remotely instead of locally.

---

# MongoDB Authentication Is Not JWT Authentication

This is another distinction I don't want to forget.

If I later build:

```text
React
   ↓
Express
   ↓
MongoDB
```

I might use:

```text
JWT
```

for application users.

That does NOT replace MongoDB authentication.

I can have:

```text
Frontend User
    ↓
JWT
    ↓
Express
    ↓
MongoDB Driver
    ↓
MongoDB User Authentication
```

There are two separate security layers.

---

# My Complete Backend Mental Model

This is the most important diagram from this lesson:

```text
                    CLIENT
                      │
                      ▼
                React / Browser
                      │
                      │ Login
                      ▼
                Node.js / Express
                      │
                      │ Application Authentication
                      ▼
                 JWT / Session
                      │
                      ▼
                Protected API
                      │
                      │ MongoDB Connection
                      ▼
                MongoDB Driver
                      │
                      │ MongoDB Credentials
                      ▼
               MongoDB Server
                      │
                      ▼
               Authentication
                      │
                      ▼
                    User
                      │
                      ▼
                    Role
                      │
                      ▼
                Authorization
                      │
                      ▼
               Allowed / Denied
```

This makes the whole system much easier for me to understand.

---

# A Real-World Example

Imagine I have an e-commerce backend.

```text
                    E-Commerce App
                           │
                           ▼
                     Express API
                           │
                           ▼
                     orderService
                           │
                           ▼
                      orderManager
                           │
                           ▼
                     shopDb.orders
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
               find      insert    update
```

The frontend user might be:

```text
Vivek
```

But MongoDB doesn't need to know that the customer is Vivek.

MongoDB only needs to authenticate my backend as:

```text
orderService
```

Then MongoDB checks what `orderService` is allowed to do.

This separation makes the architecture much clearer.

---

# Common Mistakes I Want To Avoid

## 1. Using `root` for the backend

Bad:

```text
Node.js
   ↓
root
```

Better:

```text
Node.js
   ↓
backendApp
   ↓
required role
```

---

## 2. Hardcoding the password

Bad:

```javascript
const uri = "mongodb://user:password@localhost...";
```

Better:

```javascript
const uri = process.env.MONGODB_URI;
```

---

## 3. Forgetting `authSource`

If the MongoDB user was created in `admin` but I'm connecting to another database, I may need:

```text
authSource=admin
```

I need to understand **where the user is authenticated** separately from **which database the role grants access to**.

---

## 4. Giving every service `readWrite`

I don't want:

```text
Every service
     ↓
readWrite
```

if a service only needs:

```text
read
```

Use the smallest appropriate permission.

---

## 5. Confusing application users with MongoDB users

These are different:

```text
Application User
→ My website's user

MongoDB User
→ Database connection identity
```

I shouldn't mix them together.

---

# Quick Revision

### Authentication

```text
Who are you?
```

### Authorization

```text
What are you allowed to do?
```

### MongoDB User

```text
Identity used to connect to MongoDB
```

### Role

```text
Permission package assigned to a user
```

### `authSource`

```text
Database where MongoDB authenticates the user
```

### Environment Variable

```text
Safer place to keep connection credentials
```

### Least Privilege

```text
Give the backend only the permissions it actually needs.
```

---

# My Final Mental Model

When my Node.js backend connects to MongoDB, I should think:

```text
Node.js
   ↓
MongoClient
   ↓
MONGODB_URI
   ↓
MongoDB Username + Password
   ↓
Authentication
   ↓
MongoDB User
   ↓
Role
   ↓
Authorization
   ↓
Allowed / Denied
```

And the most important real-world architecture is:

```text
Application User
       ↓
   Express API
       ↓
MongoDB Application User
       ↓
      Role
       ↓
 Required Permissions
```

---

# What I Learned

Before this lesson, I understood MongoDB authentication and authorization separately.

Now I understand how they actually fit into my backend.

My Node.js application doesn't just "connect to MongoDB."

It connects **as a specific MongoDB user**.

That user has a specific role.

That role determines what the backend is allowed to do.

So the complete chain is:

```text
Node.js
   ↓
MongoDB User
   ↓
Role
   ↓
Permissions
   ↓
Database Operation
```

And my biggest takeaway is:

> **My backend should never have more database permissions than it actually needs.**

That's how authentication and authorization become an actual security system instead of just MongoDB commands.
