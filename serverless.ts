import { AWS } from '@serverless/typescript';
import {
  switchRole,
  getToken,
  getQResults,
  queryAuditLog,
  getQExec,
  getAutoScalingGroupNames,
  describeServices,
  listOrgAccounts,
  listServiceUsage,
} from './services'


const serverlessConfiguration: AWS = {
  service: 'datasource-aws-cloud-serverless',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }

  },
  plugins: ['serverless-webpack', 'serverless-iam-roles-per-function', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'ap-southeast-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
  },
  functions: {
    switchRole,
    getToken,
    queryAuditLog,
    getQResults,
    getQExec,
    getAutoScalingGroupNames,
    describeServices,
    listOrgAccounts,
    listServiceUsage,
  }
}

module.exports = serverlessConfiguration;
