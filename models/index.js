var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cassandra = require('express-cassandra');


//
// app.get('/', function (req, res) {
//  // res.send('Hello World!');
//
// //  var john = new models.instance.Person({
// //     name: "John",
// //     surname: "Doe",
// //     age: 32
// // });
// //   john.saveAsync()
// //     .then(function() {
// //         console.log('Yuppiie!');
// //     })
// //     .catch(function(err) {
// //         console.log(err);
// //     });
//
//   console.log(req.params);
//   models.instance.Person.findOneAsync({name: 'John'})
//     .then(function(john) {
//         res.send('Found ' + john.name + ' to be ' + john.age + ' years old!');
//     })
//     .catch(function(err) {
//         console.log(err);
//     });
// });
//
// app.delete('/', function(req, res){
//   models.instance.Person.delete({name: 'John'});
//   res.send('Deleted');
// });
var port = 3000;        // set our port
app.listen(port);
console.log('Magic happens on port ' + port);

var Cassandra = require('express-cassandra');
var models = Cassandra.createClient({
    clientOptions: {
        contactPoints: ['127.0.0.1'],
        protocolOptions: { port: 9042 },
        keyspace: 'team_maker',
        queryOptions: {consistency: Cassandra.consistencies.one}
    },
    ormOptions: {
        defaultReplicationStrategy : {
            class: 'SimpleStrategy',
            replication_factor: 3
        },
        migration: 'safe',
        createKeyspace: true
    }
});


models.connect(function (err) {
    if (err) throw err;

    var MyModel = models.loadSchema('players', {
        fields:{
          name    : "text",
          nicknames: {
            type: "list",
            typeDef: "<text>"
          },
          age     : "int",
          player_id: {
            type: "uuid",
            default:  {"$db_function": "uuid()"}
          },
          stats: {
            type: "map",
            typeDef: "<text,int>"
          },
          average: "int",
        },
        key:["player_id", "average"]
    }, function(err, UserModel){
        //the table in cassandra is now created
        //the models.instance.Person, UserModel or MyModel can now be used
        console.log(models.instance.players === UserModel);
        console.log(models.instance.players === MyModel);
        var lauty = new MyModel({
          name: "Lautaro Pereyra",
          nicknames: ["Lauty", "Manco", "Chileno"],
          age : 23,
          stats:{"Arquero":7, "Defensor": 7, "Delantero":8},
          average: 7
        });
        lauty.save(function(err){
            if(err) {
                console.log(err);
                return;
            }
            console.log('Yuppiie!');
        });
    });
});

// var foo = models.connect(function (err) {
//     if (err) throw err;
//
//     var MyModel = models.loadSchema('Player', {
//       fields:{
//
//     }, function(err, UserModel){
//         //the table in cassandra is now created
//         //the models.instance.Person, UserModel or MyModel can now be used
//         console.log(models.instance.Player === UserModel);
//         console.log(models.instance.Player === MyModel);
//     });
// });

console.log(models.timeuuid());
// var lauty = new MyModel({
//   name: "Lautaro Pereyra",
//   nicknames: ["Lauty", "Manco", "Chileno"],
//   age : 23,
//   stats:{"Arquero":7, "Defensor": 7, "Delantero":8},
//   average: 7
// });
// var john = new MyModel({
//     name: "John",
//     surname: "Doe",
//     age: 32
// });
// lauty.save(function(err){
//     if(err) {
//         console.log(err);
//         return;
//     }
//     console.log('Yuppiie!');
// });


var router = express.Router();              // get an instance of the express Router


// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!'});

});
