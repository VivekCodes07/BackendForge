use("myDb")

// db.createCollection('users')

/* Inserted user's data
db.users.insertMany([
  {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "address": {
      "street": "Kulas Light",
      "suite": "Apt. 556",
      "city": "Gwenborough",
      "zipcode": "92998-3874",
      "geo": {
        "lat": "-37.3159",
        "lng": "81.1496"
      }
    },
    "phone": "1-770-736-8031 x56442",
    "website": "hildegard.org",
    "company": {
      "name": "Romaguera-Crona",
      "catchPhrase": "Multi-layered client-server neural-net",
      "bs": "harness real-time e-markets"
    }
  },
  {
    "id": 2,
    "name": "Ervin Howell",
    "username": "Antonette",
    "email": "Shanna@melissa.tv",
    "address": {
      "street": "Victor Plains",
      "suite": "Suite 879",
      "city": "Wisokyburgh",
      "zipcode": "90566-7771",
      "geo": {
        "lat": "-43.9509",
        "lng": "-34.4618"
      }
    },
    "phone": "010-692-6593 x09125",
    "website": "anastasia.net",
    "company": {
      "name": "Deckow-Crist",
      "catchPhrase": "Proactive didactic contingency",
      "bs": "synergize scalable supply-chains"
    }
  },
  {
    "id": 3,
    "name": "Clementine Bauch",
    "username": "Samantha",
    "email": "Nathan@yesenia.net",
    "address": {
      "street": "Douglas Extension",
      "suite": "Suite 847",
      "city": "McKenziehaven",
      "zipcode": "59590-4157",
      "geo": {
        "lat": "-68.6102",
        "lng": "-47.0653"
      }
    },
    "phone": "1-463-123-4447",
    "website": "ramiro.info",
    "company": {
      "name": "Romaguera-Jacobson",
      "catchPhrase": "Face to face bifurcated interface",
      "bs": "e-enable strategic applications"
    }
  },
  {
    "id": 4,
    "name": "Patricia Lebsack",
    "username": "Karianne",
    "email": "Julianne.OConner@kory.org",
    "address": {
      "street": "Hoeger Mall",
      "suite": "Apt. 692",
      "city": "South Elvis",
      "zipcode": "53919-4257",
      "geo": {
        "lat": "29.4572",
        "lng": "-164.2990"
      }
    },
    "phone": "493-170-9623 x156",
    "website": "kale.biz",
    "company": {
      "name": "Robel-Corkery",
      "catchPhrase": "Multi-tiered zero tolerance productivity",
      "bs": "transition cutting-edge web services"
    }
  },
  {
    "id": 5,
    "name": "Chelsey Dietrich",
    "username": "Kamren",
    "email": "Lucio_Hettinger@annie.ca",
    "address": {
      "street": "Skiles Walks",
      "suite": "Suite 351",
      "city": "Roscoeview",
      "zipcode": "33263",
      "geo": {
        "lat": "-31.8129",
        "lng": "62.5342"
      }
    },
    "phone": "(254)954-1289",
    "website": "demarco.info",
    "company": {
      "name": "Keebler LLC",
      "catchPhrase": "User-centric fault-tolerant solution",
      "bs": "revolutionize end-to-end systems"
    }
  },
  {
    "id": 6,
    "name": "Mrs. Dennis Schulist",
    "username": "Leopoldo_Corkery",
    "email": "Karley_Dach@jasper.info",
    "address": {
      "street": "Norberto Crossing",
      "suite": "Apt. 950",
      "city": "South Christy",
      "zipcode": "23505-1337",
      "geo": {
        "lat": "-71.4197",
        "lng": "71.7478"
      }
    },
    "phone": "1-477-935-8478 x6430",
    "website": "ola.org",
    "company": {
      "name": "Considine-Lockman",
      "catchPhrase": "Synchronised bottom-line interface",
      "bs": "e-enable innovative applications"
    }
  },
  {
    "id": 7,
    "name": "Kurtis Weissnat",
    "username": "Elwyn.Skiles",
    "email": "Telly.Hoeger@billy.biz",
    "address": {
      "street": "Rex Trail",
      "suite": "Suite 280",
      "city": "Howemouth",
      "zipcode": "58804-1099",
      "geo": {
        "lat": "24.8918",
        "lng": "21.8984"
      }
    },
    "phone": "210.067.6132",
    "website": "elvis.io",
    "company": {
      "name": "Johns Group",
      "catchPhrase": "Configurable multimedia task-force",
      "bs": "generate enterprise e-tailers"
    }
  },
  {
    "id": 8,
    "name": "Nicholas Runolfsdottir V",
    "username": "Maxime_Nienow",
    "email": "Sherwood@rosamond.me",
    "address": {
      "street": "Ellsworth Summit",
      "suite": "Suite 729",
      "city": "Aliyaview",
      "zipcode": "45169",
      "geo": {
        "lat": "-14.3990",
        "lng": "-120.7677"
      }
    },
    "phone": "586.493.6943 x140",
    "website": "jacynthe.com",
    "company": {
      "name": "Abernathy Group",
      "catchPhrase": "Implemented secondary concept",
      "bs": "e-enable extensible e-tailers"
    }
  },
  {
    "id": 9,
    "name": "Glenna Reichert",
    "username": "Delphine",
    "email": "Chaim_McDermott@dana.io",
    "address": {
      "street": "Dayna Park",
      "suite": "Suite 449",
      "city": "Bartholomebury",
      "zipcode": "76495-3109",
      "geo": {
        "lat": "24.6463",
        "lng": "-168.8889"
      }
    },
    "phone": "(775)976-6794 x41206",
    "website": "conrad.com",
    "company": {
      "name": "Yost and Sons",
      "catchPhrase": "Switchable contextually-based project",
      "bs": "aggregate real-time technologies"
    }
  },
  {
    "id": 10,
    "name": "Clementina DuBuque",
    "username": "Moriah.Stanton",
    "email": "Rey.Padberg@karina.biz",
    "address": {
      "street": "Kattie Turnpike",
      "suite": "Suite 198",
      "city": "Lebsackbury",
      "zipcode": "31428-2261",
      "geo": {
        "lat": "-38.2386",
        "lng": "57.2232"
      }
    },
    "phone": "024-648-3804",
    "website": "ambrose.net",
    "company": {
      "name": "Hoeger LLC",
      "catchPhrase": "Centralized empowering task-force",
      "bs": "target end-to-end models"
    }
  }
])
*/

