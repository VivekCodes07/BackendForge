import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

// MongoDB Atlas connection string
// Isme username, password, cluster info sab hota hai jo DB se connect karne ke liye zaroori hai
const MONGO_URI =
  "mongodb://kumarvivek76923_db_user:CmBdrkErTLcxgkNv@ac-xdjyyor-shard-00-00.a6iqrjd.mongodb.net:27017,ac-xdjyyor-shard-00-01.a6iqrjd.mongodb.net:27017,ac-xdjyyor-shard-00-02.a6iqrjd.mongodb.net:27017/?ssl=true&replicaSet=atlas-zoexl6-shard-0&authSource=admin&appName=Cluster0";

/**
 * Function: connectDatabase
 * Purpose: Server start hone se pehle MongoDB ke saath connection establish karna
 */
async function connectDatabase() {
  try {
    // mongoose.connect async hota hai, isliye await use kar rahe hain
    // Ye successfully connect hone par connection object return karta hai
    const dbConnection = await mongoose.connect(MONGO_URI);

    // Agar connection successful hai to host info print kar dete hain (debugging / confirmation ke liye)
    console.log("MongoDB connected:", dbConnection.connection.host);
  } catch (err) {
    // Agar connection fail ho jaye to error yaha catch hoga
    console.error("Database connection failed:", err.message);
  }
}

// DB connection initialize kar diya (server start hote hi call ho jayega)
connectDatabase();

/**
 * User Schema
 * Purpose: Define karta hai ki ek user document DB me kaisa dikhega
 */
const userSchema = new mongoose.Schema({
  // username field: user ka naam store karega
  username: String,

  // password field: user ka password store karega (real app me hash karna chahiye)
  password: String,
});

/**
 * User Model
 * Purpose: "users" collection ke saath interact karne ke liye interface provide karta hai
 * Is model ke through hum CRUD operations perform karte hain
 */
const UserModel = mongoose.model("User", userSchema);

// Middleware: incoming JSON data ko parse karta hai taaki hum req.body use kar sakein
app.use(express.json());

/**
 * Route: POST /users
 * Purpose: Naya user create karna database me
 *
 * Flow:
 * 1. Client se data aata hai (req.body)
 * 2. Us data ko DB me insert karte hain using mongoose
 * 3. Response client ko bhej dete hain
 */
app.post("/create-user", async (req, res) => {
  try {
    // Request body se user data extract kar rahe hain
    const userData = req.body;

    // (Ideally yaha validation + sanitization hona chahiye)

    // Ye line userData ko database ke "users" collection me save karti hai
    // Aur saved user (with _id) wapas deti hai
    const newUser = await UserModel.create(userData);

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
  }
});

// Fetch and return all user documents from the database
app.get("/users", async (req, res) => {
  // Fetches all documents from the collection that match the given query.
  // Since no filter is provided, it returns every document (i.e., all users) from the database.
  try {
    const users = await UserModel.find();
    // UserModel.find() returns data in the form of an ARRAY of OBJECTS

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// GET /users/:id
// Fetch a single user by their MongoDB ObjectId and return it in the response.
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Searching for user:", id);

    // findById() searches the document using MongoDB's _id field.
    // Mongoose automatically converts the string ID into an ObjectId.
    const user = await UserModel.findById(id);

    console.log("Fetched user:", user);

    // If no matching document exists, findById() returns null.
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // User found successfully.
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.put("/update-user", async (req, res) => {
  try {
    const id = req.query.id; // id from query (?id=123)
    const userData = req.body; // data to update

    console.log(`Searching for id: ${id}`);

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      userData,
      { new: true }, // return updated doc
    );

    console.log("Updated User:", updatedUser);

    res.json({
      message: "User updated Successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

app.delete("/delete-user", async (req, res) => {
  try {
    const id = req.query.id;
    console.log(`Searching for id: ${id}`);

    const deletedUser = await UserModel.findByIdAndDelete(id);

    console.log("Deleted User:", deletedUser);
    res.json({
      message: "User deleted Successfully",
      deletedUser: deletedUser,
    });
  } catch (error) {
    res.status(500).send({
      message: "User not found",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
