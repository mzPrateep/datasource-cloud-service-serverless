export default {
    headers: {
        'Access-Control-Allow-Origin': "'*'",
        'Content-Type': "'application/json'"
    },
    statusCodes: {
        200: {
            pattern: '.*"statusCode":200.*'

        },
        400: {
            pattern: '.*"statusCode":400.*',
            template: { "application/json": "#set ($errorMessageObj = $input.path('$.errorMessage'))$errorMessageObj" }
        }
    }
}as const;