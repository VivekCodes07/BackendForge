# MongoDB Custom Roles

## Why Am I Learning This?

In the previous lesson, I learned about MongoDB's built-in roles:

```text
read
readWrite
dbAdmin
userAdmin
dbOwner
root
```

Those roles are useful because MongoDB already gives me predefined permission packages.

But then I started thinking about a real application.

Suppose I have an order service.

It needs to:

```text
Read orders
Create orders
Update orders
```

But it should NOT be able to:

```text
Delete orders
Manage users
Administer the database
```

If I give it:

```text
readWrite
```

it gets more permissions than it actually needs.

So I asked myself:

> "Can I create my own role with exactly the permissions I want?"

Yes.

That's where **Custom Roles** come in.

---

# What Is A Custom Role?

A custom role is a role that **I create myself** instead of using one of MongoDB's predefined roles.

My mental model:

```text
MongoDB
   ↓
Built-in Roles
   ↓
General permissions
```

But:

```text
Me
 ↓
Custom Role
 ↓
Exactly the permissions I need
```

So instead of accepting a predefined permission package, I can build my own.

---

# Why Would I Need One?

Imagine my database looks like this:

```text
myDb
│
├── users
├── products
├── orders
└── payments
```

My order service only needs access to:

```text
orders
```

And it needs:

```text
find
insert
update
```

But it doesn't need:

```text
delete
```

or access to:

```text
users
payments
```

Giving it `readWrite` might be more access than necessary.

A custom role lets me define exactly what it needs.

---

# The Main Command

MongoDB provides:

```javascript
db.createRole()
```

This is the command I use to create my own role.

A simple example:

```javascript
use("myDb");

db.createRole({
    role: "orderManager",

    privileges: [
        {
            resource: {
                db: "myDb",
                collection: "orders"
            },

            actions: [
                "find",
                "insert",
                "update"
            ]
        }
    ],

    roles: []
});
```

Now I've created my own role:

```text
orderManager
```

---

# Understanding The Structure

The first part:

```javascript
role: "orderManager"
```

is simply the name of my custom role.

I can choose a meaningful name based on what the role is supposed to do.

For example:

```text
orderManager
paymentProcessor
reportViewer
productReader
```

I should avoid meaningless names because a role name should tell me what it's for.

---

# Understanding `privileges`

This is the most important part.

```javascript
privileges: [
    {
        resource: {
            db: "myDb",
            collection: "orders"
        },

        actions: [
            "find",
            "insert",
            "update"
        ]
    }
]
```

A privilege basically tells MongoDB:

```text
WHERE?
+
WHAT?
```

Where the permission applies:

```text
myDb.orders
```

And what the user can do:

```text
find
insert
update
```

So my mental model is:

```text
Privilege
    │
    ├── Resource
    │      ↓
    │    Where?
    │
    └── Actions
           ↓
         What?
```

---

# Understanding `resource`

The resource tells MongoDB where the permission applies.

For example:

```javascript
resource: {
    db: "myDb",
    collection: "orders"
}
```

means:

```text
Database:
myDb

Collection:
orders
```

So the permission is specifically associated with:

```text
myDb.orders
```

This is much more precise than simply saying:

```text
"Give access to myDb."
```

---

# Understanding `actions`

Actions tell MongoDB what operations the role can perform.

For example:

```javascript
actions: [
    "find",
    "insert",
    "update"
]
```

means the role gets those capabilities.

Notice that I didn't include:

```text
delete
```

So I haven't intentionally granted delete capability through this privilege.

That's the whole point of a custom role.

I can choose the operations individually.

---

# Creating My First Custom Role

Here's the complete example again:

```javascript
use("myDb");

db.createRole({
    role: "orderManager",

    privileges: [
        {
            resource: {
                db: "myDb",
                collection: "orders"
            },

            actions: [
                "find",
                "insert",
                "update"
            ]
        }
    ],

    roles: []
});
```

Now my custom role looks conceptually like this:

```text
orderManager
     │
     ▼
myDb.orders
     │
     ├── find
     ├── insert
     └── update
```

---

# What Is `roles: []`?

At the bottom I have:

```javascript
roles: []
```

This is for **inheriting other roles**.

Right now I'm not inheriting anything.

So:

```javascript
roles: []
```

basically means:

> "This custom role is starting with only the privileges I've defined here."

Later I can use roles here if I want my custom role to inherit permissions from another role.

---

# Assigning My Custom Role To A User

Creating a role doesn't automatically give anyone that permission.

I still need to assign the role to a user.

For example:

```javascript
use("myDb");

db.createUser({
    user: "orderService",

    pwd: "orderPassword123",

    roles: [
        {
            role: "orderManager",
            db: "myDb"
        }
    ]
});
```

Now the relationship is:

```text
orderService
      ↓
orderManager
      ↓
myDb.orders
      ↓
find
insert
update
```

This is where the role actually becomes useful.

---

# User vs Role vs Privilege

This distinction is important.

I don't want to mix these three things up.

```text
USER
 ↓
Who is connecting?


ROLE
 ↓
What permission package do they have?


PRIVILEGE
 ↓
What exact actions can that role perform?
```

For my example:

```text
orderService
      ↓
orderManager
      ↓
find + insert + update
      ↓
myDb.orders
```

So:

```text
orderService
→ User

orderManager
→ Role

find / insert / update
→ Actions inside privileges
```

---

# Real-World Example

Let's imagine I'm building an e-commerce application.

My database:

```text
shopDb
│
├── users
├── products
├── orders
└── payments
```

I have a service called:

```text
Order Service
```

It should only work with:

```text
shopDb.orders
```

It needs:

```text
find
insert
update
```

It does NOT need:

```text
delete
```

and it shouldn't have access to:

```text
shopDb.users
shopDb.payments
```

