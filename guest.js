var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//고객 목록
app.get('/guest/list', function (req, res) {
    var sql = 'SELECT * FROM guest';
    conn.query(sql, function (err, rows, fields) {
        if (err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else {
            res.status(200).send(rows);
        }
    });
});

//고객 정보
app.post('/guest/guestbyid', function (req, res) {
    var sql = 'SELECT * FROM guest where guest_id = ?';
    conn.query(sql, req.body.guest_id, function (err, rows, fields) {
        if (err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else if( rows.length == 0 ){
            res.status(404).end();
        }
        else {
            console.log(rows[0]);
            res.status(200).send(rows[0]);
        }
    });
});

//고객 추가
app.post('/guest/add', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'INSERT INTO guest '
        + '(guest_name, phone_num, guest_grade) '
        + 'VALUES(?,?,?) ';
    var params = [body.guest_name, body.phone_num, body.guest_grade];

    console.log(sql);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. insert fail…\n' + err);
        else {
            res.status(200).send("{guest_id:" + result.insertId + "}");
        }
    });
});

//고객 정보 수정
app.post('/guest/modify', function (req, res) {
    var body = req.body;

    fields = "";
    var index = 0;
    var params = [];
    var count = Object.keys(body).length - 1;
    console.log(body);
    for (var o in body) {
        if (o == 'guest_id') continue;
        fields += o + " = ? ";
        params[index++] = body[o];
        if (index < count)
            fields += ", "
    }

    var sql = "UPDATE guest SET " + fields
        + "WHERE guest_id = ?";
    params[index] = body.guest_id;
    console.log(sql);
    console.log(params);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. update fail…\n' + err);
        else {
            res.status(200).end();
        }
    });
});

//고객 삭제
app.delete('/guest/delete', function (req, res) {

    var body = req.body;
    var sql = "DELETE FROM guest WHERE guest_id = ?";
    var param = body.guest_id;
    console.log(sql);
    conn.query(sql, param, function (err, result) {
      if (err) {
        console.log('query is not excuted. delete fail…\n' + err);
        res.status(404).end("{err:" + err + "}");
      }
      else {
        console.log("Delete " + param);
        res.status(200).end({result:"deleted"});
      }
    });
    
});

module.exports = app;