//imports
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const request = require('request');
var mysql = require('mysql');

app.use(express.static('public'));

//conversion of numerical into month 
//1 = jan 2 = feb...12 = dec
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//declare global variables
var pageNum;
var pageViewersCount;
var connection;
var isExist;
//connect to database
function connect() {

    connection = mysql.createConnection({
        host: 'sql5.freemysqlhosting.net',
        user: 'sql5417599',
        password: 'VDUZuY3LHh',
        database: 'sql5417599'
    });
    //wanted to use .env file for storing these details but my sql server didnt permit me to use authentication according to my plan :(
    connection.connect();

}

//get total views on a page from database
function getViews(pageNum) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM pagecount WHERE idpagecount=" + pageNum + ";", function (err, result, fields) {
            if (err) throw err;

            if ((Object.values(JSON.parse(JSON.stringify(result)))).length <= 0) {      //first time access
                isExist = false;
                pageViewersCount = 1;
            }
            else {
                isExist = true;
                pageViewersCount = Object.values(JSON.parse(JSON.stringify(result)))[0]["valpagecount"] + 1;
            }
            resolve();
        })
    })

}

//set number of views in the database
function setView(pageNum) {
    if (isExist) {
        connection.query("UPDATE pagecount SET valpagecount =" + pageViewersCount + "  WHERE idpagecount =" + pageNum + " ;")
    }
    else {
        connection.query("INSERT INTO pagecount (idpagecount, valpagecount) VALUES (" + pageNum + ", '" + pageViewersCount + "');");
    }
    isExist = false;
}

app.use(ignoreFavicon);

//homepage will be 1st page
app.get("/", (req, res) => {

    pageNum = 1;

    //fetch from <api>

    request(`http://xkcd.com/1/info.0.json`, (error, response, body) => {
        if (error) {
            console.log(`Error: ${error}`);
        }
        else if (response.statusCode != 200) {
            res.render("404.ejs");
        }
        else {

            connect();
            getViews(pageNum)
                .then(res => {
                    setView(pageNum);
                })
                .then(() => {
                    const data = JSON.parse(body);
                    var transcript = renderTranscript(data.transcript);
                    transcript = transcript.slice(0, transcript.indexOf("{{"));
                    var title = renderTitle(data.transcript.slice(data.transcript.indexOf("{{"), data.transcript.length));
                    res.render("pages.ejs", {
                        data: data,
                        month: month[data.month],
                        rand: rand(),
                        pageViewersCount: pageViewersCount,
                        transcript: transcript,
                        title: title
                    });
                });

        }
    })
})


//for all other pages
app.get("/:page", (req, res) => {

    var pageNum = parseInt(req.params.page);
    //fetch from api
    request(`http://xkcd.com/${pageNum}/info.0.json`, (error, response, body) => {
        if (error) {
            console.log(`Error: ${error}`);
        }
        else if (response.statusCode != 200) {
            res.render("404.ejs", {
                page: pageNum
            })
        }
        else {

            connect();
            getViews(pageNum)
                .then(res => {
                    setView(pageNum);
                })
                .then(() => {
                    const data = JSON.parse(body);
                    var transcript = renderTranscript(data.transcript);
                    transcript = transcript.slice(0, transcript.indexOf("{{"));
                    var title = renderTitle(data.transcript.slice(data.transcript.indexOf("{{"), data.transcript.length));
                    res.render("pages.ejs", {
                        data: data,
                        month: month[data.month],
                        rand: rand(),
                        pageViewersCount: pageViewersCount,
                        transcript: transcript,
                        title: title
                    });
                })


        }
    })
})

//for random page
function rand() {
    return Math.floor(Math.random() * 2472);
}

//function to make transcript legible before rendering
const renderTranscript = (transcript) => {
    const notationList = {
        '[[': '****<i>',
        ']]': '</i>****',
        '<<': '<i>',
        '>>': '</i>',
        '\n': '<br/>',
        '"': '\\"'
    }
    const str = transcript.replace(/\[\[|\]\]|<<|>>|\n|"/gi, (matched) => {
        return notationList[matched]
    });

    return str;
}

//function to make transcript legible before rendering
const renderTitle = (title) => {
    const notationList = {
        '{{': '<b>',
        '}}': '</b>'
    }
    const str = title.replace(/{{|}}|"/gi, (matched) => {
        return notationList[matched]
    });

    return str;
}

//function to deal with favicon requests
function ignoreFavicon(req, res, next) {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end()
    }
    next();
}

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})