So I can create:

```javascript
use("shopDb");

db.createRole({
    role: "orderManager",

    privileges: [
        {
            resource: {
                db: "shopDb",
                collection: "orders"
            },

            actions: [
                "find",
                "insert",
                "update"
            ]
        }
    ],

    roles: []
});
```

Then:

```javascript
db.createUser({
    user: "orderService",

    pwd: "orderServicePassword",

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
Order Service
      │
      ▼
orderManager
      │
      ▼
shopDb.orders
      │
      ├── find
      ├── insert
      └── update
```

This is much more controlled than giving the service:

```text
readWrite
```

on the entire database.

---

# Custom Role vs `readWrite`

This is the comparison I really want to understand.

### Using `readWrite`

```text
orderService
      ↓
readWrite
      ↓
shopDb
```

The role is broad.

### Using a custom role

```text
orderService
      ↓
orderManager
      ↓
shopDb.orders
      ↓
find
insert
update
```

The second approach gives me much more control.

So:

> **Built-in roles are convenient. Custom roles are precise.**

---

# Custom Roles And Least Privilege

This connects directly to the previous lesson.

I learned:

> **Give users only the permissions they actually need.**

Custom roles let me take that principle further.

Instead of:

```text
User
 ↓
Lots of permissions
```

I can create:

```text
User
 ↓
Custom Role
 ↓
Only required permissions
```

For example:

```text
Payment Service
       ↓
paymentProcessor
       ↓
shopDb.payments
       ↓
find
insert
update
```

No unnecessary access.

That's exactly what I want from a security perspective.

---

# Can A Custom Role Use Other Roles?

Yes.

Remember this:

```javascript
roles: []
```

That array can contain roles that my custom role inherits from.

For example, conceptually:

```javascript
roles: [
    {
        role: "read",
        db: "shopDb"
    }
]
```

Then I can add additional privileges of my own.

So I can build a custom role from:

```text
Existing role
      +
My additional privileges
```

This is useful when a built-in role already gives me most of what I need.

---

# Built-in Roles vs Custom Roles

| Built-in Role       | Custom Role        |
| ------------------- | ------------------ |
| Provided by MongoDB | Created by me      |
| General-purpose     | Fine-grained       |
| Easy to use         | More control       |
| `read`              | `orderManager`     |
| `readWrite`         | `paymentProcessor` |
| `dbAdmin`           | `reportViewer`     |

My rule:

```text
Built-in role already fits?
        ↓
Use it.

Need something more specific?
        ↓
Create a custom role.
```

I don't need to create custom roles everywhere just to make things complicated.

---

# A Custom Role Is Not Automatically A User

This is another thing I want to remember.

If I run:

```javascript
db.createRole({
    role: "orderManager",
    ...
});
```

I have created:

```text
A ROLE
```

I have NOT created a user.

I still need:

```javascript
db.createUser(...)
```

to create a user and assign the role.

So:

```text
createRole()
    ↓
Creates permission package


createUser()
    ↓
Creates identity
```

Then:

```text
User
 ↓
Assigned Role
 ↓
Permissions
```

---

# My Mental Model

This is the complete mental model I want to keep:

```text
                    MongoDB
                       │
                       ▼
                     User
                       │
                       ▼
                     Role
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Built-in Role      Custom Role
                                  │
                                  ▼
                              Privileges
                                  │
                         ┌────────┴────────┐
                         │                 │
                         ▼                 ▼
                      Resource          Actions
                         │                 │
                         ▼                 ▼
                      Where?             What?
```

For example:

```text
orderService
      ↓
orderManager
      ↓
shopDb.orders
      ↓
find + insert + update
```

---

# Quick Revision

## `db.createRole()`

Used to create a custom role.

```javascript
db.createRole({
    role: "orderManager",

    privileges: [
        {
            resource: {
                db: "myDb",
                collection: "orders"
            },

            actions: [
                "find",
                "insert",
                "update"
            ]
        }
    ],

    roles: []
});
```

---

## `privileges`

Defines the permissions of the custom role.

```text
Privilege
    ↓
Resource + Actions
```

---

## `resource`

Defines where the permission applies.

```javascript
resource: {
    db: "myDb",
    collection: "orders"
}
```

---

## `actions`

Defines what operations the role can perform.

```javascript
actions: [
    "find",
    "insert",
    "update"
]
```

---

## `roles`

Defines roles that the custom role can inherit from.

```javascript
roles: []
```

means I'm not inheriting another role in this example.

---

# Mini Challenge

Before I move ahead, I want to test myself.

### Scenario

I have:

```text
shopDb.orders
```

My order service needs:

```text
find
insert
update
```

It should NOT have:

```text
delete
```

### Question 1

Should I blindly use:

```text
readWrite
```

or create a custom role?

```text
My answer:
________________________
```

### Question 2

What should the custom role be called?

```text
My answer:
________________________
```

### Question 3

What resource should I give it?

```text
My answer:
________________________
```

### Question 4

What actions should I give it?

```text
My answer:
________________________
```

---

# Most Important Thing I Learned

Before this lesson, I thought authorization was mainly about choosing a built-in role.

Now I understand that MongoDB can give me much more control.

I can define:

```text
WHO
 ↓
User

WHAT
 ↓
Role

WHERE
 ↓
Resource

WHAT EXACTLY
 ↓
Actions
```

So instead of giving a service more permissions than it needs:

```text
orderService
      ↓
readWrite
      ↓
entire database
```

I can create:

```text
orderService
      ↓
orderManager
      ↓
shopDb.orders
      ↓
find
insert
update
```

That's a much better way of thinking about authorization.

> **Built-in roles make things easy. Custom roles let me make permissions precise.**

And the security principle stays the same:

> **Give every user only the permissions it actually needs.**
