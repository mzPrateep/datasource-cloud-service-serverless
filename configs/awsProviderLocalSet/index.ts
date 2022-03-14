import * as AWS from 'aws-sdk';


AWS.config.update({
    region: 'ap-southeast-1',
});

const S3 = new AWS.S3();

const Athena = new AWS.Athena();
// const EC2 = new AWS.EC2()
export { S3, Athena }