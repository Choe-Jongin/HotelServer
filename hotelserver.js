var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');


//서버 정보
var port = 5000;

//DB정보
var conn = mysql.createConnection({
  host: 'hotel.cgapmdvczori.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'hoteladmin',
  database: 'hotel'
})

global.conn = conn;


//파일 분리
var room = require('./room');
var reservation = require('./reservation');
var staff = require('./staff');


//서버 객체 설정
var app = express();
app.set('port', process.env.PROT || port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//분리한 파일 사용
app.use(room);
app.use(reservation);
app.use(staff);

//이미지
app.use(express.static(__dirname + "/publicimage"));

//#######요청 및 응답#######
app.get('/', (req, res) => {
  // res.send('Hotel Server Root');
  res.send({result:'Hotel Server Root'});
});


//로그인
app.post('/login', async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  console.log("id:"+id +" pw:"+password);
  if (id.length === 0 || password.length === 0) {
    res.sendStatus(404);
    return;
  }

  conn.query('SELECT * FROM account WHERE id = ?', id, (err, rows) => {
    if (!!err || rows.length !== 1) {
      res.sendStatus(404);
      return;
    }

    const row = rows[0];
    console.log(row);
    if (row.password !== password+"") {
      res.sendStatus(403);
      return;
    }

    res.status(200).send({ 'name':row.cardnum ,'authority': row.Authority,'cardnum':row.cardnum });
  });
});


//서버 시작
app.listen(port, function () {
  console.log('server start :' + port);
});

process.on('uncaughtException', function (error) {
  console.log('알수 없는 에러 발생!!!!');
});