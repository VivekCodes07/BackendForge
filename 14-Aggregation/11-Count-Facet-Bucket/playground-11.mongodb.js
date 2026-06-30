/*
═══════════════════════════════════════════════════════════════════════════════
                  PLAYGROUND — $count, $facet & $bucket
═══════════════════════════════════════════════════════════════════════════════

Today I learned three stages that are mostly used for analytics
and dashboards.

$count  → Count documents

$facet  → Run multiple pipelines at once

$bucket → Group values into ranges
*/



/*
═══════════════════════════════════════════════════════════════════════════════
                             SAMPLE COLLECTION
═══════════════════════════════════════════════════════════════════════════════
*/

db.orders.drop();

db.orders.insertMany([
    {
        customer: "John",
        amount: 250,
        status: "Delivered",
        paymentMethod: "Card"
    },
    {
        customer: "Emma",
        amount: 1800,
        status: "Pending",
        paymentMethod: "UPI"
    },
    {
        customer: "Alex",
        amount: 650,
        status: "Delivered",
        paymentMethod: "Cash"
    },
    {
        customer: "Sophia",
        amount: 4200,
        status: "Delivered",
        paymentMethod: "Card"
    },
    {
        customer: "Mike",
        amount: 120,
        status: "Cancelled",
        paymentMethod: "Cash"
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
01. $count
═══════════════════════════════════════════════════════════════════════════════

Counts whatever reaches this stage.
*/

db.orders.aggregate([
    {
        $count: "totalOrders"
    }
]);



/*
Only delivered orders.
*/

db.orders.aggregate([
    {
        $match: {
            status: "Delivered"
        }
    },
    {
        $count: "deliveredOrders"
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
02. $facet
═══════════════════════════════════════════════════════════════════════════════

One input.

Multiple mini pipelines.
*/

db.orders.aggregate([
    {
        $facet: {
            totalOrders: [
                {
                    $count: "count"
                }
            ],

            deliveredOrders: [
                {
                    $match: {
                        status: "Delivered"
                    }
                },
                {
                    $count: "count"
                }
            ],

            pendingOrders: [
                {
                    $match: {
                        status: "Pending"
                    }
                },
                {
                    $count: "count"
                }
            ]
        }
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
03. $bucket
═══════════════════════════════════════════════════════════════════════════════

Group orders by amount.

0-499

500-999

1000+
*/

db.orders.aggregate([
    {
        $bucket: {
            groupBy: "$amount",
            boundaries: [0, 500, 1000, 5000],
            default: "Other"
        }
    }
]);



/*
Bucket with extra info.

Count orders

Average amount
*/

db.orders.aggregate([
    {
        $bucket: {
            groupBy: "$amount",
            boundaries: [0, 500, 1000, 5000],
            default: "Other",
            output: {
                totalOrders: {
                    $sum: 1
                },
                averageAmount: {
                    $avg: "$amount"
                }
            }
        }
    }
]);



/*
═══════════════════════════════════════════════════════════════════════════════
MENTAL MODEL
═══════════════════════════════════════════════════════════════════════════════

$count

→ How many?


$facet

→ Multiple pipelines.
One result.


$bucket

→ Put documents
into value ranges.
*/



/*
═══════════════════════════════════════════════════════════════════════════════
BIGGEST TAKEAWAY
═══════════════════════════════════════════════════════════════════════════════

These stages aren't about changing documents.

They're about understanding data.

Perfect for reports,
dashboards,
and analytics.
*/