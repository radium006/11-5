const port = 3000
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogsdb"
app = express()
var session = require('express-session')
const db = pgp(connectionString)

app.use(bodyParser.urlencoded({
    extended: false
}))

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')

app.use(session({
    secret: 'cat',
    resave: false,
    saveUninitialized: false
}))

let users = [{
    username: "kevin",
    password: "1234"
}]


app.post('/delete', function (req, res) {
    let blogid = req.body.blogid

    db.none('DELETE FROM blogposts WHERE blogid = $1;', [blogid]).then(function () {
        res.redirect('/posts')
    }).catch(function (error) {
        console.log(error)
    })
})

app.use(express.static('css'))

app.post('/editpost', function (req, res) {
    let title = req.body.title
    let date = req.body.date
    let entry = req.body.entry
    let blogid = req.body.blogid
    console.log(title)
    console.log(date)
    console.log(entry)
    console.log(blogid)
    db.none('UPDATE blogposts SET blogtitle = $1, blogentry = $2, blogdate = $3 WHERE blogid = $4', [title, entry, date, blogid])
        .then(function () {
            res.redirect("/posts")
        })
        .catch(function (error) {
            console.log(error)
        })

})

app.get('/posts/update/:blogid', function (req, res) {
    let blogid = req.params.blogid
    db.one('SELECT blogid, blogdate, blogtitle, blogentry, blogauthor FROM blogposts WHERE blogid = $1', [blogid])
        .then(function (result) {
            console.log(result)
            res.render('edit-post', result)
        })

})

app.post("/posts", function (req, res) {

    let title = req.body.title
    let date = req.body.date
    let entry = req.body.entry

    db.none('INSERT INTO blogposts(blogdate, blogtitle, blogentry, blogauthor) VALUES($1, $2, $3, $4)', [date, title, entry, req.session.username])
        .then(function () {
            res.redirect('/posts')
        })
        .catch(function (error) {
            console.log(error)
        })

})

app.get('/posts/new', function (req, res) {
    res.render('add-post')
})

app.get('/', function (req, res) {
    if (req.session.username) {
        res.redirect('/posts')
    } else {
        res.redirect('/login')
    }

})

app.get('/login', function (req, res) {
    res.render('login')
    console.log(users)
})

app.post('/login', function (req, res) {
    let username = req.body.username
    let password = req.body.password

    let user = users.find(function (user) {
        return user.username == username && user.password == password
    })
    if (user != null) {
        console.log('USER FOUND')
        if (req.session) {
            req.session.username = username
            res.redirect('/')
        }
    } else {
        
        console.log("ERROR, USER NOT FOUND")
        res.redirect('/login')
    }
})

app.get('/posts', function (req, res) {

    if (req.session.username) {
        let username = req.session.username
        console.log(req.session)
        db.any('SELECT blogid,blogdate,blogtitle,blogentry, blogauthor FROM blogposts;')
            .then(function (result) {
                res.render('posts', {
                    blogposts: result,
                    username: username
                })
            })
    } else {
        res.redirect('/login')
    }

})

app.post('/logout', function(req, res){
    req.session.destroy()
    res.redirect('/login')
})

app.post('/register', function (req, res) {
    let username = req.body.username
    let password = req.body.password

    users.push({
        username: username,
        password: password
    })

    console.log("USER ACCOUNT CREATED")
  

    res.redirect("/login")
})

app.listen(port, function (req, res) {
    console.log("Server is running...")
})