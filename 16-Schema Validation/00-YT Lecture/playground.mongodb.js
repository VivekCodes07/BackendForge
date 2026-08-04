// Switching to my database
use("myDb");

// Deleting the old collection if it already exists
db.users.drop();

// Creating the users collection with schema validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      // Every document in this collection must be an object
      bsonType: "object",

      // These fields are mandatory
      required: ["name", "age", "email", "address", "orders"],

      // Don't allow fields other than the ones defined below
      additionalProperties: false,

      // Validation rules for each field
      properties: {
        // MongoDB automatically creates this field
        _id: {
          bsonType: "objectId"
        },

        // User's name
        name: {
          bsonType: "string",
          description: "Name must be a string"
        },

        // User's age
        age: {
          bsonType: "int",
          minimum: 18,
          maximum: 100,
          description: "Age must be between 18 and 100"
        },

        // User's email
        email: {
          bsonType: "string",
          description: "Email must be a string"
        },

        // Nested object
        address: {
          bsonType: "object",

          required: ["city", "state", "pincode"],

          additionalProperties: false,

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

        // Array of order objects
        orders: {
          bsonType: "array",

          // items defines the validation rules for every element inside an array.
          // MongoDB checks each array element against these rules before storing the document.
          items: {
            bsonType: "object",

            required: [
              "product",
              "price",
              "quantity",
              "status"
            ],

            additionalProperties: false,

            properties: {
              product: {
                bsonType: "string"
              },

              // Accepts any numeric BSON type
              price: {
                bsonType: "number",
                minimum: 0
              },

              quantity: {
                bsonType: "int",
                minimum: 1
              },

              status: {
                enum: [
                  "Pending",
                  "Shipped",
                  "Delivered",
                  "Cancelled"
                ]
              }
            }
          }
        }
      }
    }
  },

  validationAction: "error"
});

// Inserting a valid document
db.users.insertOne({
  name: "Peter Parker",
  age: NumberInt(20),
  email: "peter@gmail.com",

  address: {
    city: "New York",
    state: "NY",
    pincode: NumberInt(10001)
  },

  orders: [
    {
      product: "Laptop",
      price: 85000,
      quantity: NumberInt(1),
      status: "Delivered"
    },
    {
      product: "Mouse",
      price: 799,
      quantity: NumberInt(2),
      status: "Pending"
    }
  ]
});

db.users.find()

/*
========================================
📝 My Notes
========================================

1. validator
   -> Used to validate every document before MongoDB stores it.

2. $jsonSchema
   -> Lets me define validation rules using JSON Schema.

3. bsonType
   -> Checks the actual BSON data type of a document or field.

4. required
   -> These fields must be present in every document.

5. additionalProperties
   -> false means no extra fields are allowed except the ones defined in properties.

6. properties
   -> Defines the validation rules for each field of an object.

7. items
   -> Defines the validation rules for every element inside an array.

8. minimum / maximum
   -> Restricts the minimum and maximum value allowed.

9. enum
   -> Allows only the listed values.

10. description
    -> A message that explains the validation rule if validation fails.

11. validationAction: "error"
    -> Rejects the document if it doesn't satisfy the schema.

Quick Reminder:
- properties -> Rules for fields inside an object.
- items -> Rules for elements inside an array.
- MongoDB automatically creates the _id field.
- BSON (Binary JSON) is MongoDB's internal storage format.
*/