const fetch = require("node-fetch");
const Ut = require('/opt/nodejs/utils/Utilities');

exports.handler = async (event) => {
    // TODO implement

    let result = null;
    let code = 200;

    await fetch(`${process.env.URL_EXPRESSJS}/orders`, {
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
        code = 400
    });

    return Ut.response(code, result);
};
