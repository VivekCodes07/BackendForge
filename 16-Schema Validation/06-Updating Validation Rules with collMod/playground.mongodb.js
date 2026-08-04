/*
===============================================================================
           PLAYGROUND - UPDATING SCHEMA VALIDATION USING collMod
===============================================================================

Today I learned that Schema Validation isn't limited to creating
new collections.

If a collection already exists, I don't need to delete it
and create it again.

Instead, MongoDB provides:

    collMod  (Collection Modify)

It allows me to update:

• validator
• validationLevel
• validationAction

without affecting the existing documents.

Think of it like this:

createCollection()
→ Build a new house.

collMod
→ Renovate the existing house.

===============================================================================
*/


// ============================================================================
// 1. Clean Up
// ============================================================================

db.products.drop();


// ============================================================================
// 2. Create Collection WITHOUT Validation
// ============================================================================

db.createCollection("products");


/*
===============================================================================
At this point...

There are NO validation rules.

MongoDB accepts almost anything.
===============================================================================
*/


db.products.insertOne({

    name: "Gaming Mouse",
    price: "2499"

});


db.products.find();


/*
===============================================================================
3. Add Schema Validation Using collMod

Instead of recreating the collection,

I simply modify its configuration.
===============================================================================
*/

db.runCommand({

    collMod: "products",

    validator: {

        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price"
            ],

            properties: {

                name: {
                    bsonType: "string",
                    minLength: 3
                },

                price: {
                    bsonType: "int",
                    minimum: 0
                }

            }

        }

    },

    validationLevel: "strict",

    validationAction: "error"

});


/*
===============================================================================
4. Insert Valid Document

Expected Result:

✅ Insert Successful
===============================================================================
*/

db.products.insertOne({

    name: "Mechanical Keyboard",
    price: NumberInt(4999)

});


/*
===============================================================================
5. Insert Invalid Document

Expected Result:

❌ Validation Error

Reason:

price should be an integer.
===============================================================================
*/

db.products.insertOne({

    name: "Gaming Headset",
    price: "6999"

});


/*
===============================================================================
6. Update validationAction

Change:

error

↓

warn

Now MongoDB logs a warning
instead of rejecting invalid documents.
===============================================================================
*/

db.runCommand({

    collMod: "products",

    validationAction: "warn"

});


/*
===============================================================================
Example

This document violates validation.

With validationAction = "warn"

Expected Result:

⚠ Warning
✅ Document Still Gets Inserted
===============================================================================
*/

db.products.insertOne({

    name: "Gaming Chair",
    price: "8999"

});


/*
===============================================================================
7. Update validationLevel

Change:

strict

↓

moderate

Useful when working with older collections
that already contain invalid documents.
===============================================================================
*/

db.runCommand({

    collMod: "products",

    validationLevel: "moderate"

});


/*
===============================================================================
8. Update Everything Together

This is how most production applications
update Schema Validation.
===============================================================================
*/

db.runCommand({

    collMod: "products",

    validator: {

        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price",
                "category"
            ],

            properties: {

                name: {
                    bsonType: "string",
                    minLength: 3
                },

                price: {
                    bsonType: "int",
                    minimum: 0
                },

                category: {
                    bsonType: "string",
                    enum: [
                        "Electronics",
                        "Books",
                        "Clothing"
                    ]
                }

            }

        }

    },

    validationLevel: "strict",

    validationAction: "error"

});


/*
===============================================================================
9. Test Updated Validation

Expected Result:

❌ Validation Error

Reason:

category is now required.
===============================================================================
*/

db.products.insertOne({

    name: "Laptop",
    price: NumberInt(75000)

});


/*
===============================================================================
10. Valid Document After Schema Update

Expected Result:

✅ Insert Successful
===============================================================================
*/

db.products.insertOne({

    name: "Laptop",

    price: NumberInt(75000),

    category: "Electronics"

});


/*
===============================================================================
11. View Collection
===============================================================================
*/

db.products.find();


/*
===============================================================================
Mental Model
===============================================================================

Collection Already Exists

        │
        ▼

db.runCommand()

        │
        ▼

collMod

        │
        ▼

Update Collection Configuration

        │
        ├── validator
        ├── validationLevel
        └── validationAction

        │
        ▼

Keep Existing Documents

        │
        ▼

Apply New Rules To Future Operations


Notice:

✔ Collection stays.
✔ Existing documents stay.
✔ Only validation settings change.

===============================================================================
*/


/*
===============================================================================
Quick Revision
===============================================================================

createCollection()

→ Creates a brand-new collection.


collMod

→ Modifies an existing collection.


collMod can update:

• validator
• validationLevel
• validationAction


Existing documents are NOT deleted.

The collection is NOT recreated.

Only the validation configuration changes.


Biggest Takeaway:

When a collection already exists,

I don't recreate it just to change
Schema Validation.

I simply use collMod to update
its validation rules and settings.

That's how real production databases
evolve over time.

===============================================================================
*/