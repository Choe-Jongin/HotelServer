var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

//서버 정보
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

//이미지
app.use(express.static(__dirname+"/publicimage"));

//로그인
app.post('/login', async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  if(id.length === 0 || password.length === 0) {
    res.sendStatus(403);
    return;
  }

  conn.query('SELECT * FROM account WHERE id = ?', id, (err, rows) => {
    if(!!err || rows.length !== 1) {
      res.sendStatus(403);
      return;
    }

    const row = rows[0];
    if(row.password !== password) {
      res.sendStatus(403);
      return;
    }

    res.status(200).send({'auth': row.auth});
  });
});

//예약 추가
app.post('/reservation/add', async (req, res) => {
  const customer_id = req.body.customerId;
  const room_number = req.body.roomNumber;
  const check_in_date = req.body.checkInDate;
  const check_out_date = req.body.checkOutDate;

  if(!customer_id || !room_number || !check_in_date || !check_out_date) {
    res.sendStatus(403);
    return;
  }

  conn.beginTransaction(err => {
    if(!!err) {
      res.sendStatus(403);
      conn.rollback();
      return;
    }

    conn.query(
      `SELECT * FROM reservation WHERE ? = room_num AND (? < check_out_date AND ? >= check_in_date)`,
      [room_number, check_in_date, check_out_date], (err, rows) => {
        if(!!err || rows.length !== 0) {
          res.sendStatus(403);
          conn.rollback();
          return;
        }

        conn.query(
          `SELECT * FROM room WHERE ? = num AND (? < check_out_date AND ? >= check_in_date)`,
            [room_number, check_in_date, check_out_date], (err, rows) => {
            if(!!err || rows.length !== 0) {
              res.sendStatus(403);
              conn.rollback();
              return;
            }

            conn.query(
              `INSERT INTO reservation(customer_id, room_num, check_in_date, check_out_date) VALUES(?, ?, ?, ?)`,
              [customer_id, room_number, check_in_date, check_out_date], (err, rows) => {
                if(!!err) {
                  res.sendStatus(403);
                  conn.rollback();
                  return;
                }

                conn.commit(err => {
                  if(!!err) {
                    res.sendStatus(403);
                    conn.rollback();
                    return;
                  }

                  res.status(200).send('succeed');
                });
              }
            );
          }
        );
      }
    )
  });
});

app.post('/reservation/listbytype', function (req, res) {
    var body = req.body;
    console.log(body);
  
    var sql = 'SELECT *FROM reservation INTO room (num, type) VALUES(?, ?)';
    var params = [body.num, body.type];
    console.log(sql);
    conn.query(sql, params, function(err) {
      if(err) console.log('query is not excuted. insert fail…\n' + err);
      else res.redirect('/list');
    });
});









//요청 및 응답
app.get('/', (req, res) => {
  res.send('Root');
});

//객실정보
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

//객실 추가
app.post('/room/add', function (req, res) {
  var body = req.body;
  console.log(body);

  var sql = 'INSERT INTO room (num, type) VALUES(?, ?)';
  var params = [body.num, body.type];
  console.log(sql);
  conn.query(sql, params, function(err) {
    if(err) console.log('query is not excuted. insert fail…\n' + err);
    else res.redirect('/list');
  });
});

//객실 등급(종류)별 정보
app.get('/room/info', function (req, res) {
    var sql = 'SELECT * FROM room_info';
    conn.query(sql, function (err, rows, fields) {
        if(err) {
            res.send(err.message);
            console.log('query is not excuted. select fail...\n' + err);
        }
        else{
            res.status(200).send(rows);
            console.log(rows.toString);
        }
    });
});

//서버 시작
app.listen(port, function(){
  console.log('server start :'+port);
});

process.on('uncaughtException', function(error) {
  console.log('알수 없는 에러 발생!!!!');
});