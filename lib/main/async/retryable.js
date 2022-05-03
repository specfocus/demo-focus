import retry from 'retry';

const RETRYABLE_DEFAULTS = {
  retries: 5,
  factor: 1,
  minTimeout: 5 * 1000,
  maxTimeout: 5 * 1000
};
/**
 *
 * RETRYABLE
 *
 * @param: promiseFunc - The funtion to retry. The function returns a promise.
 * @param: retryOptions - See node module "retry" defaults is
 * {
 *   retries: 5,
 *   factor: 1,
 *   minTimeout: 5 * 1000,
 *   maxTimeout: 5 * 1000
 * }
 * @param: isRetryableErrorCb - if supplied should return true if the error can be retried.
 * If cannot retry on this error return false; Default retries on all errors;
 *
 * */

let RETRYABLE_PROMISE_WRAPPER = {
  promiseFuncWrapper: (promiseFunc, count) => {
    return promiseFunc(count);
  }
};

function RETRYABLE(promiseFunc, retryOptions = RETRYABLE_DEFAULTS, isRetryableErrorCb = () => { return true; }) {
  return new Promise((resolve, reject) => {
    var operation = retry.operation(retryOptions);
    operation.attempt(function (count) {
      RETRYABLE_PROMISE_WRAPPER.promiseFuncWrapper(promiseFunc, count)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error(`Error occurred in operation => ${error.stack}`);
          var isRetryable = isRetryableErrorCb(error);
          let stringError = error + "";
          try {
            stringError = JSON.stringify(error);
          }
          catch (e) {
          }
          if (isRetryable) {
            retryOptions['forever']
              ? console.error(`Error: ${stringError}; forever: ${retryOptions['forever']}; retrying-- attempt #${count} `)
              : console.error(`Error: ${stringError}; retrying-- attempt #${count}/${retryOptions['retries']}`);
            if (operation.retry(error)) {
              return;
            }
          }
          else {
            console.error(`Error: Not retyable - ${stringError}`);
          }
          reject(error);
        });
    });
  });
}

class RetryableUtil {
  static getRetryableCallsite(captureStart = RETRYABLE) {
    let origPrepareStackTrace = Error.prepareStackTrace;

    function MyError() {
      Error.prepareStackTrace = (error, structuredStackTrace) => {
        return structuredStackTrace;
      };
      Error.captureStackTrace(this, captureStart);
    }

    var myObject = new MyError();
    var siteList = myObject.stack;

    Error.prepareStackTrace = origPrepareStackTrace;
    return siteList;

  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  static breakOn(options = {
    functionNameRE: undefined,
    fileNameRE: undefined,
    lineNumber: undefined,
    captureStart: undefined,
    showCallStack: undefined
  }) {

    let captureStart = options.captureStart || RETRYABLE;

    const siteList = RetryableUtil.getRetryableCallsite(captureStart);
    if (siteList.length === 0) {
      return null;
    }

    let functionName = null;
    let fileName = null;
    let lineNumber = -1;
    let matched = false;

    let callStack = [];
    for (let site of siteList) {
      functionName = site.getFunctionName() || 'anonymouse';
      fileName = site.getFileName();
      lineNumber = site.getLineNumber();


      if (options['showCallStack'] === true) {
        callStack.push(`functionName: ${functionName} fileName: ${fileName} lineNumber: ${lineNumber}`);
      }


      let functionNameREMatched = (options.functionNameRE) ? options.functionNameRE.test(functionName) : true;
      let fileNameREMatched = (options.fileNameRE) ? options.fileNameRE.test(fileName) : true;
      let lineNumberMatched = (options.lineNumber) ? options.lineNumber === lineNumber : true;

      matched = (functionNameREMatched && fileNameREMatched && lineNumberMatched);
      if (matched) {
        if (options['showCallStack'] === true) {
          for (const stack_line of callStack) {
            console.info(stack_line);
          }
        }
        return site;

      }
    }


    return null;
  }

}

export { RETRYABLE, RETRYABLE_DEFAULTS, RETRYABLE_PROMISE_WRAPPER, RetryableUtil };
