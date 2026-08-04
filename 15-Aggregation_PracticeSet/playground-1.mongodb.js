show("dbs");
use("snapdeal");
/*
db.orders.insertMany([
    {
        customer: "Manas",
        city: "Patna",
        products: [
            { name: "Laptop", category: "Electronics", price: 50000, quantity: 1 },
            { name: "Mouse", category: "Electronics", price: 1000, quantity: 2 },
            { name: "Keyboard", category: "Electronics", price: 2500, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Rahul",
        city: "Delhi",
        products: [
            { name: "Shoes", category: "Fashion", price: 3000, quantity: 2 }
        ],
        paymentMethod: "Card",
        status: "Delivered"
    },
    {
        customer: "Priya",
        city: "Mumbai",
        products: [
            { name: "Phone", category: "Electronics", price: 35000, quantity: 1 },
            { name: "Cover", category: "Accessories", price: 500, quantity: 2 },
            { name: "Charger", category: "Electronics", price: 1200, quantity: 1 }
        ],
        paymentMethod: "COD",
        status: "Pending"
    },
    {
        customer: "Manas",
        city: "Patna",
        products: [
            { name: "Monitor", category: "Electronics", price: 15000, quantity: 1 }
        ],
        paymentMethod: "COD",
        status: "Pending"
    },
    {
        customer: "Sneha",
        city: "Patna",
        products: [
            { name: "Bag", category: "Fashion", price: 1800, quantity: 1 },
            { name: "Perfume", category: "Beauty", price: 2200, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Rahul",
        city: "Delhi",
        products: [
            { name: "T-Shirt", category: "Fashion", price: 1200, quantity: 3 },
            { name: "Jeans", category: "Fashion", price: 2500, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Aman",
        city: "Kolkata",
        products: [
            { name: "Watch", category: "Accessories", price: 5000, quantity: 1 }
        ],
        paymentMethod: "Card",
        status: "Delivered"
    },
    {
        customer: "Neha",
        city: "Mumbai",
        products: [
            { name: "Face Wash", category: "Beauty", price: 500, quantity: 3 },
            { name: "Nail Paint", category: "Beauty", price: 300, quantity: 5 }
        ],
        paymentMethod: "Card",
        status: "Delivered"
    },
    {
        customer: "Priya",
        city: "Mumbai",
        products: [
            { name: "Lipstick", category: "Beauty", price: 800, quantity: 4 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Vikash",
        city: "Delhi",
        products: [
            { name: "Tablet", category: "Electronics", price: 20000, quantity: 1 },
            { name: "Keyboard", category: "Electronics", price: 3000, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Arjun",
        city: "Patna",
        products: [
            { name: "Headphones", category: "Electronics", price: 2500, quantity: 2 }
        ],
        paymentMethod: "Card",
        status: "Delivered"
    },
    {
        customer: "Manas",
        city: "Patna",
        products: [
            { name: "Speaker", category: "Electronics", price: 6000, quantity: 1 },
            { name: "Gaming Mouse", category: "Electronics", price: 3500, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Rohit",
        city: "Delhi",
        products: [
            { name: "TV", category: "Electronics", price: 45000, quantity: 1 },
            { name: "Sound Bar", category: "Electronics", price: 8000, quantity: 1 }
        ],
        paymentMethod: "COD",
        status: "Delivered"
    },
    {
        customer: "Sneha",
        city: "Patna",
        products: [
            { name: "Heels", category: "Fashion", price: 2800, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Pending"
    },
    {
        customer: "Aman",
        city: "Kolkata",
        products: [
            { name: "Perfume", category: "Beauty", price: 2200, quantity: 2 },
            { name: "Face Cream", category: "Beauty", price: 1200, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Cancelled"
    },
    {
        customer: "Pooja",
        city: "Bangalore",
        products: [
            { name: "Dress", category: "Fashion", price: 4000, quantity: 1 },
            { name: "Handbag", category: "Fashion", price: 3500, quantity: 1 }
        ],
        paymentMethod: "Card",
        status: "Delivered"
    },
    {
        customer: "Neha",
        city: "Mumbai",
        products: [
            { name: "Hair Dryer", category: "Electronics", price: 2500, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Pending"
    },
    {
        customer: "Arjun",
        city: "Patna",
        products: [
            { name: "Speaker", category: "Electronics", price: 6000, quantity: 1 },
            { name: "Mic", category: "Electronics", price: 2500, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Delivered"
    },
    {
        customer: "Vikash",
        city: "Delhi",
        products: [
            { name: "Monitor", category: "Electronics", price: 15000, quantity: 1 }
        ],
        paymentMethod: "COD",
        status: "Delivered"
    },
    {
        customer: "Rohit",
        city: "Delhi",
        products: [
            { name: "Gaming Mouse", category: "Electronics", price: 3500, quantity: 2 },
            { name: "Mouse Pad", category: "Accessories", price: 700, quantity: 1 }
        ],
        paymentMethod: "UPI",
        status: "Pending"
    }
]);
*/
/*
db.users.insertMany([
  {
    _id: 1,
    name: "Manas",
    city: "Patna"
  },
  {
    _id: 2,
    name: "Rahul",
    city: "Delhi"
  },
  {
    _id: 3,
    name: "Priya",
    city: "Mumbai"
  },
  {
    _id: 4,
    name: "Sneha",
    city: "Kolkata"
  },
  {
    _id: 5,
    name: "Arjun",
    city: "Patna"
  }
]);
*/
// ORDERS-2
/*
db.orders2.insertMany([
  {
    customerId: 1,
    product: "Laptop",
    amount: 50000
  },
  {
    customerId: 1,
    product: "Mouse",
    amount: 2000
  },
  {
    customerId: 2,
    product: "Shoes",
    amount: 6000
  },
  {
    customerId: 3,
    product: "Phone",
    amount: 35000
  }
]);
*/

