var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//부서 목록
app.get('/department/list', function (req, res) {
    var sql = 'SELECT * FROM department';
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

//부서 추가
app.post('/department/add', function (req, res) {
    var body = req.body;
    console.log(body);

    var sql = 'INSERT INTO department (department_name, budget, performance) VALUES(?, ?, ?)';
    var params = [body.department_name, body.budget, body.performance];
    console.log(sql);
    conn.query(sql, params, function (err, result) {
        if (err) console.log('query is not excuted. insert fail…\n' + err);
        else res.status(200).send("{request_id:" + result.insertId + "}");
    });
});

//부서 정보 수정
app.post('/department/modify', function (req, res) {
    var body = req.body;
  
    var fields = "";
    var index = 0;
    var params = [];
    var count = Object.keys(body).length - 1;
    console.log(body);
    for (var o in body) {
      if (o == 'department_id') continue;
      fields += o + " = ? ";
      params[index++] = body[o];
      if (index < count)
        fields += ", "
    }
  
    var sql = "UPDATE department SET " + fields
      + "WHERE department_id = ?";
    params[index] = body.department_id;
    console.log(sql);
    console.log(params);
    conn.query(sql, params, function (err, result) {
      if (err) {
        res.status(403).end();
        console.log('query is not excuted. update fail…\n' + err);
      }
      else {
        res.status(200).end("{result:modified}");
      }
    });
  });
  
  //부서 삭제
  app.delete('/department/delete', function (req, res) {
    var body = req.body;
    var sql = "DELETE FROM department WHERE department_id = ?";
    var param = body.num;
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