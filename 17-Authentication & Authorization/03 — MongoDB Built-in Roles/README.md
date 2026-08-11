# MongoDB Built-in Roles

## Why Am I Learning This?

In the previous lesson, I learned how to create MongoDB users using:

```javascript
db.createUser()
```

I also learned that a MongoDB user has two important parts:

```text
Identity
   ↓
Authentication

Permissions
   ↓
Authorization
```

But then I had a question:

> **"What permissions should I actually give to a user?"**

That's where **Roles** come in.

A role is basically a predefined package of permissions that tells MongoDB what a user is allowed to do.

---

# What Is A Role?

I like to think of a role as a **permission package**.

Instead of manually defining every operation a user can perform, MongoDB provides built-in roles that already contain a specific set of privileges.

For example:

```javascript
{
    role: "read",
    db: "myDb"
}
```

I'm basically telling MongoDB:

> "Give this user the permissions included in the `read` role on `myDb`."

So my mental model is:

```text
User
  ↓
Role
  ↓
Permissions
  ↓
What the user can do
```

---

# 1. `read`

The simplest role I can think of is:

```javascript
{
    role: "read",
    db: "myDb"
}
```

This gives the user read access to the specified database.

For example:

```javascript
use("admin");

db.createUser({
    user: "analyticsUser",
    pwd: "analyticsPassword123",

    roles: [
        {
            role: "read",
            db: "myDb"
        }
    ]
});
```

Now `analyticsUser` is meant for reading data from `myDb`.

### My mental model:

```text
read
 ↓
Read data
 ↓
No normal write access
```

---

# Real-World Example — Analytics

Imagine I have an analytics service.

It needs to generate reports from my application data.

It needs to:

* Read orders
* Read users
* Read products

But it doesn't need to:

* Create orders
* Update users
* Delete products

So giving it `readWrite` would be unnecessary.

I'd rather give it:

```text
analyticsService
        ↓
      read
        ↓
      myDb
```

This is an example of the **Principle of Least Privilege**.

---

# 2. `readWrite`

Now imagine my backend application.

It needs to:

* Read products
* Create orders
* Update user profiles
* Delete certain documents

So `read` isn't enough.

I can give it:

```javascript
{
    role: "readWrite",
    db: "myDb"
}
```

Example:

```javascript
use("admin");

db.createUser({
    user: "backendApp",
    pwd: "backendPassword123",

    roles: [
        {
            role: "readWrite",
            db: "myDb"
        }
    ]
});
```

Now:

```text
readWrite
    │
    ├── Read
    └── Write
```

This is a much more realistic role for a backend service that needs to modify application data.

---

# Important: `readWrite` ≠ Administrator

This is something I don't want to forget.

If a user has:

```text
readWrite
```

that does **not** mean:

```text
"Full control over MongoDB"
```

It mainly gives the user read/write access to data in the specified database.

Administrative privileges are a different thing.

---

# 3. `dbAdmin`

Now I'm moving from **application data access** to **database administration**.

The:

```text
dbAdmin
```

role is designed for database administration tasks.

Think about things such as:

* Database statistics
* Profiling
* Index-related administration
* Other database-management operations

My mental model:

```text
readWrite
    ↓
Work with application data

dbAdmin
    ↓
Administer the database
```

These are different responsibilities.

---

# 4. `userAdmin`

Now imagine I have someone whose job is managing MongoDB users.

They need to:

* Create users
* Modify users
* Remove users
* Manage roles

That's where:

```text
userAdmin
```

comes in.

My mental model:

```text
userAdmin
      ↓
Manage users
      ↓
Manage roles
```

Again, this doesn't simply mean:

> "This user can read and write all my application data."

User management and data access are separate responsibilities.

---

# 5. `dbOwner`

Now I get to a much more powerful database-level role:

```text
dbOwner
```

I like to think of it as having broad control over one database.

Conceptually, it combines capabilities associated with:

```text
readWrite
+
dbAdmin
+
userAdmin
```

So:

```text
dbOwner
   │
   ├── Read/write data
   ├── Database administration
   └── User administration
```

For example:

```javascript
{
    role: "dbOwner",
    db: "myDb"
}
```

This is a powerful role and should only be given to users who actually need this level of database control.

---

# 6. `root`

Now comes the role I need to treat very carefully:

```text
root
```

This is an extremely powerful administrative role.

My mental model is simply:

```text
root
  ↓
Very broad MongoDB privileges
  ↓
Administrative control
```

This is NOT something I should casually assign to my backend application.

If my backend only needs:

```text
readWrite on myDb
```

then giving it:

```text
root
```

would be completely unnecessary.

---

# Comparing The Roles

This is the simple mental model I want to remember:

| Role        | What I think of it as             |
| ----------- | --------------------------------- |
| `read`      | Read data                         |
| `readWrite` | Read + modify data                |
| `dbAdmin`   | Administer a database             |
| `userAdmin` | Manage users and roles            |
| `dbOwner`   | Broad control over one database   |
| `root`      | Very broad administrative control |

