import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: 'auditLog/query',
                integration: 'lambda',
                cors: {
                    origin: "*",
                },
                request: {},
                response: apiResponse,

            }
        }
    ],
    iamRoleStatements: [
        {
            Effect: "Allow",
            Action: [
                "athena:StartQueryExecution"
            ],
            Resource: [
                "arn:aws:athena:ap-southeast-1:*:workgroup/*"
            ]
        },
        {
            Effect: "Allow",
            Action: [
                "glue:GetTable"
            ],
            Resource: [
                "*"
            ]
        },
        {
            Effect: "Allow",
            Action: [
                "s3:GetBucketLocation",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:ListBucketMultipartUploads",
                "s3:ListMultipartUploadParts",
                "s3:AbortMultipartUpload",
                "s3:CreateBucket",
                "s3:PutObject"
            ],

            Resource: [
                "arn:aws:s3:::athena-ppa-output/*",
                "arn:aws:s3:::athena-ppa-output",
                "arn:aws:s3:::ppa-activity-log/*",
                "arn:aws:s3:::ppa-activity-log",
                "arn:aws:s3:::ppa-audit-logs/*",
                "arn:aws:s3:::ppa-audit-logs"
            ]
        }
    ]


}
