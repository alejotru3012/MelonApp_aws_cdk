const apigClientFactory = require('aws-api-gateway-client').default;

module.exports = class APIHandler {

    constructor() {

        this.apigClient = apigClientFactory.newClient({
            invokeUrl: process.env.URL_SHIPPING_DETAILS,
            apiKey: process.env.SHIPPING_KEY
        });
    }

    async shipping_details(id) {

        let pathParams = {};
        let pathTemplate = `/shipping-methods/${id}`
        let method = 'GET';
        let additionalParams = {
            headers: {},
        };
        let body = "";

        return new Promise((resolve, reject) => {
            this.apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
            .then(function(result){
                console.log(result);
                resolve(result);
            }).catch( function(result){
                console.log(result);
                reject(result);
            });
        })

    }

    async offDays() {

        let pathParams = {};
        let pathTemplate = `/off-days`
        let method = 'GET';
        let additionalParams = {
            headers: {},
        };
        let body = "";

        return new Promise((resolve, reject) => {
            this.apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
            .then(function(result){
                console.log(result);
                resolve(result);
            }).catch( function(result){
                console.log(result);
                reject(result);
            });
        })

    }


}
