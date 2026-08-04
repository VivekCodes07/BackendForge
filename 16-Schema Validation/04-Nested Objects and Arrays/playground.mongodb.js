/*
===============================================================================
        PLAYGROUND - SCHEMA VALIDATION (NESTED OBJECTS & ARRAYS)
===============================================================================

Today I learned that real-world MongoDB documents are rarely flat.

Instead of storing only simple fields like:

{
    name: "Vivek",
    age: 20
}

Applications usually store nested objects and arrays.

Examples:

Amazon
→ Address
→ Specifications
→ Tags

Udemy
→ Technologies
→ Requirements

Instagram
→ Profile
→ Interests

MongoDB lets me validate these nested structures too.

New concepts:

• bsonType: "object"
• bsonType: "array"
• items

===============================================================================
*/


// ============================================================================
// 1. Clean Up Previous Collection
// ============================================================================

db.users.drop();


// ============================================================================
// 2. Create Collection With Nested Validation
// ============================================================================

db.createCollection("users", {
    validator: {
        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "address",
                "skills"
            ],

            properties: {

                // ------------------------------------------------------------
                // Name
                // ------------------------------------------------------------

                name: {
                    bsonType: "string",
                    minLength: 3
                },

                // ------------------------------------------------------------
                // Nested Object Validation
                // ------------------------------------------------------------

                address: {

                    bsonType: "object",

                    required: [
                        "city",
                        "state",
                        "pincode"
                    ],

                    properties: {

                        city: {
                            bsonType: "string"
                        },

                        state: {
                            bsonType: "string"
                        },

                        pincode: {
                            bsonType: "int"
                        }

                    }

                },

                // ------------------------------------------------------------
                // Array Validation
                // ------------------------------------------------------------

                skills: {

                    bsonType: "array",

                    items: {
                        bsonType: "string"
                    }

                }

            }

        }
    }
});


/*
===============================================================================
3. Valid Document

Expected Result:

✅ Accepted

Everything follows the validation rules.
===============================================================================
*/

db.users.insertOne({

    name: "Vivek",

    address: {
        city: "Mohali",
        state: "Punjab",
        pincode: 140307
    },

    skills: [
        "Java",
        "MongoDB",
        "Node.js"
    ]

});


/*
===============================================================================
4. Missing Field Inside Nested Object

Expected Result:

❌ Rejected

Reason:

'pincode' is required inside the address object.
===============================================================================
*/

db.users.insertOne({

    name: "Rahul",

    address: {
        city: "Delhi",
        state: "Delhi"
    },

    skills: [
        "Java"
    ]

});


/*
===============================================================================
5. Wrong Data Type Inside Nested Object

Expected Result:

❌ Rejected

Reason:

pincode should be an integer.
===============================================================================
*/

db.users.insertOne({

    name: "Alex",

    address: {
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
    },

    skills: [
        "React"
    ]

});


/*
===============================================================================
6. Wrong Data Type Inside Array

Expected Result:

❌ Rejected

Reason:

Every element inside 'skills'
must be a string.
===============================================================================
*/

db.users.insertOne({

    name: "Emma",

    address: {
        city: "London",
        state: "England",
        pincode: 123456
    },

    skills: [
        "Java",
        100,
        true
    ]

});


/*
===============================================================================
7. Array Is Missing

Expected Result:

❌ Rejected

Reason:

'skills' is a required field.
===============================================================================
*/

db.users.insertOne({

    name: "Chris",

    address: {
        city: "Sydney",
        state: "NSW",
        pincode: 987654
    }

});


/*
===============================================================================
8. Nested Object Has Wrong Type

Expected Result:

❌ Rejected

Reason:

address should be an object,
not a string.
===============================================================================
*/

db.users.insertOne({

    name: "Robert",

    address: "Mohali",

    skills: [
        "MongoDB"
    ]

});


/*
===============================================================================
9. View Stored Documents

Only valid documents should exist.

All invalid documents were rejected
before reaching the collection.
===============================================================================
*/

db.users.find();


/*
===============================================================================
Mental Model
===============================================================================

Insert Request

        │
        ▼

Validate Root Document

        │
        ▼

Validate name

        │
        ▼

Validate address

        │
        ├── city
        ├── state
        └── pincode

        ▼

Validate skills

        │
        ├── Java
        ├── MongoDB
        └── Node.js

        ▼

Everything Valid?

      /       \
     /         \
   YES          NO
    │            │
    ▼            ▼

Store       Reject
Document    Document


MongoDB recursively validates every
nested object and every array element.

It doesn't stop at the first level.
*/


/*
===============================================================================
Quick Revision
===============================================================================

bsonType: "object"

→ This field stores another document.


properties

→ Rules for fields inside the nested object.


required

→ Required fields inside that nested object.


bsonType: "array"

→ This field stores multiple values.


items

→ Rules for every element inside the array.


Biggest Takeaway:

Schema Validation isn't limited to
top-level fields.

MongoDB can validate deeply nested
objects and every item inside an array,
making it powerful enough for
real-world applications.
===============================================================================
*/