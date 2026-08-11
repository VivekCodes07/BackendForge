/*
===============================================================================
                    PLAYGROUND - MONGODB BUILT-IN ROLES
===============================================================================

Today I am practicing MongoDB's built-in roles.

The main roles I am learning:

    read
    readWrite
    dbAdmin
    userAdmin
    dbOwner
    root

My mental model:

    User
      ↓
    Role
      ↓
    Permissions
      ↓
    What the user can do

IMPORTANT:
Run this on my local MongoDB / learning environment.

I am using simple passwords here only for practice.
I should NEVER use these passwords in production.

===============================================================================
*/


// ============================================================================
// 1. Switch to admin
// ============================================================================

use("admin");


// ============================================================================
// 2. Create a Read-Only User
// ============================================================================

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


/*
===============================================================================
analyticsUser

Role:
    read

Database:
    myDb

Mental model:

    analyticsUser
          ↓
        read
          ↓
        myDb

This user is meant for services that only need to read data.

Example:
    Analytics service
    Reporting service
    Read-only dashboard

It should NOT be used when the application needs to modify data.
===============================================================================
*/


// ============================================================================
// 3. Check analyticsUser
// ============================================================================

db.getUser("analyticsUser");


// ============================================================================
// 4. Create a Read + Write User
// ============================================================================

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


/*
===============================================================================
backendApp

Role:
    readWrite

Database:
    myDb

Mental model:

    backendApp
         ↓
      readWrite
         ↓
       myDb

This is the kind of access my backend might need.

It can work with application data.

For example:

    Read products
    Create orders
    Update orders
    Delete documents when required

But:

    readWrite ≠ root

It does NOT mean that this user should have unrestricted administrative
control over the entire MongoDB deployment.
===============================================================================
*/


// ============================================================================
// 5. Check backendApp
// ============================================================================

db.getUser("backendApp");


// ============================================================================
// 6. Create a Database Administration User
// ============================================================================

db.createUser({

    user: "databaseAdmin",

    pwd: "databaseAdminPassword123",

    roles: [
        {
            role: "dbAdmin",
            db: "myDb"
        }
    ]

});


/*
===============================================================================
databaseAdmin

Role:
    dbAdmin

Database:
    myDb

Mental model:

    databaseAdmin
          ↓
       dbAdmin
          ↓
        myDb

This role is focused on database administration.

It is different from readWrite.

readWrite:
    → Mainly application data access

dbAdmin:
    → Database administration tasks

I should not confuse:

    "Can modify application documents"

with:

    "Can administer the database"
===============================================================================
*/


// ============================================================================
// 7. Check databaseAdmin
// ============================================================================

db.getUser("databaseAdmin");


// ============================================================================
// 8. Create a User Administration User
// ============================================================================

db.createUser({

    user: "userManager",

    pwd: "userManagerPassword123",

    roles: [
        {
            role: "userAdmin",
            db: "myDb"
        }
    ]

});


/*
===============================================================================
userManager

Role:
    userAdmin

Database:
    myDb

Mental model:

    userManager
         ↓
      userAdmin
         ↓
    Users + Roles

This role is focused on managing users and roles.

It is NOT the same thing as:

    readWrite

The responsibility here is user/role management rather than normal
application data access.
===============================================================================
*/


// ============================================================================
// 9. Check userManager
// ============================================================================

db.getUser("userManager");


// ============================================================================
// 10. Create a Database Owner
// ============================================================================

db.createUser({

    user: "databaseOwner",

    pwd: "databaseOwnerPassword123",

    roles: [
        {
            role: "dbOwner",
            db: "myDb"
        }
    ]

});


/*
===============================================================================
databaseOwner

Role:
    dbOwner

Database:
    myDb

This is a powerful database-level role.

For my mental model, I can think:

    dbOwner
       ↓
    Broad control over myDb

Conceptually it combines capabilities related to:

    readWrite
    dbAdmin
    userAdmin

So I should only give this role when someone genuinely needs this level
of database control.
===============================================================================
*/


// ============================================================================
// 11. Check databaseOwner
// ============================================================================

db.getUser("databaseOwner");


// ============================================================================
// 12. Create a Highly Privileged User
// ============================================================================

db.createUser({

    user: "superAdmin",

    pwd: "superAdminPassword123",

    roles: [
        {
            role: "root",
            db: "admin"
        }
    ]

});


