
// Loading variables from .env
import "dotenv/config";

// MongoDB driver
import { MongoClient } from "mongodb";


// Getting my MongoDB connection string from .env
const uri = process.env.MONGODB_URI;

// Creating the MongoDB client
const client = new MongoClient(uri);


// Connecting to MongoDB
async function connectDB() {

    try {

        await client.connect();

        console.log("Connected to MongoDB");


        // Switching to my database
        const db = client.db("shopDb");

        // Selecting the orders collection
        const orders = db.collection("orders");


        // Reading orders
        const orderList = await orders.find({}).toArray();

        console.log("\nOrders:");
        console.log(orderList);


        // Adding a new order
        const insertResult = await orders.insertOne({
            customer: "Vivek",
            product: "Keyboard",
            amount: 2500,
            status: "placed"
        });

        console.log("\nInserted order:");
        console.log(insertResult.insertedId);


        // Updating the order I just created
        const updateResult = await orders.updateOne(
            {
                _id: insertResult.insertedId
            },
            {
                $set: {
                    status: "confirmed"
                }
            }
        );

        console.log("\nUpdated documents:");
        console.log(updateResult.modifiedCount);


        /*
        I can test authorization by trying an operation
        that my MongoDB user is not allowed to perform.

        For example, if my role does not have delete permission:

        await orders.deleteOne({
            _id: insertResult.insertedId
        });

        MongoDB should reject it.
        */

    } catch (error) {

        console.error("MongoDB operation failed:");
        console.error(error);

    } finally {

        // Closing the connection when I'm done
        await client.close();

        console.log("\nMongoDB connection closed.");
    }
}


// Starting the program
connectDB();