/*
Returns all documents with only the
name field.

* First {} matches every document.
* name: 1 includes the name field.
* _id is returned automatically.
  */

db.users.find(
{},
{
name: 1
}
);

/*
Returns all documents with only the
name, username and email fields.

* First {} matches every document.
* name: 1 includes the name field.
* username: 1 includes the username field.
* email: 1 includes the email field.
* _id is returned automatically.
  */

db.users.find(
{},
{
name: 1,
username: 1,
email: 1
}
);

/*
Returns all documents with only the
name and username fields.

* First {} matches every document.
* name: 1 includes the name field.
* username: 1 includes the username field.
* _id: 0 removes the _id field.
  */

db.users.find(
{},
{
name: 1,
username: 1,
_id: 0
}
);

/*
Returns all document fields except email.

* First {} matches every document.
* email: 0 excludes the email field.
* Every other field is returned.
  */

db.users.find(
{},
{
email: 0
}
);

/*
Returns all document fields except
email, phone and website.

* First {} matches every document.
* email: 0 excludes email.
* phone: 0 excludes phone.
* website: 0 excludes website.
  */

db.users.find(
{},
{
email: 0,
phone: 0,
website: 0
}
);

/*
Returns only the name and email
of the user whose id is 1.

* { id: 1 } finds the matching user.
* name: 1 includes the name field.
* email: 1 includes the email field.
* _id: 0 removes the _id field.
  */

db.users.find(
{
id: 1
},
{
name: 1,
email: 1,
_id: 0
}
);

/*
Returns only the city from the
nested address object.

* First {} matches every document.
* address.city accesses a nested field.
* _id: 0 removes the _id field.
  */

db.users.find(
{},
{
"address.city": 1,
_id: 0
}
);

/*
Returns name, city and zipcode.

* First {} matches every document.
* name: 1 includes the name field.
* address.city includes the city.
* address.zipcode includes the zipcode.
* _id: 0 removes the _id field.
  */

db.users.find(
{},
{
name: 1,
"address.city": 1,
"address.zipcode": 1,
_id: 0
}
);

/*
Returns geo coordinates for each user.

* First {} matches every document.
* address.geo.lat includes latitude.
* address.geo.lng includes longitude.
* _id: 0 removes the _id field.
  */

db.users.find(
{},
{
name: 1,
"address.geo.lat": 1,
"address.geo.lng": 1,
_id: 0
}
);

/*
Returns the user's name and company name.

* First {} matches every document.
* company.name accesses a nested field.
* _id: 0 removes the _id field.
  */

db.users.find(
{},
{
name: 1,
"company.name": 1,
_id: 0
}
);

/*
Returns users living in Gwenborough.

* address.city filters the documents.
* name: 1 includes the name field.
* email: 1 includes the email field.
* address.city includes the city.
* _id: 0 removes the _id field.
  */

db.users.find(
{
"address.city": "Gwenborough"
},
{
name: 1,
email: 1,
"address.city": 1,
_id: 0
}
);

/*
Returns users whose id is greater than 5.

* $gt means greater than.
* name: 1 includes the name field.
* username: 1 includes the username field.
* _id: 0 removes the _id field.
  */

db.users.find(
{
id: { $gt: 5 }
},
{
name: 1,
username: 1,
_id: 0
}
);

/*
INVALID PROJECTION

MongoDB does not allow mixing
included and excluded fields.

This query throws an error.
*/

/*
db.users.find(
{},
{
name: 1,
email: 0
}
);
*/

/*
VALID EXCEPTION

MongoDB allows excluding _id
while including other fields.
*/

db.users.find(
{},
{
name: 1,
email: 1,
_id: 0
}
);