These are simplified mental models.

Each MongoDB role contains a specific set of privileges, so when working on a real production system, I should check the exact privileges required rather than assuming a role means "everything" in a category.

---

# Real-World Example

Imagine I'm building:

```text
ShopApp
```

My MongoDB database is:

```text
shopDb
```

I have three different systems.

---

## Backend API

The backend needs to:

* Read products
* Create orders
* Update orders
* Read users

So:

```text
backendApp
     ↓
readWrite
     ↓
shopDb
```

---

## Analytics Service

The analytics service only needs to:

* Read orders
* Read products
* Generate reports

So:

```text
analyticsService
        ↓
       read
        ↓
      shopDb
```

---

## Database Administrator

The DBA needs broader database-level control.

So:

```text
databaseAdmin
       ↓
    dbOwner
       ↓
     shopDb
```

Now I have:

```text
                    shopDb
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    backendApp    analyticsService  databaseAdmin
          │            │            │
      readWrite       read        dbOwner
```

This is much safer than giving every user `root`.

---

# Roles Are Database-Specific

This is another important thing I learned.

Suppose I have:

```javascript
{
    role: "readWrite",
    db: "shopDb"
}
```

I should think:

```text
readWrite
    ↓
shopDb
```

Not:

```text
readWrite
    ↓
Every database
```

I can even give the same user different roles on different databases.

For example:

```javascript
db.createUser({
    user: "backendApp",
    pwd: "backendPassword123",

    roles: [
        {
            role: "readWrite",
            db: "shopDb"
        },
        {
            role: "read",
            db: "analyticsDb"
        }
    ]
});
```

Now:

```text
shopDb
→ readWrite

analyticsDb
→ read
```

This gives me much more control.

---

# Why Least Privilege Matters

This is probably the most important security principle from this lesson.

Imagine my analytics service gets hacked.

If it has:

```text
read
```

the attacker has limited capabilities.

But if I gave the same service:

```text
root
```

the attacker could potentially have extremely broad control.

So I should always ask:

> **"What does this user actually need to do?"**

Then I give it the smallest appropriate set of permissions.

Not:

> "What's the easiest role to give?"

---

# Built-in Roles vs Custom Roles

MongoDB gives me many **built-in roles**.

The ones I'm learning now are predefined by MongoDB.

But what if none of them gives me exactly the permissions I need?

MongoDB also allows me to create **custom roles**.

For example, I could eventually create a role with only the exact privileges required by a particular service.

I'll learn that separately.

For now, I want to understand the built-in roles properly.

---

# My Mental Model

This is the model I want to remember:

```text
MongoDB User
      │
      ▼
    Role
      │
      ▼
 Permissions
      │
      ▼
What the user can do
```

And the major roles:

```text
read
 ↓
Read data


readWrite
 ↓
Read + modify data


dbAdmin
 ↓
Database administration


userAdmin
 ↓
User & role management


dbOwner
 ↓
Broad control over one database


root
 ↓
Very broad administrative control
```

---

# Quick Revision

### `read`

Used when a user only needs to read data.

```javascript
{
    role: "read",
    db: "myDb"
}
```

### `readWrite`

Used when an application needs to read and modify data.

```javascript
{
    role: "readWrite",
    db: "myDb"
}
```

### `dbAdmin`

Used for database administration.

### `userAdmin`

Used for managing users and roles.

### `dbOwner`

Provides broad database-level control.

### `root`

Provides extremely broad administrative privileges.

---

# Mini Challenge

Before I move to the next lesson, I want to test myself.

### 1. Analytics Service

It only needs to read `shopDb`.

What role should I give it?

```text
Answer: __________
```

### 2. Node.js Backend

It needs to read and modify application data in `shopDb`.

What role?

```text
Answer: __________
```

### 3. User Management

I need a user responsible for managing MongoDB users and roles.

What role?

```text
Answer: __________
```

### 4. Database Owner

I need broad control over `shopDb`.

What role would make sense?

```text
Answer: __________
```

### 5. Production Backend

Should I give my backend `root` because it's easier?

```text
Answer: __________
```

The answer to the last one should be an immediate:

```text
NO ❌
```

---

# Most Important Thing I Learned

Before this lesson, I thought:

> "A MongoDB user either has access or doesn't."

Now I understand that authorization is much more granular.

I can decide:

```text
WHO
 ↓
User

WHAT
 ↓
Role

WHERE
 ↓
Database

HOW MUCH
 ↓
Permissions
```

So instead of:

```text
Everyone → Full Access
```

I can design:

```text
Analytics → read
Backend   → readWrite
DBA       → dbOwner
Admin     → administrative privileges
```

That's what proper authorization looks like.

And the rule I want to remember is:

> **Give every user only the permissions it actually needs.**
