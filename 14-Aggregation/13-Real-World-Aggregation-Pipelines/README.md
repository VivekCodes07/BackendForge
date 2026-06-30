# Real-World Aggregation Pipelines

Until this point, I've been learning aggregation one stage at a time.

I learned how to

- filter documents using `$match`
- reshape them using `$project`
- group them using `$group`
- sort them using `$sort`
- join collections using `$lookup`
- flatten arrays using `$unwind`

Each lesson focused on a single concept.

That made learning easier.

But real projects don't work like that.

When building an application,

I don't write a pipeline with just one stage.

Instead,

I combine multiple stages together to answer a business question.

For example,

an e-commerce dashboard doesn't ask

> "Can you use `$group`?"

Instead,

it asks

> "How much revenue did we generate this month?"

Finding that answer might require

```
Filter Orders

↓

Group Them

↓

Calculate Revenue

↓

Format the Result
```

That's what this lesson is about.

Instead of learning new stages,

I'll learn how to combine everything I've already learned.

---

# Sample Collections

For this lesson, I'll use two collections.

## Orders

```js
[
    {
        customerId: 1,
        product: "Mechanical Keyboard",
        category: "Accessories",
        amount: 120,
        quantity: 2,
        status: "Delivered"
    },
    {
        customerId: 2,
        product: "Gaming Mouse",
        category: "Accessories",
        amount: 60,
        quantity: 1,
        status: "Pending"
    },
    {
        customerId: 1,
        product: "Monitor",
        category: "Electronics",
        amount: 300,
        quantity: 1,
        status: "Delivered"
    },
    {
        customerId: 3,
        product: "Laptop",
        category: "Electronics",
        amount: 900,
        quantity: 1,
        status: "Delivered"
    }
]
```

## Customers

```js
[
    {
        _id: 1,
        name: "John"
    },
    {
        _id: 2,
        name: "Emma"
    },
    {
        _id: 3,
        name: "Alex"
    }
]
```

These collections are simple,

but they represent the kind of data I would actually find in an online store.

---

# Project 1 — E-commerce Dashboard

Imagine I'm building the admin dashboard for an online store.

One of the dashboard cards says

```
Total Revenue
```

Another says

```
Total Orders
```

Another shows

```
Average Order Value
```

Instead of calculating these in my application,

I can let MongoDB do the work.

---

## Step 1 — Filter Delivered Orders

Revenue should only include completed orders.

Pending orders haven't been paid yet.

Cancelled orders shouldn't count either.

So the first step is obvious.

```js
{
    $match: {
        status: "Delivered"
    }
}
```

Whenever I build a pipeline,

I now ask myself

> "Can I reduce the number of documents first?"

If the answer is yes,

I usually start with `$match`.

---

## Step 2 — Group Everything Together

Now I want one summary.

Not one summary per category.

Not one summary per customer.

Just one overall summary.

That's why I group everything using

```js
{
    _id: null
}
```

This tells MongoDB

> "Treat every remaining document as one big group."

---

## Step 3 — Calculate Analytics

Inside the group,

I can calculate multiple values at once.

```js
{
    $group: {
        _id: null,

        totalRevenue: {
            $sum: "$amount"
        },

        totalOrders: {
            $sum: 1
        },

        averageOrderValue: {
            $avg: "$amount"
        }
    }
}
```

Now MongoDB gives me exactly what the dashboard needs.

```
Revenue

↓

Total Orders

↓

Average Order Value
```

All in one query.

---

## Complete Pipeline

```js
db.orders.aggregate([
    {
        $match: {
            status: "Delivered"
        }
    },
    {
        $group: {
            _id: null,

            totalRevenue: {
                $sum: "$amount"
            },

            totalOrders: {
                $sum: 1
            },

            averageOrderValue: {
                $avg: "$amount"
            }
        }
    }
]);
```

Whenever I look at this pipeline,

I don't read the syntax.

I read the story.

