use("Bank");

/*
    STEP 1: Create two bank accounts

    We will use these accounts to understand why
    transactions are important.

    Vivek     → $5000
    Abhishek  → $2000
*/

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
]);
*/


/*
    STEP 2: Add some money to the accounts

    This is only for resetting/changing the data
    while practicing the transaction example.
*/

/*
db.accounts.updateOne(
    { name: "Vivek" },
    { $inc: { balance: 4500 } }
);

db.accounts.updateOne(
    { name: "Abhishek" },
    { $inc: { balance: -2000 } }
);
*/


/*
    =========================================================
    WITHOUT TRANSACTION
    =========================================================

    Imagine we are transferring $500 from Vivek to Abhishek.

    Ideally, two things must happen:

        1. $500 should be deducted from Vivek.
        2. $500 should be added to Abhishek.

    Both operations are connected.

    But without a transaction, MongoDB treats them
    as two separate operations.

    So if the application crashes after step 1,
    Vivek can lose money without Abhishek receiving it.
*/


try {

    /*
        Step 1: Deduct $500 from Vivek.
    */
    db.accounts.updateOne(
        { name: "Vivek" },
        { $inc: { balance: -500 } }
    );

    console.log("$500 deducted from Vivek's account");


    /*
        Simulate something going wrong after the deduction.

        The next update will never execute because
        this error immediately moves execution to catch.
    */
    throw new Error("Server crashed!");


    /*
        Step 2: Credit $500 to Abhishek.

        This code will never execute in this example.
    */
    db.accounts.updateOne(
        { name: "Abhishek" },
        { $inc: { balance: 500 } }
    );

    console.log("$500 credited to Abhishek's account");

} catch (error) {

    console.log(error.message);
}



/*
    =========================================================
    WITH TRANSACTION
    =========================================================

    Now we will perform the same operation using
    a MongoDB transaction.

    The idea is simple:

        Start Transaction
              ↓
        Perform operations
              ↓
        Everything successful?
              ↓
            COMMIT

        Something went wrong?
              ↓
            ABORT
              ↓
        Undo all operations
*/


/*
    A session is the context in which our transaction runs.

    Think of the session as the "container" that keeps
    track of all operations belonging to this transaction.
*/
const session = db.getMongo().startSession();


/*
    Instead of using the normal db object,
    we access the Bank database through our session.

    This makes the following database operations
    part of the transaction.
*/
const accounts = session.getDatabase("Bank").accounts;


/*
    Nothing is permanent yet.

    MongoDB now starts tracking the operations
    performed through this session.
*/
session.startTransaction();


try {

    /*
        -----------------------------------------------------
        STEP 1: Deduct $500 from Vivek
        -----------------------------------------------------
    */

    accounts.updateOne(
        { name: "Vivek" },
        { $inc: { balance: -500 } }
    );

    console.log("$500 deducted from Vivek's account");


    /*
        -----------------------------------------------------
        STEP 2: Simulate a failure
        -----------------------------------------------------

        Imagine the server crashes at this exact moment.

        Vivek's money has been deducted inside the transaction,
        but the transaction has NOT been committed yet.
    */

    throw new Error("Server crashed!");


    /*
        -----------------------------------------------------
        STEP 3: Credit $500 to Abhishek
        -----------------------------------------------------

        This will never execute because the error above
        immediately moves execution to the catch block.
    */

    accounts.updateOne(
        { name: "Abhishek" },
        { $inc: { balance: 500 } }
    );

    console.log("$500 credited to Abhishek's account");


    /*
        -----------------------------------------------------
        STEP 4: Commit
        -----------------------------------------------------

        If everything worked successfully,
        we would permanently save all operations.
    */

    session.commitTransaction();


} catch (error) {

    /*
        Something went wrong.

        Since the transaction was not committed,
        we can cancel the entire transaction.

        This means even the $500 deducted from Vivek
        will be undone.
    */

    session.abortTransaction();

    console.log(error.message);
    console.log("Transaction aborted. Money got rolled back.");


} finally {

    /*
        Whether the transaction succeeded or failed,
        we are finished with this session.

        Closing the session releases the resources
        associated with it.
    */

    session.endSession();
}


/*
    =========================================================
    CHECK THE RESULT
    =========================================================

    Because the transaction was aborted:

        Vivek     → $5000
        Abhishek  → $2000

    Vivek's $500 deduction should NOT remain.
*/

db.accounts.find();