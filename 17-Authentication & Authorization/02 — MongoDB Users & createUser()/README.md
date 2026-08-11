# MongoDB Users & `createUser()`

## Why Am I Learning This?

In the previous lesson, I learned two very important concepts:

**Authentication** → Who are you?

**Authorization** → What are you allowed to do?

Now I want to actually create a user inside MongoDB.

Until now, I've mostly connected to MongoDB and directly worked with my databases.

But in a real application, I shouldn't just let anyone connect to my database.

I need to create specific MongoDB users and decide what each user is allowed to do.

That's where:

```javascript
db.createUser()
```

comes in.

---

# What Is A MongoDB User?

A MongoDB user is an account that MongoDB uses for:

* Authentication
* Authorization

For example:

```text
backendApp
analyticsUser
adminUser
```

Each user can have different permissions.

So I don't have to give everyone access to everything.

---

# MongoDB User ≠ Application User

This confused me initially, so I want to make this clear.

Suppose my application has a `users` collection:

```javascript
{
    username: "vivek",
    email: "vivek@gmail.com",
    age: 20
}
```

That's an **application user**.

It belongs to my application's data.

But this:

```javascript
db.createUser({
    user: "backendApp",
    ...
})
```

creates a **MongoDB user**.

It belongs to MongoDB's security system.

So:

```text
Application User
        ↓
My application's users collection


MongoDB User
        ↓
MongoDB Authentication & Authorization
```

They are completely different things.

---

# Where Do I Create A MongoDB User?

A MongoDB user is associated with a database.

A common place to create administrative users is:

```javascript
use("admin")
```

Then:

```javascript
db.createUser(...)
```

For example:

```javascript
use("admin");

db.createUser({
    user: "backendApp",
    pwd: "backendPassword",
    roles: []
});
```

Here, I'm creating the user in the `admin` database.

But this does **not** mean the user automatically gets access to every database.

That's an important distinction.

---

# Creating My First User

The basic syntax is:

```javascript
db.createUser({
    user: "username",
    pwd: "password",
    roles: []
});
```

For example:

```javascript
use("admin");

db.createUser({
    user: "vivek",
    pwd: "myPassword123",
    roles: []
});
```

Now MongoDB knows about a user called:

```text
vivek
```

But I haven't given this user any useful database permissions yet.

That's what `roles` are for.

---

# Understanding `user`

```javascript
user: "vivek"
```

This is simply the username.

MongoDB uses it as part of the user's identity.

When I connect later, I'll provide this username along with the password.

---

# Understanding `pwd`

```javascript
pwd: "myPassword123"
```

This is the password MongoDB uses to authenticate the user.

For learning purposes, I can write it directly like this.

But in a real application, I should never hard-code database credentials into my source code.

Instead, credentials should normally be kept securely using environment variables or a secret-management system.

---

# Understanding `roles`

This is where Authorization comes into the picture.

For example:

```javascript
roles: [
    {
        role: "read",
        db: "myDb"
    }
]
```

This means:

> This user has the `read` role on `myDb`.

So the user can read data from that database but doesn't get write permissions.

---

# Creating A Read-Only User

Imagine I have an analytics service.

It only needs to look at data.

It doesn't need to:

* Insert documents
* Update documents
* Delete documents

So giving it `readWrite` would be unnecessary.

I can create:

```javascript
use("admin");

db.createUser({
    user: "analyticsUser",
    pwd: "analyticsPassword",

    roles: [
        {
            role: "read",
            db: "myDb"
        }
    ]
});
```

Now my mental model is:

```text
analyticsUser

        ↓

Authentication

        ↓

Identity verified

        ↓

Authorization

        ↓

read on myDb

        ↓

Can read
Cannot write
```

This is a simple example of **least privilege**.

---

# Creating An Application User

Now imagine my Node.js backend needs to work with `myDb`.

It needs to:

* Read products
* Create orders
* Update orders
* Read users

So it needs both read and write access.

I can create:

```javascript
use("admin");

db.createUser({
    user: "backendApp",
    pwd: "backendPassword",

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
backendApp
      ↓
readWrite
      ↓
myDb
```

The backend can work with the application data without needing administrator-level access.

---

# Why Shouldn't My Application Use `root`?

This is something I want to remember.

I could technically give my backend a very powerful role.

But that would be a terrible security decision.

Imagine my application gets hacked.

If the attacker gets:

```text
root credentials
```

