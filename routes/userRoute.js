const app = require("express");
const router = app.Router();
const bodyparser = require("body-parser")
const con = require('../config/dbcon')
const {
  hash,
  compare
} = require("bcrypt");
const {
  json
} = require("body-parser");

// get all users 
router.get("/", (req, res) => {
  const strQry = `SELECT * FROM users`;

  con.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      results: results,
      msg: "users fetched"
    });
  });
});

// get one user
router.get("/:id", (req, res) => {
  const strQry = `SELECT * FROM users WHERE id = ${req.params.id}`;

  con.query(strQry, (err, results) => {
    if (err) throw err;
    res.json({
      results: results,
      msg: "single user fetched"
    });
  });
});

//Register 
router.post("/", bodyparser.json(), async (req, res) => {
  try {
    const user = req.body
    if ((user.usertype === "") || (user.usertype === null)) {
      user.usertype = "user"
    }
    let emailCheck = `SELECT * FROM users WHERE email = '${user.email}';`
    con.query(emailCheck, async (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        res.json({
          msg: "Email already in use"
        })
      } else {
        // adding to db
        const strQry = `INSERT INTO users (username, email, usertype, password) VALUES(?, ?, ?, ?);`;
        user.password = await hash(user.password, 10);
        con.query(strQry, [user.username, user.email, user.usertype, user.password], async (err, results) => {
          if (err) throw err;
          res.json({
            results: results,
            msg: "Registration Successful"
          })
        })
      }
    })
  } catch (error) {
    res.status(400).json({
      error
    })
  }
})

// login
router.patch("/", bodyparser.json(), async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body
    const strQry = `SELECT * FROM users WHERE email = '${email}'`;

    con.query(strQry, async (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        res.json({
          msg: "email not found"
        })
      } else {
        const isMatch = await compare(password, results[0].password);
        if (isMatch === true) {
          const payload = {
            user: {
              id: results[0].id,
              username: results[0].username,
              email: results[0].email,
              usertype: results[0].usertype,
            }
          }
          res.json({
            results: payload.user,
            msg: "Login Successful"
          })
        } else {
          res.json({
            msg: "Password Incorrect"
          })
        }
      }
    })

  } catch (error) {
    res.status(400).json({
      error
    })
  }
})


module.exports = router