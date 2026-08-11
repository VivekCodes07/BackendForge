# Why Authentication & Authorization?

## Why Am I Learning This?

So far, I've learned how to:

* Create databases and collections
* Perform CRUD operations
* Build Aggregation Pipelines
* Create Indexes
* Validate documents using Schema Validation

Everything I've learned has been about storing and managing data.

But then I asked myself:

> **"Who should be allowed to access this data?"**

That's where Authentication and Authorization come in.

A database isn't just about storing information.

It's also about protecting it.

---

# Imagine My Database Has No Security

Suppose my MongoDB database stores:

* Users
* Orders
* Products
* Payments

If there is no security,

anyone who connects could:

* Read my data
* Modify my data
* Delete my data
* Even drop the entire database

That's obviously dangerous.

A real application must know:

* Who is connecting?
* What are they allowed to do?

---

# Authentication

Authentication answers one simple question:

> **"Who are you?"**

MongoDB verifies my identity.

If my username and password are correct,

I'm authenticated.

I like to think of Authentication as an **Identity Check**.

---

# Authorization

Once MongoDB knows who I am,

it asks another question.

> **"What are you allowed to do?"**

That's Authorization.

Different users can have different permissions.

For example:

An application user might be allowed to:

* Read data
* Insert data
* Update data

But not:

* Delete databases
* Create users
* Change server settings

Authorization is simply a **Permission Check**.

---

# Real-World Example

Imagine Amazon.

Not every employee should have full access to the production database.

A customer support employee doesn't need permission to delete products.

A warehouse employee doesn't need access to customer accounts.

A database administrator may need full control.

Authentication identifies the user.

Authorization decides what that user can do.

---

# My Mental Model

Whenever I hear:

Authentication

I immediately think:

> Identity Check

Whenever I hear:

Authorization

I immediately think:

> Permission Check

Authentication always comes first.

Authorization comes after that.

---

# Thinking Like MongoDB

Whenever someone connects:

```text
Client

↓

Authentication

↓

Identity Verified?

↓

Authorization

↓

Permission Granted?

↓

Execute Command
```

MongoDB first verifies the user's identity.

Only then does it check whether that user has permission to perform the requested operation.

---

# Quick Revision

Authentication

* Confirms who the user is.

Authorization

* Decides what the user is allowed to do.

Authentication happens first.

Authorization happens after successful authentication.

Both are essential for protecting a MongoDB database.

---

# Most Important Thing I Learned

Authentication and Authorization solve two different problems.

Authentication proves my identity.

Authorization controls my permissions.

Together, they make sure that only the right people can perform the right actions on the database.
