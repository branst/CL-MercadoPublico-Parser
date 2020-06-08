'use strict';
var request = require('request');
const AWS = require('aws-sdk');
const tableName = process.env.tableName;
const ddb = new AWS.DynamoDB.DocumentClient();


const requestHandler = (options) => new Promise((resolve, reject) => {
  request(options, (error, response, body) => {
    if (error) {
      console.error(error);
      reject(error);
    } else {
      resolve({ response, body });
    }
  });
});

module.exports.entry = async (event) => {

    var url = 'https://apis.mercadopublico.cl/OCDS/data/tender/4449-3-LE20'

    if(event.Records != null){
     url = event.Records[0].body
    }

    console.log(url)

    if(url != 'finished'){

      var options = {
        'method': 'GET',
        'url': url
      };  

      const { response, body } =  await requestHandler(options);
      const keys = ["nube","azure","cloud","sistema","maquina","google","virtual","amazon","aws","computacion","ec2","almacenamiento","redes","plataforma"];
      
      if (keys.some(v => body.toLowerCase().includes(v))) {
        console.log('Match');
        var licitacion = JSON.parse(body)
        console.log(licitacion)

        licitacion.releases.forEach(lic => {
          if(lic.tender.items.length > 20)
          lic.tender.items.splice(20,lic.tender.items.length-20);
        });

      var params = {
          TableName: tableName,
          Item: {
            'uri' : licitacion.uri,
            'data' : licitacion
          }
        };

        const result = await ddb.put(params).promise()
        console.log(result)   

        /*ddb.putItem(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
          }
        });*/

      }
    }

  
  return {
  statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Ok',
        input: event,
      },
      null,
      2
    ),
  };
};