they could potentially perform extremely destructive operations.

But if the backend only has:

```text
readWrite on myDb
```

the damage is much more limited.

So I should follow:

> **Give a user only the permissions it actually needs.**

This is called the **Principle of Least Privilege**.

---

# One User Can Have Multiple Roles

A user isn't limited to one role.

For example:

```javascript
use("admin");

db.createUser({
    user: "backendApp",
    pwd: "backendPassword",

    roles: [
        {
            role: "readWrite",
            db: "myDb"
        },
        {
            role: "read",
            db: "analyticsDb"
        }
    ]
});
```

Now the same user has different permissions on different databases.

```text
myDb
→ readWrite

analyticsDb
→ read
```

So permissions are not necessarily global.

They can be associated with a particular database.

---

# Authentication + Authorization Together

Now I can finally connect everything I've learned.

Suppose I create:

```javascript
db.createUser({
    user: "backendApp",
    pwd: "backendPassword",

    roles: [
        {
            role: "readWrite",
            db: "myDb"
        }
    ]
});
```

The first part:

```javascript
user: "backendApp",
pwd: "backendPassword"
```

answers:

> **Who are you?**

That's Authentication.

The second part:

```javascript
roles: [
    {
        role: "readWrite",
        db: "myDb"
    }
]
```

answers:

> **What are you allowed to do?**

That's Authorization.

So:

```text
username + password
        ↓
Authentication
        ↓
Who are you?
        ↓
roles
        ↓
Authorization
        ↓
What can you do?
```

---

# Checking Existing Users

MongoDB provides:

```javascript
db.getUsers()
```

For example:

```javascript
use("admin");

db.getUsers();
```

This allows me to see the users associated with the current database.

---

# Checking A Specific User

If I want information about one specific user:

```javascript
db.getUser("backendApp");
```

For example:

```javascript
use("admin");

db.getUser("backendApp");
```

This is useful when I want to inspect the roles assigned to that user.

---

# A User Can Be Authenticated But Unauthorized

This is one of the most important things from this lesson.

Suppose:

```text
backendApp
```

successfully logs into MongoDB.

Authentication succeeded.

But suppose it tries to perform an operation it doesn't have permission for.

MongoDB can still reject the operation.

So:

```text
Authentication
      ↓
Successful ✅

Authorization
      ↓
Permission missing ❌

Operation
      ↓
Rejected
```

This is why:

> **Being authenticated does not mean having full access.**

---

# Real-World Example

Imagine I have three services:

```text
Application Backend
Analytics Service
Database Administrator
```

I can give them different MongoDB users.

### Backend

```text
backendApp
→ readWrite on myDb
```

### Analytics

```text
analyticsUser
→ read on myDb
```

### Database Administrator

```text
adminUser
→ administrative permissions
```

Now each service gets only the access it needs.

This is much safer than using one account everywhere.

---

# My Mental Model

Whenever I create a MongoDB user, I think about two things:

```text
WHO?
 ↓
user + password
 ↓
Authentication


WHAT CAN THEY DO?
 ↓
roles + database
 ↓
Authorization
```

So this:

```javascript
db.createUser({
    user: "backendApp",
    pwd: "backendPassword",
    roles: [
        {
            role: "readWrite",
            db: "myDb"
        }
    ]
});
```

isn't just creating an account.

I'm defining:

1. The user's identity
2. The user's permissions

---

# Quick Revision

## `db.createUser()`

Used to create a MongoDB user.

```javascript
db.createUser({
    user: "backendApp",
    pwd: "backendPassword",
    roles: [
        {
            role: "readWrite",
            db: "myDb"
        }
    ]
});
```

### `user`

Username used for authentication.

### `pwd`

Password used for authentication.

### `roles`

Defines what the user is allowed to do.

### `db`

Defines the database where the role applies.

---

# My Security Rule

I want to remember this permanently:

> **Don't give users more permissions than they need.**

If an analytics service only needs to read:

```javascript
role: "read"
```

Don't give it:

```javascript
role: "readWrite"
```

And definitely don't give it administrator-level access just because it's easier.

---

# Most Important Thing I Learned

Creating a MongoDB user isn't simply:

> "Give someone a username and password."

I'm defining two things:

```text
Identity
   +
Permissions
```

The username and password allow MongoDB to identify the user.

The roles determine what that user is allowed to do.

That's where Authentication and Authorization finally come together in MongoDB.
