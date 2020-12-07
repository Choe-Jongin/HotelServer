var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//요구사항 목록
app.get('/requirements/list', function (req, res) {
    var sql = 'SELECT * FROM requirements';
    conn.query(sql, function (err, rows, fields) {
        if (err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else {
            res.status(200).send(rows);
            console.log(rows);
        }
    });
});

//요구사항 추가
app.post('/requirements/add', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'INSERT INTO requirements (room_num, request_type, importance, remark) VALUES(?, ?, ?)';
    var params = [body.room_num, body.type, body.importance, body.remark];
    console.log(sql);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. insert fail…\n' + err);
        else res.status(200).send("{request_id:" + result.insertId + "}");
    });
});

//요구사항 종류
app.get('/requirements/type', function (req, res) {
    var sql = 'SELECT * FROM requirements_type';
    conn.query(sql, function (err, rows, fields) {
        if (err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else {
            res.status(200).send(rows);
            console.log(rows);
        }
    });
});


//요구사항과 직원 매칭
app.post('/requirements/match', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'INSERT INTO requirements_staff (staff_id, requirements_id) VALUES(?, ?)';
    var params = [body.staff_id, body.requirements_id];
    console.log(sql);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. insert fail…\n' + err);
        else res.status(200).send("{matching_id:" + result.insertId + "}");
    });
});

//직원이 할당된 요구사항
app.get('/requirements/matched', function (req, res) {
    var sql = 'SELECT * FROM requirements_staff';
    conn.query(sql, function (err, rows, fields) {
        if (err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else {
            res.status(200).send(rows);
            console.log(rows);
        }
    });
});

//요구사항과 해결
app.post('/requirements/solve', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = "UPDATE requirements SET solved = 1 WHERE request_id = ?";
    conn.query(sql, body.request_id, function (err, result) {
        if (err) {
            res.status(403).end();
            console.log('query is not excuted. update fail…\n' + err);
        }
        else {
            res.status(200).end("{result:solved}");
        }
    });
});



module.exports = app;