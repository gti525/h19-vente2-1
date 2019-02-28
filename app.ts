// lib/app.ts
import * as express from "express";
import "reflect-metadata";
import * as bodyParser from "body-parser";
import { createConnection, ConnectionOptions } from "typeorm";
import { Venue } from "./webserver/src/entity/Venue";
import { AppRoutes } from "./webserver/src/routes";

var port = process.env.PORT || 8080;


// Create a new express application instance

createConnection(<ConnectionOptions>{
  type: "postgres",

  // We need add the extra SSL to use heroku on localhost
  extra: {
    ssl: true,
  },

  // Change the next line to use the Heroku postgresql from other environment like localhost, remenber that heroku changes this data periodically for security reasons
  url: "postgres://xuamcueiltwsar:35ad6253deb74e6f8aa19a178e9b3240744c30ca4a9f5719933ca168592e262c@ec2-54-243-228-140.compute-1.amazonaws.com:5432/dktnp0dql1q5k",

  entities: [
    __dirname + "/webserver/src/entity/*.ts"
  ],
  subscribers: [],
  synchronize: true,
}).then(async connection => {

  console.log("Opened connection to database.");

  const app: express.Application = express();
  var cors = require('cors')
  app.use(cors()) // Use this after the variable declaration
  app.use(bodyParser.json());
  var router = express.Router();
  var path = require('path');


  // --------------------
  // ROUTES D'API
  // --------------------


  router.get('/', function (req, res) {
    res.json({ message: 'Bienvenue sur l\'API de vente2 GTI525' });
  });

  // register all application routes
  AppRoutes.forEach(route => {
    console.log(route);
    router[route.method](route.path, (request: Request, response: Response, next: Function) => {
        route.action(request, response)
            .then(() => next)
            .catch(err => next(err));
    });
  });


  // FIN DES ROUTES API
  //lier router à la route /api
  app.use('/api', router);

  // distribue l'application Angular par défaut.
  app.use(express.static(__dirname + '/dist/vente2'));

  // * permet de refresh une page à partir du même url. example /show/1 retournera toujours la même page.
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/vente2/index.html'));
  });

  // on écoute sur process.env.port pour heroku et 8080 localement.
  app.listen(port);
  console.log("Listening on port : ", port );
  
//en cas d'erreur de connection à la DB 
}).catch(error => console.log("TypeORM connection error: ", error));