var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var room = require('./room');

//예약 목록
app.get('/reservation/list', function (req, res) {
    var sql = 'SELECT * FROM reservation';
    conn.query(sql, function (err, rows, fields) {
        if (err) {
            res.send(err.message);
            console.log('query is not excuted. select fail\n' + err);
        }
        else {
            res.status(200).send(rows);
            console.log(rows);
        }
    });
});

//예약 추가
app.post('/reservation/add', async (req, res) => {
    const guest_id = req.body.guest_id || "walk in";
    const room_num = req.body.room_num;
    const check_in_date = req.body.check_in_date;
    const check_out_date = req.body.check_out_date;
    const staff_id = req.body.staff_id || 0;
    const add_person = req.body.add_person || 0;

    if (!guest_id || !room_num || !check_in_date || !check_out_date) {
        res.sendStatus(403);
        return;
    }
    room.isRoomAvailable(conn, room_num,check_in_date, check_out_date)
    .then(() => {
        console.log("available");
        var sql = "INSERT INTO reservation "
            + "(guest_id, room_num, check_in_date, check_out_date, staff_id, add_person) "
            + "VALUES(?, ?, ?, ?, ?, ?)";
        var params = [guest_id, room_num, check_in_date, check_out_date, staff_id, add_person];
        conn.query(sql, params, (err, result) => {
            if (!!err) {
                console.log(err)
                res.sendStatus(403);
                conn.rollback();
                return;
            }

            conn.commit(err => {
                if (!!err) {
                    res.sendStatus(403);
                    conn.rollback();
                    return;
                }
                console.log("add reservation")
                res.status(200).send("{reservation_id:" + result.insertId + "}");
            });
        });

    }).catch(err => {
        res.status(403).send("{result:"+(err.message)+"}");
        conn.rollback();
        console.log(err.message);
    });
});

//예약 삭제
app.delete('/reservation/delete', function (req, res) {
    var body = req.body;
    var sql = "DELETE FROM reservation WHERE reservation_id = ?";
    var param = body.reservation_id;
    console.log(sql);
    conn.query(sql, param, function (err, result) {
        if (err) {
            console.log('query is not excuted. delete fail…\n' + err);
            res.status(404).end({"err":err});
        }
        else {
            console.log("Delete " + param);
            res.status(200).end({result:"deleted"});
        }
    });
});

module.exports = app;