import express from "express";

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// GET: Fetch student data
app.get("/", (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
  res.json([
    { name: "Vivek", course: "B.Tech", branch: "CSE" },
    { name: "Tahmil", course: "B.Tech", branch: "CSE" },
  ]);
});

// GET: About page
app.get("/about", (req, res) => {
  res.send("About us Page");
});

// POST: Create a new user
app.post("/create-user", (req, res) => {
  console.log("Payload:", req.body);
  res.status(201).json({ 
    message: `Hey! ${req.body.username || 'User'}, your data has been submitted.`, 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
