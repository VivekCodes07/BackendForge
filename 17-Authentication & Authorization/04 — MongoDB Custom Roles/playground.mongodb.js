/*
===============================================================================
                    PLAYGROUND - MONGODB CUSTOM ROLES
===============================================================================

Today I am practicing MongoDB Custom Roles.

What I am learning:

    db.createRole()
    db.getRole()
    db.getRoles()
    db.updateRole()
    db.dropRole()

And I am connecting all of this with:

    Users
    Roles
    Privileges
    Resources
    Actions

My mental model:

    User
      ↓
    Role
      ↓
    Privileges
      ↓
    Resource + Actions

Real-world example:

    Order Service
         ↓
    orderManager
         ↓
    shopDb.orders
         ↓
    find + insert + update

===============================================================================
*/


// ============================================================================
// 1. Create The Database We Will Use
// ============================================================================

use("shopDb");


/*
===============================================================================
I am using a separate database for this playground so that I don't accidentally
mess with my other MongoDB learning data.

My database:

    shopDb

Collections I will use:

    products
    orders
    users
    payments
===============================================================================
*/


// ============================================================================
// 2. Create Some Sample Collections / Documents
// ============================================================================

db.products.insertMany([
    {
        name: "Laptop",
        price: 75000
    },
    {
        name: "Keyboard",
        price: 2500
    },
    {
        name: "Mouse",
        price: 1200
    }
]);


db.orders.insertMany([
    {
        customer: "Vivek",
        product: "Laptop",
        amount: 75000,
        status: "placed"
    },
    {
        customer: "Alex",
        product: "Keyboard",
        amount: 2500,
        status: "shipped"
    }
]);


db.users.insertMany([
    {
        name: "Vivek",
        email: "vivek@example.com"
    },
    {
        name: "Alex",
        email: "alex@example.com"
    }
]);


/*
===============================================================================
I now have some realistic application data.

My database roughly looks like:

    shopDb
    │
    ├── products
    ├── orders
    └── users

Later I will create a custom role that only works with:

    shopDb.orders
===============================================================================
*/


// ============================================================================
// 3. Create My First Custom Role
// ============================================================================

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


/*
===============================================================================
I have now created my first custom role:

    orderManager

It can work with:

    shopDb.orders

And it can perform:

    find
    insert
    update

But I intentionally did NOT give it:

    delete

And I did NOT give it access to:

    products
    users

This is the whole point of a custom role.

I am defining exactly what the service needs.
===============================================================================
*/


// ============================================================================
// 4. Check The Custom Role
// ============================================================================

db.getRole("orderManager", {
    showPrivileges: true
});


/*
===============================================================================
showPrivileges: true

I am asking MongoDB to show me the actual privileges attached to the role.

This helps me verify that my custom role contains exactly what I intended.
===============================================================================
*/


// ============================================================================
// 5. View All Custom Roles
// ============================================================================

db.getRoles({
    showPrivileges: true
});


/*
===============================================================================
This lets me inspect the roles associated with the current database.

I can use this when I want to understand what roles exist and what privileges
they contain.
===============================================================================
*/


// ============================================================================
// 6. Create A User For My Custom Role
// ============================================================================

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


/*
===============================================================================
Now I have connected the pieces:

    orderService
         ↓
    orderManager
         ↓
    shopDb.orders
         ↓
    find + insert + update

This is the authorization model I wanted.
===============================================================================
*/


// ============================================================================
// 7. Check The User
// ============================================================================

db.getUser("orderService");


/*
===============================================================================
I can verify which role has been assigned to the user.

The important relationship is:

    USER
      ↓
    orderService

    ROLE
      ↓
    orderManager

    PERMISSIONS
      ↓
    find + insert + update

    RESOURCE
      ↓
    shopDb.orders
===============================================================================
*/


// ============================================================================
// 8. Practice The Allowed Operations
// ============================================================================

/*
IMPORTANT:

To actually test the permissions, I need to connect as the user
"orderService".

Creating the user above does NOT switch my current shell session to that user.

The commands below are examples of what orderService SHOULD be allowed to do
when authenticated with that account.
*/


