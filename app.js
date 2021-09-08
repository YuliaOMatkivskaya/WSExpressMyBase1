const express = require('express'),
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http)

const sql = require('mssql/msnodesqlv8');

let config = {
  database: 'ObjectBase',
  server: 'WIN-E9LHOG4OUEE\\SQLEXPRESS',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

const host = '127.0.0.1'
const port = 7000

let clients = []
let table;

function getCord() {
  return new Promise((resolve, reject) => {
    // Create instence of connection
    let conn = new sql.ConnectionPool(config);
    let req = new sql.Request(conn);
    // Connecting to database
    conn.connect(function (err) {
      if (err) {
        console.log(err);
        return;
      }
      // Getting result
      let queryString = "select TableOfObj.title,(select name, date from planning where Planning_id = TableOfObj.Planning_id for json auto) as planning, (select name, date from doing where Doing_id = TableOfObj.Doing_id for json auto) as doing from TableOfObj for json auto";
      req.query(queryString, function (err, recordSet) {
        if (err) {
          console.log(err);
          return;
        } else {
          table = recordSet.recordset;
          let myJson = Object.values(table[0])
          io.on('connection', (socket) => {
            console.log(`Client with id ${socket.id} connected`)
            clients.push(socket.id)

            socket.emit('message', myJson)

            socket.on('message', (message) =>
              console.log('Message: ', message)
            )

            socket.on('disconnect', () => {
              clients.splice(clients.indexOf(socket.id), 1)
              console.log(`Client with id ${socket.id} disconnected`)
            })
          
          //разрыв соединения сразу после соединения (при этом после отправки данных)
          //это чтобы не было повторного вывода данных
            setTimeout(() => socket.disconnect());
  
          })

          app.use(express.static(__dirname))

          app.get('/', (req, res) => res.render('index'))

          //получение количества активных клиентов
          app.get('/clients-count', (req, res) => {
            res.json({
              count: io.clients().server.engine.clientsCount,
            })
          })

          //отправка сообщения конкретному клиенту по его id
          /*app.post('/client/:id', (req, res) => {
            if (clients.indexOf(req.params.id) !== -1) {
              io.sockets.connected[req.params.id].emit(
                'private message',
                `Message to client with id ${req.params.id}`
              )
              return res
                .status(200)
                .json({
                  message: `Message was sent to client with id ${req.params.id}`,
                })
            } else
              return res
                .status(404)
                .json({ message: 'Client not found' })
          })
          */
          http.listen(port, host, () =>
            console.log(`Server listens http://${host}:${port}`))
        }
        conn.close();
        resolve(true);
      });
    });
  });
}

getCord()