const express = require('express');
const app = express();
const PORT = 3000;
const request = require('request');
var mysql = require('mysql');

//conversion of numerical into month 
//1 = jan 2 = feb...12 = dec
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


const firebase = require('firebase');
const { get } = require('request');

const firebaseConfig = {
    apiKey: "AIzaSyABF0uaswmr85Y_7HtWS4I7LO_H0n9-lHU",
    authDomain: "cybercitycomics-a9556.firebaseapp.com",
    databaseURL: "https://cybercitycomics-a9556-default-rtdb.firebaseio.com",
    projectId: "cybercitycomics-a9556",
    storageBucket: "cybercitycomics-a9556.appspot.com",
    messagingSenderId: "1085004577049",
    appId: "1:1085004577049:web:3db6e9e8299ffc2d8ded88",
    measurementId: "G-J8BYRN7WMZ"
};

const firebaseApp = firebase.initializeApp(firebaseConfig)
const database = firebaseApp.database();



var pageViewersCount;
var connection;
var isExist;

//connect to database
function connect(){
        connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Public@123',
        database: 'pagecount'
      })
      
      connection.connect();

}

//get 
function getViews(pageNum){
    connection.query("SELECT * FROM pagecount.pagecount WHERE idpagecount="+67+";", function (err, result, fields) {
        if (err) throw err;
        if((Object.values(JSON.parse(JSON.stringify(result)))).length()<=0){
            isExist = false;
        };
        pageViewersCount = Object.values(JSON.parse(JSON.stringify(result)));
      })
}

//set
function setView(){
     // connection.query("INSERT INTO pagecount (idpagecount, valpagecount) VALUES ("+pageNum+", '3');");
  }
  

  






// const firebaseApp = firebase.initializeApp(firebaseConfig)
// const db = firebaseApp.firestore()
// const auth = firebase.auth()


let userCountDB = database.ref();

// userCountDB.set ({
//     0:2,
//     1:4,
//     5:4
//  });

// userCountDB.equalTo("0").on("value", (snap) => {
//     console.log(snap.val());
// });

// userCountDB.once("value").then(snap => {
//     console.log(snap.val()["5"]);
// }).catch(error => {
//     console.log("error".error)
// })


app.get("/", (req, res) => {

    var pageNum = req.params.page;

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
            getViews(pageNum);
            setView(pageViewersCount);


           // get the value of viewers on the current page
            userCountDB.once("value").then(snap => {
                pageViewersCount = (snap.val()[pageNum]);
            }).catch(error => {
                console.log("error".error)
            })


            if (pageViewersCount == undefined) pageViewersCount = 1
            else pageViewersCount++;

            //set the viewers count for the current page 
            // userCountDB.add({
            //     [pageNum]: pageViewersCount
            // });

           
            const data = JSON.parse(body);
            res.render("pages.ejs", {
                data: data,
                month: month[data.month],
                rand: rand(),
                pageViewersCount: pageViewersCount
            });
        }
    })
})


app.get("/:page", (req, res) => {

    var pageNum = req.params.page;
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
            
            let pageData;
            //get the value of viewers on the current page
            userCountDB.once("value").then(snap => {
                pageData = snap.val();
                pageViewersCount = (snap.val()[pageNum]);
            }).catch(error => {
                console.log("error".error)
            })

          
            if (pageViewersCount == undefined) pageViewersCount = 1
            else pageViewersCount++;

            //set the viewers count for the current page 
            userCountDB.push({
                [pageNum]: pageViewersCount
            });

           
            const data = JSON.parse(body);
            res.render("pages.ejs", {
                data: data,
                month: month[data.month],
                rand: rand(),
                pageViewersCount: pageViewersCount
            });
        }
    })
})


function rand() {
    return Math.floor(Math.random() * 2472);
}


app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})