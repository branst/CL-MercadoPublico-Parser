# CL-MercadoPublico-Parser
Mercado Publico parser en AWS. Usando Lambda, Dynamo, S3 y Elastic Search.

La arquitectura esta diseñada para aprovechar servicios serverless de AWS: 

Se compone de 3 funciones lambdas utilizando serverless para el deploy y orquestación. Las funciones están escritas en NodeJS, parsean apis públicas de Mercado Publico utilizando el estándar OCDS para Licitaciones Publicas de instituciones de Gobierno. 

Un set de colas de SQS hacen la función de orquestador de flujo, DynamoDB almacena los documentos json en formato clave-valor. S3 sirve de datalake para hacer en el futuro un eventual análisis o agregación de la información. Una función lambda se conecta a los strems de Dynamo y a medida que se hace un update o se escribe un nuevo documento, esa informacion es reflejada en Elastic Search. 

Finalmente utilizando Kibana somos capaces de hacer full text search, análisis y reportería.

![Arq](arq.png?raw=true "Arquitectura")
