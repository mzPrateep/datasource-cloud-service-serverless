import * as AWS from 'aws-sdk';

/* mfec-dev-dev */
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID
});

/* mfec-dev*/
// AWS.config.update({
//     region: 'ap-southeast-1',
//     accessKeyId: 'AKIATSN5TZUR4KMZXQMR',
//     secretAccessKey: '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'
// });

/* mfec-dev-prod*/
// AWS.config.update({
//     region: 'ap-southeast-1',
//     accessKeyId: 'AKIAXOKELM6OCAYLQNOW',
//     secretAccessKey: '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'
// });

const STS = new AWS.STS();
const CloudWatchLogs = new AWS.CloudWatchLogs();


export { STS, CloudWatchLogs }