// -----------------------------------------------------------------------------
// READ orders
// -----------------------------------------------------------------------------

db.orders.find();


/*
Expected:

    ALLOWED ✅

Because orderManager has:

    find

on:

    shopDb.orders
*/


// -----------------------------------------------------------------------------
// INSERT an order
// -----------------------------------------------------------------------------

db.orders.insertOne({

    customer: "John",

    product: "Mouse",

    amount: 1200,

    status: "placed"

});


/*
Expected:

    ALLOWED ✅

Because orderManager has:

    insert
*/


// -----------------------------------------------------------------------------
// UPDATE an order
// -----------------------------------------------------------------------------

db.orders.updateOne(

    {
        customer: "Vivek"
    },

    {
        $set: {
            status: "delivered"
        }
    }

);


/*
Expected:

    ALLOWED ✅

Because orderManager has:

    update
*/


// ============================================================================
// 9. The Important Test - DELETE
// ============================================================================

/*
Now I want to test something important.

Our custom role DOES NOT contain:

    delete

So if I authenticate as orderService and run:

    db.orders.deleteOne(...)

MongoDB should reject the operation.

Example:

    db.orders.deleteOne({
        customer: "Vivek"
    });

Expected:

    NOT ALLOWED ❌

This is exactly why I created a custom role instead of blindly using
readWrite.
*/


// ============================================================================
// 10. Another Important Test - Products
// ============================================================================

/*
Our role only contains:

    shopDb.orders

It does NOT contain:

    shopDb.products

So if orderService tries:

    db.products.find();

MongoDB should reject it when authenticated as orderService.

Expected:

    NOT ALLOWED ❌

This shows that I can control access at the collection level.
*/


// ============================================================================
// 11. Another Important Test - Users
// ============================================================================

/*
Same idea here.

Our role doesn't have access to:

    shopDb.users

So:

    db.users.find();

should NOT be allowed for orderService.

Expected:

    NOT ALLOWED ❌
*/


// ============================================================================
// 12. My Permission Map
// ============================================================================

/*

                    orderService
                         │
                         ▼
                   orderManager
                         │
                         ▼
                       shopDb
                         │
                         ▼
                       orders
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
            find       insert     update
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
                       ALLOWED


                    NOT INCLUDED
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
           delete     products     users
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
                     NOT ALLOWED


This is the exact permission boundary I created.
*/


// ============================================================================
// 13. Add Another Privilege To The Role
// ============================================================================

db.updateRole("orderManager", {

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
        },

        {
            resource: {
                db: "shopDb",
                collection: "products"
            },

            actions: [
                "find"
            ]
        }

    ],

    roles: []

});


/*
===============================================================================
Now I have changed the role.

Previously:

    orderManager
        ↓
    shopDb.orders
        ↓
    find + insert + update


Now:

    orderManager
        │
        ├── shopDb.orders
        │       ├── find
        │       ├── insert
        │       └── update
        │
        └── shopDb.products
                └── find


So my order service can now READ products,

but it still cannot modify products.
===============================================================================
*/


// ============================================================================
// 14. Check The Updated Role
// ============================================================================

db.getRole("orderManager", {
    showPrivileges: true
});


// ============================================================================
// 15. Create Another Custom Role - Product Viewer
// ============================================================================

db.createRole({

    role: "productViewer",

    privileges: [

        {
            resource: {
                db: "shopDb",
                collection: "products"
            },

            actions: [
                "find"
            ]
        }

    ],

    roles: []

});


/*
===============================================================================
This role has a very simple purpose:

    productViewer
          ↓
    shopDb.products
          ↓
        find

This could be useful for something like:

    Product listing service
    Read-only product dashboard
    Catalog service

===============================================================================
*/


// ============================================================================
// 16. Check productViewer
// ============================================================================

db.getRole("productViewer", {
    showPrivileges: true
});


// ============================================================================
// 17. Create A User With productViewer
// ============================================================================

db.createUser({

    user: "catalogService",

    pwd: "catalogPassword123",

    roles: [

        {
            role: "productViewer",
            db: "shopDb"
        }

    ]

});


