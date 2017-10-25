// SETUP
// =============================================================================


var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var cassandra = require('express-cassandra');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 3000;


var models = cassandra.createClient({
    clientOptions: {
        contactPoints: ['127.0.0.1'],
        protocolOptions: { port: 9042 },
        keyspace: 'sistema_inscripcion',
        queryOptions: {consistency: cassandra.consistencies.one}
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

    var MyModel = models.loadSchema('cursos', {
        fields:{
          materia    : "text",
          id_curso     : "int",
          titular    : "text",
        },
        key:["materia", "id_curso"]
    }, function(err, UserModel){
        console.log(models.instance.cursos === UserModel);
        console.log(models.instance.cursos === MyModel);
    });

    var MyModel2 = models.loadSchema('inscripciones', {
        fields:{
          id_curso     : "int",
          padron    : "int",
        },
        key:["id_curso", "padron"]
    }, function(err, UserModel){
        console.log(models.instance.inscripciones === UserModel);
        console.log(models.instance.inscripciones === MyModel2);
    });
});


var router = express.Router();
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

// test route to make sure everything is working (accessed at GET http://localhost:3000/api)
router.get('/', function(req, res) {
    res.json({ message: 'Api de cursos e inscripciones'});
});


router.route('/cursos')
    .get(function(req, res){
      console.log("Buscando en base todos los cursos");
      models.instance.cursos.find({}, function(err, cursos){
        if(err) throw err;
        res.json({hits: cursos.length, message: cursos})
      });
    })

    .post(function(req, res) {
      console.log(req.body);
        var curso = new models.instance.cursos({
          materia: req.body.materia,
          id_curso: parseInt(req.body.id_curso),
          titular: req.body.titular
        });
        curso.save(function(err){
            if(err) {
                console.log(err);
                return;
            }
            console.log('Curso agregado');
            res.json({message: "Curso agregado exitosamente"});
        });
    })
    .delete(function(req, res){
      console.log("Borrando curso con materia" + req.body.materia + "y id_curso: " + req.body.id_curso);
      var query_object = {materia: req.body.materia, id_curso: parseInt(req.body.id_curso)};
      models.instance.cursos.delete(query_object, function(err){
        if(err) console.log(err);
        else {
          console.log('Curso borrado');
          res.json({message: "Curso borrado"});
        }
      });
    });

router.route('/cursos_por_materia')
  .get(function(req, res){
    console.log("Buscando los cursos de una materia");
    models.instance.cursos.find({materia: req.query.materia}, function(err, cursos){
      if(err) throw err;
      res.json({hits: cursos.length, message: cursos})
    });
  });

router.route('/inscripciones')
  .get(function(req, res){
    console.log("Buscando en base todas las inscripciones");
    models.instance.inscripciones.find({}, function(err, inscripciones){
      if(err) throw err;
      res.json({hits: inscripciones.length, message: inscripciones})
    });
  })
  .post(function(req, res) {
    console.log(req.body);
      var inscripcion = new models.instance.inscripciones({
        padron: parseInt(req.body.padron),
        id_curso: parseInt(req.body.id_curso),
      });
      inscripcion.save(function(err){
          if(err) {
              console.log(err);
              return;
          }
          console.log('Almuno inscripto');
          res.json({message: "Alumno inscripto al curso exitosamente"});
      });
  })