/*
===============================================================================
superAdmin

Role:
    root

Database:
    admin

This is an extremely powerful role.

My mental model:

    root
      ↓
    Very broad MongoDB administrative privileges

I should NOT give this to:

    ❌ Backend applications
    ❌ Analytics services
    ❌ Random developers
    ❌ Services that only need database data access

The more powerful the role, the greater the potential damage if the
credentials are compromised.

===============================================================================
*/


// ============================================================================
// 13. Check superAdmin
// ============================================================================

db.getUser("superAdmin");


// ============================================================================
// 14. View All Users
// ============================================================================

db.getUsers();


/*
===============================================================================
At this point I have created users with different responsibilities:

    analyticsUser
        → read

    backendApp
        → readWrite

    databaseAdmin
        → dbAdmin

    userManager
        → userAdmin

    databaseOwner
        → dbOwner

    superAdmin
        → root


This makes the difference between the roles easier to understand.
===============================================================================
*/


// ============================================================================
// 15. One User With Different Roles On Different Databases
// ============================================================================

db.createUser({

    user: "multiDbApp",

    pwd: "multiDbPassword123",

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


/*
===============================================================================
This is an important example.

The same user can have different permissions on different databases.

So:

    multiDbApp

        ↓

    myDb
        → readWrite

    analyticsDb
        → read

Mental model:

    One User
       │
       ├── myDb
       │     └── readWrite
       │
       └── analyticsDb
             └── read

This is much more flexible than giving the user the same permissions
everywhere.
===============================================================================
*/


// ============================================================================
// 16. Check multiDbApp
// ============================================================================

db.getUser("multiDbApp");


// ============================================================================
// 17. My Role Comparison
// ============================================================================

/*

    ROLE
    ─────────────────────────────────────────────────────

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
    Manage users and roles


    dbOwner
        ↓
    Broad control over one database


    root
        ↓
    Very broad administrative control


*/


// ============================================================================
// 18. Real-World Application Example
// ============================================================================

/*

Imagine I have:

                    SHOP APP
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
           Backend  Analytics   DBA
              │        │        │
              ▼        ▼        ▼
          readWrite   read    dbOwner
              │        │        │
              └────────┼────────┘
                       ▼
                    shopDb


This is much better than:

                    SHOP APP
                       │
                       ▼
                     root
                       │
                       ▼
                   Everything


Why?

Because of the Principle of Least Privilege.

Every service should get only what it actually needs.
*/


// ============================================================================
// 19. Authentication vs Authorization
// ============================================================================

/*

When backendApp connects:

    username + password
            ↓
       Authentication
            ↓
        "Who are you?"
            ↓
        backendApp
            ↓
       Check its roles
            ↓
       Authorization
            ↓
     "What can you do?"
            ↓
       readWrite
            ↓
          myDb


This is the complete mental model:

    Authentication
        → Identity

    Authorization
        → Permissions
*/


// ============================================================================
// 20. Mini Challenge
// ============================================================================

/*
I want to answer these BEFORE checking the answers.

--------------------------------------------------

1. Analytics service only needs to read myDb.

Answer:
    ______________________


2. Backend needs to read and modify application data.

Answer:
    ______________________


3. Someone needs to manage MongoDB users and roles.

Answer:
    ______________________


4. Someone needs broad control over one database.

Answer:
    ______________________


5. Should I give my backend root?

Answer:
    ______________________

--------------------------------------------------
*/


// ============================================================================
// 21. My Answers
// ============================================================================

/*

1. Analytics service
    → read


2. Backend
    → readWrite


3. User/role management
    → userAdmin


4. Broad database-level control
    → dbOwner


5. Backend gets root?
    → NO ❌


My rule:

    Give users only the permissions they actually need.

*/


// ============================================================================
// 22. Final Mental Model
// ============================================================================

/*

                         MongoDB User
                              │
                              ▼
                            Role
                              │
                              ▼
                         Permissions
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
             read         readWrite       dbAdmin
               │              │              │
               ▼              ▼              ▼
             Read       Read + Write     DB Admin


                       Other roles
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          userAdmin      dbOwner         root
              │             │             │
          Users/Roles   Broad DB      Very Broad
                         Control        Control


The main thing I want to remember:

    Role = Permission package

And:

    Least Privilege > Maximum Privilege

===============================================================================
*/