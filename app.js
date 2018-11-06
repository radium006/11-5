const port = 3000
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const connectionString = "postgres://localhost:5432/blogsdb"
app = express()
const db = pgp(connectionString)

app.use(bodyParser.urlencoded({
    extended: false
}))

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')


app.post('/delete', function(req, res){
    let blogid = req.body.blogid

    db.none('DELETE FROM blogposts WHERE blogid = $1;',[blogid]).then(function(){
        res.redirect('/posts')
    }).catch(function(error){
        console.log(error)
    })
})

app.post('/editpost', function(req, res){
    let title = req.body.title
    let date = req.body.date
    let entry = req.body.entry
    let blogid = req.body.blogid
    console.log(title)
    console.log(date)
    console.log(entry)
    console.log(blogid)
    db.none('UPDATE blogposts SET blogtitle = $1, blogentry = $2, blogdate = $3 WHERE blogid = $4', [title, entry, date, blogid])
    .then(function(){
        res.redirect("/posts")
    })
    .catch(function(error){
        console.log(error)
    })

})

app.get('/posts/update/:blogid', function(req,res){
    let blogid = req.params.blogid
    db.one('SELECT blogid, blogdate, blogtitle, blogentry FROM blogposts WHERE blogid = $1', [blogid])
    .then(function(result){
        console.log(result)
        res.render('edit-post', result)
    })
    
})

app.post("/posts", function (req, res) {
    
    let title = req.body.title
    let date = req.body.date
    let entry = req.body.entry

    db.none('INSERT INTO blogposts(blogdate, blogtitle, blogentry) VALUES($1, $2, $3)', [date, title, entry])
    .then(function(){
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
    res.redirect('/posts')
})

app.get('/posts', function (req, res) {
    db.any('SELECT blogid,blogdate,blogtitle,blogentry FROM blogposts;')
    .then(function(result){
         res.render('posts', {blogposts : result})
    })
   
})

app.listen(port, function (req, res) {
    console.log("Server is running...")
})