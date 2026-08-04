/*
===============================================================================
            PLAYGROUND - COMMON SCHEMA VALIDATION KEYWORDS
===============================================================================

Today I learned that checking only the data type isn't enough.

Example:

{
    name: "",
    price: -500
}

Technically,

✔ name is a string
✔ price is an integer

But the data is still invalid.

That's why MongoDB provides validation keywords
to validate the value itself.

Keywords covered today:

• minLength
• maxLength
• minimum
• maximum
• enum
• pattern
• description

===============================================================================
*/


// ============================================================================
// 1. Create a Collection with Validation Keywords
// ============================================================================

db.products.drop();

db.createCollection("products", {
    validator: {
        $jsonSchema: {

            bsonType: "object",

            required: [
                "name",
                "price",
                "category",
                "email"
            ],

            properties: {

                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 30,
                    description: "Product name must contain 3 to 30 characters."
                },

                price: {
                    bsonType: "int",
                    minimum: 0,
                    maximum: 100000,
                    description: "Price must be between 0 and 100000."
                },

                category: {
                    bsonType: "string",
                    enum: [
                        "Electronics",
                        "Books",
                        "Clothing"
                    ],
                    description: "Category must be one of the allowed values."
                },

                email: {
                    bsonType: "string",
                    pattern: "@",
                    description: "Email should contain '@'."
                }

            }

        }
    }
});


/*
===============================================================================
2. Valid Document
===============================================================================

Expected Result:

✅ Accepted
*/

db.products.insertOne({
    name: "Gaming Mouse",
    price: 2499,
    category: "Electronics",
    email: "vivek@gmail.com"
});


/*
===============================================================================
3. minLength Example
===============================================================================

Expected Result:

❌ Rejected

Reason:

'name' has only 2 characters.
*/

db.products.insertOne({
    name: "TV",
    price: 45000,
    category: "Electronics",
    email: "tv@gmail.com"
});


/*
===============================================================================
4. maxLength Example
===============================================================================

Expected Result:

❌ Rejected

Reason:

'name' exceeds 30 characters.
*/

db.products.insertOne({
    name: "This Product Name Is Definitely Longer Than Thirty Characters",
    price: 1500,
    category: "Electronics",
    email: "longname@gmail.com"
});


/*
===============================================================================
5. minimum Example
===============================================================================

Expected Result:

❌ Rejected

Reason:

Negative price is not allowed.
*/

db.products.insertOne({
    name: "Laptop",
    price: -1000,
    category: "Electronics",
    email: "laptop@gmail.com"
});


/*
===============================================================================
6. maximum Example
===============================================================================

Expected Result:

❌ Rejected

Reason:

Price exceeds the allowed limit.
*/

db.products.insertOne({
    name: "Luxury Car",
    price: 500000,
    category: "Electronics",
    email: "car@gmail.com"
});


/*
===============================================================================
7. enum Example
===============================================================================

Expected Result:

❌ Rejected

Reason:

Furniture isn't one of the allowed categories.
*/

db.products.insertOne({
    name: "Wooden Chair",
    price: 3000,
    category: "Furniture",
    email: "chair@gmail.com"
});


/*
===============================================================================
8. pattern Example
===============================================================================

Expected Result:

❌ Rejected

Reason:

Email doesn't contain '@'.

NOTE:

This is only a simple example.

Real applications use proper Regular Expressions.
*/

db.products.insertOne({
    name: "Keyboard",
    price: 3999,
    category: "Electronics",
    email: "keyboardgmail.com"
});


/*
===============================================================================
9. View Successfully Stored Documents
===============================================================================

Only valid documents should be present.
*/

db.products.find();


/*
===============================================================================
Mental Model
===============================================================================

Insert Request

        │
        ▼

Check Required Fields

        │
        ▼

Check Data Types

        │
        ▼

Check Validation Keywords

• minLength
• maxLength
• minimum
• maximum
• enum
• pattern

        │
        ▼

Everything Valid?

      /       \
     /         \
   YES          NO
    │            │
    ▼            ▼

Store       Reject
Document    Document


Validation happens BEFORE the document
is written to the collection.
*/


/*
===============================================================================
Quick Revision
===============================================================================

minLength
→ Minimum number of characters.

maxLength
→ Maximum number of characters.

minimum
→ Smallest allowed number.

maximum
→ Largest allowed number.

enum
→ Restricts values to a predefined list.

pattern
→ Validates the format of a string.

description
→ Human-readable explanation of the rule.


Biggest Takeaway:

Checking the data type isn't enough.

A value can have the correct type
and still be invalid.

These validation keywords help MongoDB
protect the quality of my data.
*/