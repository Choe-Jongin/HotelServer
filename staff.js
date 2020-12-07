var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//직원 목록
app.get('/staff/list', function (req, res) {
    var sql = 'SELECT * FROM staff';
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

//직원 정보
app.post('/staff/staffbyid', function (req, res) {
    var sql = 'SELECT * FROM staff where staff_id = ?';
    conn.query(sql, req.body.staff_id, function (err, rows, fields) {
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

//직원 추가
app.post('/staff/add', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'INSERT INTO staff '
        + '(staff_name, gender, position, department_name, facility_name, annual_salary) '
        + 'VALUES(?,?,?,?,?,?) ';
    var params = [body.staff_name, body.gender, body.position, body.department_name, body.facility_name, body.annual_salary];

    console.log(sql);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. insert fail…\n' + err);
        else {
            res.status(200).send("{staff_id:" + result.insertId + "}");
        }
    });
});

//직원 정보 수정
app.post('/staff/modify', function (req, res) {
    var body = req.body;

    fields = "";
    var index = 0;
    var params = [];
    var count = Object.keys(body).length - 1;
    console.log(body);
    for (var o in body) {
        if (o == 'staff_id') continue;
        fields += o + " = ? ";
        params[index++] = body[o];
        if (index < count)
            fields += ", "
    }

    var sql = "UPDATE staff SET " + fields
        + "WHERE staff_id = ?";
    params[index] = body.staff_id;
    console.log(sql);
    console.log(params);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. update fail…\n' + err);
        else {
            res.status(200).end();
        }
    });
});

//직원 삭제
app.delete('/staff/delete', function (req, res) {
    var body = req.body;
    var sql = "DELETE FROM staff WHERE staff_id = ?";
    var param = body.staff_id;
    console.log(sql);
    conn.query(sql, param, function (err, result) {
        if (err) {
            res.status(404).end("{err:" + err + "}");
            console.log('query is not excuted. delete fail…\n' + err);
        }
        else {
            console.log("Delete " + param);
            res.status(200).end();
        }
    });
});

module.exports = app;