```
Get Delivered Orders

↓

Group Them

↓

Calculate Revenue

↓

Return Summary
```

That mindset makes aggregation much easier to understand.

---

# Project 2 — Top Selling Categories

Now imagine the product team asks me

> Which categories generated the most revenue?

This isn't about individual products anymore.

It's about categories.

So I immediately know

I'll need `$group`.

---

## Step 1 — Group by Category

Instead of grouping everything together,

I group by category.

```js
{
    $group: {
        _id: "$category"
    }
}
```

Now MongoDB creates one group for

```
Accessories

Electronics
```

---

## Step 2 — Calculate Revenue

For every category,

I add up the order amounts.

```js
{
    totalRevenue: {
        $sum: "$amount"
    }
}
```

Result

```
Accessories

↓

180


Electronics

↓

1200
```

---

## Step 3 — Sort Highest First

Business reports usually show the biggest numbers first.

So I sort in descending order.

```js
{
    $sort: {
        totalRevenue: -1
    }
}
```

---

## Step 4 — Limit the Results

Suppose there are fifty categories.

The dashboard only needs the top five.

That's where `$limit` comes in.

```js
{
    $limit: 5
}
```

---

## Complete Pipeline

```js
db.orders.aggregate([
    {
        $group: {
            _id: "$category",

            totalRevenue: {
                $sum: "$amount"
            }
        }
    },
    {
        $sort: {
            totalRevenue: -1
        }
    },
    {
        $limit: 5
    }
]);
```

When I read this pipeline,

I think

```
Orders

↓

Group by Category

↓

Calculate Revenue

↓

Sort Highest First

↓

Return Top Five
```

Instead of seeing four aggregation stages,

I see one business question being answered.

That has been the biggest shift in my thinking.

I'm no longer asking,

> "Which stage should I use?"

I'm asking,

> "What problem am I trying to solve?"

Once I know the problem,

the stages naturally fall into place.

---

# Project 3 — Customer Order History

Imagine I'm building the **"My Orders"** page for an e-commerce website.

When a customer logs in,

they expect to see something like

```
John

↓

Mechanical Keyboard

↓

Monitor

↓

Laptop
```

But there's a problem.

The customer's information lives in one collection.

The orders live in another.

```
customers

↓

orders
```

MongoDB doesn't automatically combine collections.

That's my job.

This is exactly why `$lookup` exists.

---

## Step 1 — Join the Collections

I start with the `customers` collection.

For every customer,

I want MongoDB to find matching orders.

```js
{
    $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "customerId",
        as: "orders"
    }
}
```

MongoDB now creates a new field.

```js
orders
```

That field contains an array of matching orders.

---

## Result

Instead of

```js
{
    name: "John"
}
```

I now get

```js
{
    name: "John",

    orders: [

        {
            product: "Mechanical Keyboard"
        },

        {
            product: "Monitor"
        }

    ]
}
```

The customer document has become much richer.

---

## Step 2 — Hide Unnecessary Fields

The frontend doesn't always need every field.

Maybe I only want

- Customer name
- Orders

That's where `$project` comes in.

```js
{
    $project: {
        _id: 0,
        name: 1,
        orders: 1
    }
}
```

---

## Complete Pipeline

```js
db.customers.aggregate([
    {
        $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customerId",
            as: "orders"
        }
    },
    {
        $project: {
            _id: 0,
            name: 1,
            orders: 1
        }
    }
]);
```

Whenever I read this pipeline,

I don't think

> "$lookup then $project."

I think

```
Get Customers

↓

Find Their Orders

↓

Return Clean Data
```

---

# Project 4 — Product Analytics

Imagine the product team asks

> "How many orders fall into each price range?"

They don't want every order.

They want a summary.

Something like

```
₹0 – ₹499

↓

120 Orders


₹500 – ₹999

↓

58 Orders


₹1000+

↓

17 Orders
```

This is the perfect use case for `$bucket`.

---

## Step 1 — Choose the Field

MongoDB needs to know

