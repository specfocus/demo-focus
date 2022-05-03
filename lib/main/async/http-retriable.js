const { RETRYABLE } = require('./Retryable');

const RETRYABLE_HTTP_STATUS = [
  400, // Bad Request // see https://github.ibm.com/cloudMatrix-CAM/cb-credential-service/blob/master/src/app/v2/api/account-api.js#L100
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  504, // Gateway Timeout
];

/**
 * Determines whether an error is something the driver should attempt to retry
 *
 * @param {HTTPError|Error} error
 */
function isRetryableError(error) {
  if ( !error.response ) {
    return false;
  }
  return (
    RETRYABLE_HTTP_STATUS.includes(error.response.status)
  );
}

const HTTP_RETRYABLE_DEFAULTS = {
  retries: 5,
  factor: 1.25,
  minTimeout: 5 * 1000,
  maxTimeout: 10 * 1000
};

function HTTP_RETRYABLE(promiseFunc,
  retryOptions = HTTP_RETRYABLE_DEFAULTS,
  isRetryableErrorCb = (error) => {  return isRetryableError(error); } ) {
  return RETRYABLE(promiseFunc, retryOptions, isRetryableErrorCb);
}

module.exports = {
  HTTP_RETRYABLE,
  HTTP_RETRYABLE_DEFAULTS,
  isRetryableError,
};
