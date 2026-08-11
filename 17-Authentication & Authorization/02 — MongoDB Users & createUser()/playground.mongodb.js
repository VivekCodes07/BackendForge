/*
===============================================================================
                PLAYGROUND - MONGODB USERS & createUser()
===============================================================================

Today I am practicing how MongoDB users work.

I learned:

    Authentication
    → Who are you?

    Authorization
    → What are you allowed to do?

The main command I am practicing today is:

    db.createUser()

I am also practicing:

    db.getUsers()
    db.getUser()

IMPORTANT:
Run this playground on a LOCAL MongoDB instance or a dedicated
learning environment.

Do NOT use these example passwords in a real production database.

===============================================================================
*/


// ============================================================================
// 1. Switch to the admin database
// ============================================================================

use("admin");


/*
===============================================================================
I am using the admin database because it is commonly used for creating
MongoDB users that need access to other databases.

IMPORTANT:

The database where I CREATE the user and the database where the user's
ROLE applies can be different.

For example:

    User created in → admin

    Role applies to → myDb

I will practice this below.
===============================================================================
*/


// ============================================================================
// 2. Create a Basic User Without Any Useful Role
// ============================================================================

db.createUser({

    user: "basicUser",

    pwd: "basicPassword123",

    roles: []

});


/*
===============================================================================
I have created the user.

But I gave it:

    roles: []

So the user exists, but I haven't given it any database permissions.

This helps me understand:

    Creating a user
            ≠
    Giving the user access to everything

Authentication and Authorization are separate concepts.
===============================================================================
*/


// ============================================================================
// 3. Check All Users
// ============================================================================

db.getUsers();


/*
===============================================================================
This lets me see the users associated with the current database.

Since I am currently using:

    admin

I am checking users associated with the admin database.
===============================================================================
*/


// ============================================================================
// 4. Check One Specific User
// ============================================================================

db.getUser("basicUser");


/*
===============================================================================
Instead of checking every user, I can inspect one specific user.

This becomes useful when I want to verify:

    • Username
    • Roles
    • Database associated with the user
===============================================================================
*/


// ============================================================================
// 5. Create a Read-Only User
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
Now things get interesting.

analyticsUser can:

    ✅ Read data from myDb

But should NOT have:

    ❌ Write access
    ❌ Update access
    ❌ Delete access

This is a good example of the Principle of Least Privilege.

The analytics service only needs to read data,

so I give it only the "read" role.
===============================================================================
*/


// ============================================================================
// 6. Check analyticsUser
// ============================================================================

db.getUser("analyticsUser");


// ============================================================================
// 7. Create an Application User
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
This is closer to what I might use for a Node.js backend.

The backend application needs to:

    • Read data
    • Insert data
    • Update data
    • Delete data when necessary

So I give it:

    readWrite

on:

    myDb

I am NOT giving it administrative/root access.

That's important because my application should only have the permissions
it actually needs.
===============================================================================
*/


// ============================================================================
// 8. Check backendApp
// ============================================================================

db.getUser("backendApp");


// ============================================================================
// 9. Create a User With Multiple Roles
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
Now this user has different permissions on different databases.

    myDb
    ↓
    readWrite


    analyticsDb
    ↓
    read

So the same user doesn't have to have the same permission everywhere.

This is one of the things I want to remember:

    Permissions can be different for different databases.
===============================================================================
*/


// ============================================================================
// 10. Check multiDbApp
// ============================================================================

db.getUser("multiDbApp");


// ============================================================================
// 11. View All Users Again
// ============================================================================

db.getUsers();


/*
===============================================================================
At this point I should have users similar to:

    basicUser
    analyticsUser
    backendApp
    multiDbApp

Each one has a different purpose and different permissions.

This is exactly what I want in a real application.

Instead of:

    ONE USER → EVERYTHING

I can have:

    Backend       → readWrite
    Analytics     → read
    Admin         → administrative permissions

===============================================================================
*/


// ============================================================================
// 12. Authentication vs Authorization Mental Model
// ============================================================================

/*

    backendApp
         │
         ▼
    Username + Password
         │
         ▼
    Authentication
         │
         │
         ▼
    "Who are you?"
         │
         ▼
    backendApp
         │
         ▼
    Check Roles
         │
         ▼
    Authorization
         │
         │
         ▼
    "What can you do?"
         │
         ▼
    readWrite on myDb


*/


// ============================================================================
// 13. Practice: Think About Permissions
// ============================================================================

/*
Imagine I have these services:

    1. Backend API
    2. Analytics Service
    3. Database Administrator


What permissions should I give them?


Backend API
    → Probably readWrite on myDb


Analytics Service
    → Probably read on myDb


Database Administrator
    → Administrative permissions


The important part is:

    DON'T automatically give everyone root access.


I should always ask:

    "What does this user actually need to do?"
*/


// ============================================================================
// 14. Final Revision
// ============================================================================

/*
createUser()
    → Creates a MongoDB user.


user
    → Identifies the user.


pwd
    → Password used during authentication.


roles
    → Defines what the user is allowed to do.


read
    → Read-only access.


readWrite
    → Read + write access.


getUsers()
    → View users associated with the current database.


getUser("username")
    → Inspect one specific user.


IMPORTANT:

Authentication
    → Who are you?


Authorization
    → What are you allowed to do?


Security principle:

    Give users only the permissions they actually need.

===============================================================================
*/


// ============================================================================
// 15. My Final Mental Model
// ============================================================================

/*

                MongoDB User
                     │
             ┌───────┴───────┐
             │               │
          Identity        Permissions
             │               │
             ▼               ▼
        user + pwd         roles
             │               │
             ▼               ▼
      Authentication    Authorization
             │               │
             └───────┬───────┘
                     │
                     ▼
              Access MongoDB


This is the mental model I want to remember from this lesson.

===============================================================================
*/