use("Bank");
/*
db.accounts.insertMany([
    {
        _id: 1, 
        name: "Vivek",
        balance: 5000
    },

    {
        _id: 2,
        name: "Abhishek",
        balance: 2000
    }
])
*/
/*
db.accounts.updateOne({ name: "Vivek" }, { $inc: { balance: 4500 } });

db.accounts.updateOne({ name: "Abhishek" }, { $inc: { balance: -2000 } });
*/
// ---------- WITHOUT TRANSACTION ---------
/*
try {
  db.accounts.updateOne({ name: "Vivek" }, { $inc: { balance: -500 } });
  console.log("$500 deducted from Vivek's account");

  throw new Error("Server crashed!");

  db.accounts.updateOne({ name: "Abhishek" }, { $inc: { balance: 500 } });
  console.log("$500 credited to Abhsihek's account");
} catch (error) {
  console.log(error.message);
}
*/

// ---------------------- WITH TRANSACTION -----------------------

const session = db.getMongo().startSession();

const accounts = session.getDatabase("Bank").accounts;

session.startTransaction();

try {
  accounts.updateOne(
    { name: "Vivek" },
    { $inc: { balance: -500 } }
  );

  console.log("$500 deducted from Vivek's account");

  throw new Error("Server crashed!");

  accounts.updateOne(
    { name: "Abhishek" },
    { $inc: { balance: 500 } }
  );

  console.log("$500 credited to Abhishek's account");

  session.commitTransaction();

} catch (error) {
  session.abortTransaction();
  console.log(error.message);
  console.log("Money got rolled back");

} finally {
  session.endSession();
}

db.accounts.find();
