/*
===============================================================================
        PLAYGROUND - VALIDATION LEVELS & VALIDATION ACTIONS
===============================================================================

Today I learned that creating validation rules is only half the story.

I also need to decide:

1. When should MongoDB validate documents?
2. What should MongoDB do if validation fails?

MongoDB provides two settings for this:

• validationLevel
• validationAction

Think of it like this:

Validation Rules
→ What makes a document valid?

validationLevel
→ When should MongoDB check those rules?

validationAction
→ What should MongoDB do if validation fails?

===============================================================================
*/


// ============================================================================
// 1. Clean Up Previous Collection
// ============================================================================

db.products.drop();


// ============================================================================
// 2. Create Collection
//    validationLevel  -> strict
//    validationAction -> error
// ============================================================================

db.createCollection("products", {

    validator: {

        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price"
            ],

            properties: {

                name: {
                    bsonType: "string"
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
3. Valid Document

Expected Result:

✅ Insert Successful

Reason:

The document follows every validation rule.
===============================================================================
*/

db.products.insertOne({

    name: "Gaming Mouse",
    price: 2499

});


/*
===============================================================================
4. Invalid Document (validationAction = error)

Expected Result:

❌ Validation Error

Reason:

price should be an integer.
Since validationAction = "error",
MongoDB rejects the document completely.
===============================================================================
*/

db.products.insertOne({

    name: "Mechanical Keyboard",
    price: "4999"

});


/*
===============================================================================
5. View Stored Documents

Only the valid document should exist.
===============================================================================
*/

db.products.find();


/*
===============================================================================
6. Example

Changing validationAction to "warn"

NOTE:

This is only an example.

If a collection already exists,
you would normally use collMod
(which I'll learn in the next lesson).

I'm only writing this here to understand
how validationAction works.
===============================================================================

db.runCommand({

    collMod: "products",

    validationAction: "warn"

});

*/


/*
===============================================================================
After changing validationAction to "warn"

Expected Behaviour:

⚠ MongoDB logs a warning.

✅ Document is still inserted.

The insert succeeds even though
the validation rules are violated.

Example:

db.products.insertOne({

    name: "Laptop",

    price: "55000"

});

===============================================================================
*/


/*
===============================================================================
7. Example

Changing validationLevel to "moderate"

Again,

this is only for understanding.

I'll properly learn collMod
in the next lesson.

db.runCommand({

    collMod: "products",

    validationLevel: "moderate"

});

===============================================================================
*/


/*
===============================================================================
What Does "moderate" Mean?

Imagine my collection already contains
old documents that don't satisfy
the new validation rules.

Instead of immediately causing every
operation to fail,

MongoDB becomes more forgiving
towards those legacy documents.

This makes schema migration much easier
for existing production databases.
===============================================================================
*/


/*
===============================================================================
Mental Model
===============================================================================

                Insert / Update

                        │
                        ▼

              Validation Rules

                        │
                        ▼

         validationLevel decides

        "Should I validate now?"

                        │
                        ▼

            Validation Passed?

               /             \
              /               \

            YES                NO
             │                  │
             ▼                  ▼

        Store Document    validationAction decides

                           ┌───────────────┐
                           │     error     │
                           │               │
                           │ ❌ Reject      │
                           └───────────────┘

                           ┌───────────────┐
                           │     warn      │
                           │               │
                           │ ⚠ Warn Only   │
                           │ ✅ Store       │
                           └───────────────┘

===============================================================================
*/


/*
===============================================================================
Quick Revision
===============================================================================

validationLevel

strict
→ Validate documents normally.
→ Best choice for production.

moderate
→ Helpful when introducing validation
  to collections that already contain
  older invalid documents.


validationAction

error
→ Reject invalid operations.

warn
→ Allow the operation
  but log a warning.


Biggest Takeaway:

Validation Rules define
"What is valid?"

validationLevel defines
"When should validation happen?"

validationAction defines
"What should MongoDB do
if validation fails?"

Together, they control how strictly
MongoDB enforces my schema.
===============================================================================
*/