/*
===============================================================================
Now:

    catalogService
          ↓
    productViewer
          ↓
    shopDb.products
          ↓
        find

This service only needs to read products.
===============================================================================
*/


// ============================================================================
// 18. Custom Role With A Built-In Role
// ============================================================================

/*
A custom role can also inherit another role.

For example, I can create a custom role that inherits:

    read

and then add extra privileges.

The idea is:

    Existing Role
          +
    Additional Privileges
          ↓
    Custom Role
*/


db.createRole({

    role: "extendedReader",

    privileges: [

        {
            resource: {
                db: "shopDb",
                collection: "orders"
            },

            actions: [
                "find"
            ]
        }

    ],

    roles: [

        {
            role: "read",
            db: "shopDb"
        }

    ]

});


/*
===============================================================================
IMPORTANT:

I am demonstrating role inheritance here.

Before using this pattern in a real application, I should understand exactly
what privileges the inherited role provides.

The benefit is that I don't have to recreate permissions that already exist
in a built-in role.
===============================================================================
*/


// ============================================================================
// 19. Check extendedReader
// ============================================================================

db.getRole("extendedReader", {
    showPrivileges: true
});


// ============================================================================
// 20. Update The Custom Role Again
// ============================================================================

db.updateRole("productViewer", {

    privileges: [

        {
            resource: {
                db: "shopDb",
                collection: "products"
            },

            actions: [
                "find"
            ]
        }

    ],

    roles: []

});


/*
===============================================================================
This is a simple example of updating a custom role.

I can change the privileges of a custom role when the application's
requirements change.

The users assigned to that role will then receive the updated role
permissions.
===============================================================================
*/


// ============================================================================
// 21. View Everything I Created
// ============================================================================

db.getRoles({
    showPrivileges: true
});


/*
At this point I should be able to see my custom roles:

    orderManager
    productViewer
    extendedReader

Each one has a different purpose.
*/


// ============================================================================
// 22. View The Users
// ============================================================================

db.getUsers();


/*
Users I created in this playground include:

    orderService
    catalogService

And they are connected to custom roles.
*/


// ============================================================================
// 23. Real-World Permission Design
// ============================================================================

/*

Imagine my real application:

    SHOP APP
       │
       ├── Order Service
       │       ↓
       │   orderManager
       │       ↓
       │   orders
       │       ↓
       │   find + insert + update
       │
       └── Catalog Service
               ↓
          productViewer
               ↓
            products
               ↓
              find


This is much better than:

    Every Service
          ↓
        root
          ↓
       MongoDB


I want every service to have only the permissions it actually needs.
*/


// ============================================================================
// 24. Final Revision
// ============================================================================

/*

db.createRole()
    ↓
Create a custom role


db.getRole()
    ↓
Inspect one role


db.getRoles()
    ↓
View roles


db.updateRole()
    ↓
Modify a custom role


db.dropRole()
    ↓
Delete a custom role


Custom role structure:

    role
      ↓
    privileges
      ↓
    resource + actions


Resource:

    WHERE?

Actions:

    WHAT?


Example:

    orderManager
        ↓
    shopDb.orders
        ↓
    find + insert + update


And finally:

    User
      ↓
    Custom Role
      ↓
    Exact Permissions


===============================================================================
*/


// ============================================================================
// 25. Cleanup - Run Only If I Want To Reset The Playground
// ============================================================================

/*
WARNING:

Only run this section if I want to delete the users and roles created
specifically for this playground.

DO NOT blindly run cleanup commands in a real database.
*/


// db.dropRole("orderManager");
// db.dropRole("productViewer");
// db.dropRole("extendedReader");

// db.dropUser("orderService");
// db.dropUser("catalogService");


/*
===============================================================================
My final mental model:

    Built-in Role
        ↓
    Easy + General


    Custom Role
        ↓
    Precise + Fine-Grained


    Custom Role
        ↓
    Privileges
        ↓
    Resource + Actions


The whole point:

    Don't give a service more access than it needs.

===============================================================================
*/