which value determines the bucket.

```js
groupBy: "$amount"
```

---

## Step 2 — Define the Ranges

Now I define meaningful ranges.

```js
boundaries: [
    0,
    500,
    1000,
    5000
]
```

MongoDB creates

```
₹0–₹499

₹500–₹999

₹1000–₹4999
```

---

## Step 3 — Count Orders

Every bucket automatically counts documents,

but I can also customize the output.

```js
output: {

    totalOrders: {
        $sum: 1
    },

    averageAmount: {
        $avg: "$amount"
    }

}
```

Now every bucket tells me

- Number of orders
- Average order value

---

## Complete Pipeline

```js
db.orders.aggregate([
    {
        $bucket: {
            groupBy: "$amount",

            boundaries: [
                0,
                500,
                1000,
                5000
            ],

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
```

Instead of hundreds of raw orders,

MongoDB returns useful business insights.

---

# Project 5 — Admin Dashboard

This is probably my favorite example.

Imagine opening an admin dashboard.

At the top,

I see four cards.

```
Total Orders

Delivered Orders

Pending Orders

Revenue
```

How do I get all of those values?

One option is

```
Query 1

↓

Query 2

↓

Query 3

↓

Query 4
```

That works,

but it means multiple database calls.

MongoDB gives me a better solution.

`$facet`.

---

## Step 1 — Split the Pipeline

Instead of one pipeline,

MongoDB creates multiple mini pipelines.

```
Orders

        │

────────┼───────────────┬───────────────┐

        ▼               ▼               ▼

Total        Delivered        Revenue

Orders        Orders

────────┴───────────────┴───────────────┘

                ▼

          One Response
```

Each pipeline works independently.

---

## Step 2 — Count Total Orders

```js
totalOrders: [

    {
        $count: "count"
    }

]
```

---

## Step 3 — Count Delivered Orders

```js
deliveredOrders: [

    {
        $match: {
            status: "Delivered"
        }
    },

    {
        $count: "count"
    }

]
```

---

## Step 4 — Calculate Revenue

```js
revenue: [

    {
        $match: {
            status: "Delivered"
        }
    },

    {
        $group: {

            _id: null,

            totalRevenue: {
                $sum: "$amount"
            }

        }
    }

]
```

---

## Complete Pipeline

```js
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

            revenue: [

                {
                    $match: {
                        status: "Delivered"
                    }
                },

                {
                    $group: {

                        _id: null,

                        totalRevenue: {
                            $sum: "$amount"
                        }

                    }
                }

            ]

        }
    }
]);
```

When I read this pipeline,

I don't focus on the syntax.

I imagine an admin opening a dashboard.

MongoDB prepares every card

before the page even loads.

That completely changed how I think about aggregation.

Instead of seeing separate stages,

I see complete features being built.

---

# Common Aggregation Patterns

After writing a few pipelines, I noticed something.

I wasn't randomly choosing aggregation stages anymore.

Instead,

I started recognizing patterns.

Whenever I faced a problem,

I already had an idea of how the pipeline would look.

Here are the patterns I found myself using over and over again.

---

## Pattern 1 — Filter → Group → Sort

Question

> Which category generated the most revenue?

Pipeline

```
Orders

↓

Filter Delivered Orders

↓

Group by Category

↓

Calculate Revenue

↓

Sort Highest First
```

Stages

```text
$match

↓

$group

↓

$sort
```

Whenever I need rankings,

this is usually the pattern.

---

## Pattern 2 — Match → Lookup → Project

Question

> Show every customer along with their orders.

Pipeline

```
Customers

↓

Find Matching Orders

↓

Return Only Required Fields
```

Stages

```text
$lookup

↓

$project
```

This is one of the most common backend queries.

---

## Pattern 3 — Match → Group

Question

> How many delivered orders do we have?

Pipeline

```
Orders

↓

Keep Delivered Orders

↓

Count Them
```

Stages

```text
$match

↓

$count
```

Simple,

but very common.

