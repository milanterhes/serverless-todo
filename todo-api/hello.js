if (!global._babelPolyfill) {
    require('@babel/polyfill')
}

module.exports.hello = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      }),
    };
  };