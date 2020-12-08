var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


function isRoomAvailable(conn, check_in, check_out, room) {
  return new Promise((res, rej) => {
    //예약 테이블에서 해당 기간에 해당 객실이 예약 되어있나 확인
    const sql = "SELECT * FROM reservation "
      + "WHERE room_num = ? "
      + "AND ( check_in_date < ? && ? < check_out_date )";
    const params = [room, check_out, check_in];
    conn.query(sql, params, function (err, rows) {
      if (err)
        rej(err);
      else if (rows.length != 0)
        rej(new Error('reserved'));
      else {
        //객실테이블에서 해당 기간에 사용중인지 확인
        const sql = `SELECT * FROM room WHERE num = ? AND (check_in_date < ? && ? < check_out_date)`;
        conn.query(sql, params, function (err, rows) {
          if (err) rej(err);
          else if (rows.length != 0) rej(new Error('Now occupied'));
          else res(true);
        });
      }
    });
  });
}

app.isRoomAvailable = isRoomAvailable;

//객실 목록
app.get('/room/list', function (req, res) {
  var sql = 'SELECT * FROM room';
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

//예약 가능한 룸
app.post('/room/availableRoom', function (req, res) {
  var sql = 'SELECT * FROM room where type_id = ?';
  var params = [req.body.type_id];
  if (req.body.type_id == null) {
    sql = 'SELECT * FROM room';
    params = [];
  }
  conn.query(sql, params, function (err, rows, fields) {
    if (err) {
      res.send(err.message);
      console.log('query is not excuted. select fail...\n' + err);
    }
    else {
      var resArr = [];
      for (var i = 0; i < rows.length; ++i) {
        var r = rows[i];
        if (isRoomAvailable(conn, r.num, r.check_in_date, r.check_out_date))
          resArr.push(r);
      }
      res.status(200).send(resArr);
      console.log(resArr);
    }
  });
});

//객실 추가
app.post('/room/add', function (req, res) {
  var body = req.body;
  console.log(body);

  var sql = 'INSERT INTO room (num, type_id) VALUES(?, ?)';
  var params = [body.num, body.type_id];
  console.log(sql);
  conn.query(sql, params, function (err) {
    if (err) console.log('query is not excuted. insert fail…\n' + err);
    else res.status(200);
  });

});

//객실 등급 정보
app.get('/room/info', function (req, res) {
  var sql = 'SELECT * FROM room_info';
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

//객실 정보 수정
app.post('/room/modify', function (req, res) {
  var body = req.body;

  var fields = "";
  var index = 0;
  var params = [];
  var count = Object.keys(body).length - 1;
  console.log(body);
  for (var o in body) {
    if (o == 'num') continue;
    fields += o + " = ? ";
    params[index++] = body[o];
    if (index < count)
      fields += ", "
  }

  var sql = "UPDATE room SET " + fields
    + "WHERE num = ?";
  params[index] = body.num;
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

//객실 삭제
app.delete('/room/delete', function (req, res) {
  var body = req.body;
  var sql = "DELETE FROM room WHERE num = ?";
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