---

## Pattern 4 — Group → Sort → Limit

Question

> Show the top 5 selling categories.

Pipeline

```
Orders

↓

Group Categories

↓

Calculate Revenue

↓

Sort

↓

Top Five
```

Stages

```text
$group

↓

$sort

↓

$limit
```

This is perfect for leaderboards and reports.

---

## Pattern 5 — Lookup → Unwind → Group

Question

> Which product appears in the most orders?

Pipeline

```
Customers

↓

Lookup Orders

↓

Unwind Orders

↓

Group Products

↓

Count Orders
```

This looks complicated at first,

but once you understand each stage,

it becomes much easier to read.

---

# How I Think Before Writing a Pipeline

One of the biggest mistakes I made in the beginning was thinking about stages first.

I used to ask myself

> "Should I use `$group`?"

or

> "Should I use `$project`?"

That wasn't the right question.

Now I think differently.

I start with the business problem.

For example,

```
Find total revenue.
```

Then I ask myself,

**Do I need every order?**

No.

Only delivered orders.

So I start with

```text
$match
```

Next,

I ask,

**Do I need individual orders?**

No.

I need one summary.

So I use

```text
$group
```

Finally,

I ask,

**Do I need to rename or hide fields?**

If yes,

I finish with

```text
$project
```

Instead of memorizing pipelines,

I build them one question at a time.

---

# My Thought Process

Whenever someone asks me a database question,

this is the process I try to follow.

```
What am I trying to find?

↓

Which documents do I need?

↓

Can I filter them first?

↓

Do I need individual documents
or a summary?

↓

Should I group them?

↓

Do I need sorting?

↓

Do I only need a few results?

↓

Should I clean up the output?
```

Most aggregation pipelines are just answers to these questions.

---

# Aggregation Isn't About Syntax

Earlier,

I used to think aggregation was difficult because there were so many stages.

Now I realize

the stages are actually the easy part.

The difficult part is understanding the problem.

Once I understand the problem,

the stages almost choose themselves.

For example,

```
Need to join collections?

↓

$lookup
```

```
Need analytics?

↓

$group
```

```
Need only a few documents?

↓

$limit
```

```
Need to filter?

↓

$match
```

```
Need better output?

↓

$project
```

This mindset helped me stop memorizing syntax.

Instead,

I started solving problems.

---

# Mental Model

Today,

I don't think about aggregation as individual stages.

I think about it as a flow of data.

```
Collection

↓

Filter

↓

Join

↓

Flatten

↓

Group

↓

Calculate

↓

Sort

↓

Limit

↓

Shape Output

↓

Final Result
```

Every stage has one responsibility.

When I combine them,

I get exactly the result I need.

---

# Quick Summary

| Problem | Stages I Usually Use |
| -------- | -------------------- |
| Filter documents | `$match` |
| Select specific fields | `$project` |
| Create summaries | `$group` |
| Sort results | `$sort` |
| Return top results | `$limit` |
| Skip results | `$skip` |
| Join collections | `$lookup` |
| Flatten arrays | `$unwind` |
| Add or update fields | `$addFields`, `$set` |
| Remove fields | `$unset` |
| Count documents | `$count` |
| Build dashboards | `$facet` |
| Group into ranges | `$bucket` |

---

# Biggest Takeaway

This lesson felt different from every other lesson in the course.

I didn't learn any new syntax.

Instead,

I learned how to combine everything I already knew.

That changed the way I think about aggregation.

Before,

I looked at a stage and wondered what it did.

Now,

I look at a problem and think about how to solve it.

Instead of asking,

> "Which aggregation stage should I use?"

I ask,

> "What am I trying to build?"

Once I know the answer,

the pipeline starts building itself.

That's probably the biggest lesson I've learned throughout this aggregation journey.

Aggregation isn't about remembering every stage.

It's about breaking a problem into small steps and letting each stage do one job well.

Once I started thinking that way,

aggregation became much less intimidating and much more enjoyable.