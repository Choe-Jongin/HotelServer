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
  database: 'hotel',
  dateStrings: 'date'
})
global.conn = conn;


//분리한 파일 로드
var room = require('./room');
var reservation = require('./reservation');
var staff = require('./staff');
var requirements = require('./requirements');
var department = require('./department');
var guest = require('./guest');

//서버 객체 설정
var app = express();
app.set('port', process.env.PROT || port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//분리한 파일 사용
app.use(room);
app.use(reservation);
app.use(staff);
app.use(requirements);
app.use(department);
app.use(guest);

//리소스
app.use(express.static(__dirname + "/publicimage"));
app.use(express.static(__dirname + "/Asset"));

//#######요청 및 응답#######
app.get('/', (req, res) => {
  // res.send('Hotel Server Root');
  res.send({result:'Hotel Server Root'});
});

//로그인
app.post('/login', async (req, res) => {
  var body = req.body;
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

    res.status(200).send({ 'name':row.name ,'authority': row.authority,'cardnum':row.cardnum });
  });
});

//회원가입
app.post('/login/register', async (req, res) => {
  var body = req.body;
  const id = req.body.id+"";
  const password = req.body.password+"";
  const name = req.body.name+"";
  const authority = req.body.authority || 0;
  const cardnum = req.body.cardnum || '0000';
  console.log(body);
  if (id.length === 0 || password.length === 0 || name.length === 0) {
    res.status(401).send({ 'result':'아이디 or 비밀번호 or 이름 미입력' });
    console.log("아이디 or 비밀번호 or 이름 미입력")
    return;
  }
  conn.query('SELECT * FROM account WHERE id = ?', id, (err, rows) => {
    if (!!err || rows.length !== 0) {
      res.status(403).send({ 'result':'이미 존재하는 아이디' });
      console.log("이미 존재하는 아이디")
      return;
    }
    conn.query('INSERT INTO account VALUES(?,?,?,?,?)',[id, password, name, authority,cardnum] , (err, rows) => {
      if (!!err) {
        console.log(err);
        res.status(402).send({ 'result':'가입 실패' });
        console.log("가입 실패");
        return;
      }
      console.log(name+" 회원가입");
      res.status(200).send({ 'result':name+'님 계정 생성' });
    });
  });
});

//계정 정보 수정
app.post('/login/modify', function (req, res) {
  var body = req.body;

  var fields = "";
  var index = 0;
  var params = [];
  var count = Object.keys(body).length - 1;
  console.log(body);
  for (var o in body) {
    if (o == 'id') continue;
    fields += o + " = ? ";
    params[index++] = body[o];
    if (index < count)
      fields += ", "
  }

  var sql = "UPDATE account SET " + fields
    + "WHERE id = ?";
  params[index] = body.id;
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


//서버 시작
app.listen(port, function () {
  console.log('server start :' + port);
});

process.on('uncaughtException', function (error) {
  console.log('알수 없는 에러 발생!!!!');
});