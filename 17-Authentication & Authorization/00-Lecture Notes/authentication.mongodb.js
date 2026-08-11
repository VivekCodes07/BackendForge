// To enable authorization (go to mongodb.config)
// security:
//      authorization: enabled

/*
    1. Create User

     db.createUser({
        user: 'admin', 
        password: 0412, 
        roles: [{role: 'root', db: 'admin'}]
        })

    2. To check users:
        db.getUsers()

    3. To login:
        db.auth('user', 'password')

    4. Created another user:

         db.createUser({
         user: "Vivek", 
         pwd: "html0412", 
         roles: [{role: 'read', db: 'test'}]
         })
*/