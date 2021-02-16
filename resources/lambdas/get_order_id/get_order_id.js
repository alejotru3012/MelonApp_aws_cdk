const fetch = require("node-fetch");
const Ut = require('/opt/nodejs/utils/Utilities');

exports.handler = async (event) => {
    // TODO implement

    if (!('pathParameters' in event) || event.pathParameters == null) {
        return Ut.response(400, 'Hay problemas con el mensaje, es posible que falten parametros');
    }

    let params = event.pathParameters;

    if (!('id' in params)) {
        return Ut.response(400, 'Falta el parametro id');
    }
    const id = params.id;

    let result = null;
    let code = 200;

    await fetch(`${process.env.URL_EXPRESSJS}/orders/${id}`, {
        method: 'GET'
    })
    .then(function(response) {
        return response.text();
    })
    .then(function(data) {
        console.log('data = ', data);
        result = data;
    })
    .catch(function(err) {
        console.error(err);
        code = 400;
    });

    return Ut.response(code, result);
};