show("collections");

db.products.aggregate();
db.orders.aggregate();

// 1. Find total sales of each category.
db.orders.aggregate([
  {
    $unwind: "$products",
  },
  {
    $group: {
      _id: "$products.category",
      totalSales: {
        $sum: {
          $multiply: ["$products.price", "$products.quantity"],
        },
      },
    },
  },
]);

/*
Why I used this:

- Since products is an array, I can't directly access price and quantity.
  So I first use $unwind to make each product its own document.

- Then I group by product category.

- price × quantity gives the sales of one product,
  and $sum adds up the sales of all products in the same category.

Note to myself:
Whenever I need to work with fields inside an array,
remember to use $unwind first.
*/



// 2. Find the top spending customer.
db.orders.aggregate([
  {
    $unwind: "$products"
  },

  {
    $group: {
      _id: "$customer",
      totalOrderCost: {
        $sum: {
          $multiply: ["$products.price", "$products.quantity"],
        }
      }
    }
  },

  {
    $sort: {
      totalOrderCost: -1,
    },
  },

  {
    $limit: 1
  }
]);

/*
Why I used this:

- Again, products is an array, so I have to use $unwind first.
  Otherwise price and quantity won't be calculated correctly.

- I group by customer to calculate how much each customer spent.

- price × quantity gives the cost of each purchased product,
  and $sum adds everything for that customer.

- I sort in descending order (-1) because I need the highest spender,
  then use $limit to return only the top customer.

Note to myself:
If I need the "top" or "highest" result,
don't forget to sort in descending order (-1)
and use $limit: 1.
*/


// 3. Show all products bought by each customer.
db.orders.aggregate([
    {
        $unwind: "$products"
    },

    {
        $group: {
            _id: "$customer",
            productDetails: {
                $push: {
                    productName: "$products.name",
                    price: "$products.price"
                }
            }
        }
    }
])