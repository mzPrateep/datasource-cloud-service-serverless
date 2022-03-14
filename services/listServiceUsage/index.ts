
export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'listServiceUsage',
                integration: 'lambda',
                cors: {
                    origin: "*"
                },
                request: {
                    // schema: {
                    //     'application/json': schema
                    // }
                },
                response: {
                    statusCodes: {
                        200: {
                            pattern: '.*"statusCode":200.*'

                        },
                        400: {
                            pattern: '.*"statusCode":400.*',
                            template: { "application/json": "#set ($errorMessageObj = $input.path('$.errorMessage'))$errorMessageObj" }
                        }
                    }
                }
            }
        }
    ],
    timeout: 120,
}