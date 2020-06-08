'use strict';
var request = require('request');
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});
const queueUrl = process.env.queueUrl;


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

  var currentTime = new Date()

  var options = {
    'method': 'GET',
    'url': `https://apis.mercadopublico.cl/OCDS/data/listaAñoMes/${currentTime.getFullYear()}/${currentTime.getMonth()+1}/0/1`
  };

  const { response, body } =  await requestHandler(options);
  var licitacionesCantidad = JSON.parse(body)

  console.log(licitacionesCantidad.pagination.total)
  var repetitions = Math.floor(licitacionesCantidad.pagination.total / 1000)
  
  for (let index = 0; index < repetitions+1; index++) {
    var options = {
      'method': 'GET',
      'url': `https://apis.mercadopublico.cl/OCDS/data/listaAñoMes/${currentTime.getFullYear()}/${currentTime.getMonth()+1}/${index*1000}/1000`
    };
    
    const { response, body } =  await requestHandler(options);
    var licitaciones = JSON.parse(body)

    licitaciones.data.forEach(dato => {
    
      var params = {
        MessageBody: dato.urlTender,
        QueueUrl: queueUrl
      };
      sqs.sendMessage(params, function(err, data){});
    })
    
  }
  
  var params = {
    MessageBody: 'finished',
    QueueUrl: queueUrl
  };

  await sqs.sendMessage(params).promise();

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
