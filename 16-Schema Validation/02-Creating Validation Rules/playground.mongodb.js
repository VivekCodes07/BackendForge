/*
===============================================================================
                 PLAYGROUND - CREATING MY FIRST SCHEMA VALIDATION
===============================================================================

Today I learned how to create my first validated collection.

MongoDB is schema-less by default, but that doesn't mean I can't enforce rules.

Using Schema Validation, I can tell MongoDB:

"Only store documents that follow these rules."

The main building blocks are:

• validator
• $jsonSchema
• bsonType
• required
• properties

===============================================================================
*/


// ============================================================================
// 1. Create a collection with Schema Validation
// ============================================================================

db.createCollection("products", {
    validator: {
        $jsonSchema: {

            // Every document must be an object
            bsonType: "object",

            // These fields must always exist
            required: [
                "name",
                "price",
                "category"
            ],

            // Rules for individual fields
            properties: {

                name: {
                    bsonType: "string"
                },

                price: {
                    bsonType: "int"
                },

                category: {
                    bsonType: "string"
                }

            }

        }
    }
});


/*
===============================================================================
2. Insert a Valid Document
===============================================================================

Expected Result:

✅ Success

Reason:

• name exists
• price exists
• category exists

All data types are correct.
*/

db.products.insertOne({
    name: "Gaming Mouse",
    price: 2499,
    category: "Electronics"
});


/*
===============================================================================
3. Missing Required Field
===============================================================================

Expected Result:

❌ Validation Error

Reason:

category is required but missing.
*/

db.products.insertOne({
    name: "Mechanical Keyboard",
    price: 4999
});


/*
===============================================================================
4. Wrong Data Type
===============================================================================

Expected Result:

❌ Validation Error

Reason:

price should be an integer,
not a string.
*/

db.products.insertOne({
    name: "Monitor",
    price: "12000",
    category: "Electronics"
});


/*
===============================================================================
5. Multiple Validation Errors
===============================================================================

Expected Result:

❌ Validation Error

Reasons:

• price has the wrong type
• category is missing
*/

db.products.insertOne({
    name: "Gaming Chair",
    price: "8999"
});


/*
===============================================================================
6. View Stored Documents
===============================================================================

Only the valid document should exist.

The invalid documents were rejected
before reaching the collection.
*/

db.products.find();


/*
===============================================================================
Mental Model
===============================================================================

Insert Request

        │
        ▼

Collection

        │
        ▼

Validator

        │
        ▼

$jsonSchema

        │
        ▼

Does the document satisfy all rules?

      /       \
     /         \
   YES          NO
    │            │
    ▼            ▼

Store       Reject
Document    Document


The validator acts like a security guard.

Every new document must pass through it
before MongoDB stores it.
*/


/*
===============================================================================
Quick Revision
===============================================================================

validator
→ Enables validation for the collection.

$jsonSchema
→ Contains all validation rules.

bsonType
→ Checks the BSON data type.

required
→ Fields that must always exist.

properties
→ Rules for each individual field.


Biggest Takeaway:

MongoDB is still schema-less.

Schema Validation simply lets me define
what a "valid" document looks like so
bad data never enters my database.
*/