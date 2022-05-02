import AWS from 'aws-sdk';
class S3Utilities {
  constructor() {
    this.awsOptions = S3Utilities.createAWSOptions();
  }

  static createAWSOptions() {
    return {
      region: process.env.S3_REGION,
      apiVersion: "2006-03-01",
      endpoint: process.env.S3_REGION_ENDPOINT,
      accessKeyId: process.env.S3_ACCESSKEY,
      signatureVersion: "v4",
      secretAccessKey: process.env.S3_SECRETKEY,
    };
  }
  static createAWSOptionsV3() {
    return {
      region: process.env.S3_REGION,
      apiVersion: "2006-03-01",
      endpoint: S3Utilities.fixEndpointURL(),
      signatureVersion: "v4",
      credentials: {
        accessKeyId: process.env.S3_ACCESSKEY,
        secretAccessKey: process.env.S3_SECRETKEY,
      },
    };
  }

  getS3() {
    return new AWS.S3(this.awsOptions);
  }

  async getObjectAsString(bucket, keyName) {
    const s3 = this.getS3();

    let input = await s3.getObject({ Bucket: bucket, Key: keyName }).promise();

    return input.Body.toString();
  }

  static fixEndpointURL(){
    if (
      process.env.S3_REGION_ENDPOINT.match(
        "https?:\/\/?[-a-zA-Z0-9@:%._\+~#=]{1,256}"
      )
    ) {
      return process.env.S3_REGION_ENDPOINT;
    } else {
      return "https://" + process.env.S3_REGION_ENDPOINT;
    }
  }

  listObjectsByPrefix(bucketName, prefix) {
    return new Promise((resolve, reject) => {
      try {
        var params = {
          Bucket: bucketName,
          Prefix: prefix,
        };
        const s3 = this.getS3();
        // TODO: ONLY RETURNS 1000 at a time
        s3.listObjects(params, function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
            reject(err);
          } else {
            resolve(data.Contents);
          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }
}

module.exports = S3Utilities;
