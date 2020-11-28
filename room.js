module.exports = {
  "connect": (app, conn) => {
    //객실정보
    app.get('/room/status', function (req, res) {
      var sql = 'SELECT * FROM room';
      conn.query(sql, function (err, rows, fields) {
        if (err) {
          res.send(err.message);
          console.log('query is not excuted. select fail...\n' + err);
        }
        else {
          res.send(rows);
          console.log(rows);
        }
      });
    });
  
    /*
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
    */
  
    //객실 등급(종류)별 정보
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
  },
  'isRoomAvailable': function(conn, check_in, check_out, room) {
    console.log(conn);
    return new Promise((res, rej) => {
      //예약 테이블에서 해당 기간에 해당 객실이 예약 되어있나 확인
      const sql = "SELECT * FROM reservation "
        + "WHERE room_num = ? "
        + "AND (? < check_in_date OR check_out_date < ?)";
      const params = [room, check_out, check_in];
      conn.query(sql, params, function (err, rows) {
        if (err) rej(err);
        else if (rows.length === 0) rej(new Error('reserved1'));
        else
        {
          //객실테이블에서 해당 기간에 사용중인지 확인
          const sql = `SELECT * FROM room WHERE num = ? AND (? < check_in_date OR check_out_date < ?)`;
          conn.query(sql, params, function (err, rows) {
            if (err) rej(err);
            else if (rows.length === 0) rej(new Error('reserved2'));
            else res(true);
          });
        }
      });
    });
  }
}