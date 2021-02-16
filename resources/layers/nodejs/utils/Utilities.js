const response = (code, msj) => {
    return {
        statusCode: code,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: msj,
    };
}

const isJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

  
exports.response = response;
exports.isJson = isJson;