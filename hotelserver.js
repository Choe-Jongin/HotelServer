var express = require('express');
var http = require('http'); 
var mysql = require('mysql');
var bodyParser = require('body-parser');
const send = require('send');

//서버 정보
//var host = '192.168.0.4';//jonginfi.iptime.org
var port = 5000;

//DB정보
var conn = mysql.createConnection({
    host:'hotel.cgapmdvczori.ap-northeast-2.rds.amazonaws.com',
    user:'admin',
    password:'hoteladmin',
    database:'hotel'
})


//서버 객체 설정
var app = express();
app.set('port', process.env.PROT || port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));


//요청 및 응답
app.get('/', (req, res) => {
    res.send('Root');
});

app.get('/room/status', function (req, res) {
    var sql = 'SELECT * FROM room';
    conn.query(sql, function (err, rows, fields) {
        if(err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else{
            res.send(rows);
            console.log(rows);
        }
    });
});


app.post('/room/add', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'INSERT INTO room (num, type) VALUES(?, ?)';
    var params = [body.num, body.type];
    console.log(sql);
    conn.query(sql, params, function(err) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else res.redirect('/list');
    });
});


app.listen(port, function(){
    console.log('server start :'+port);
});

process.on('uncaughtException', function(error) {
    console.log('알수 없는 에러 발생!!!!');
});