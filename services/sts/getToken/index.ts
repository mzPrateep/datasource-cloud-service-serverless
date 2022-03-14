import { Aws, Options } from "aws-cli-js";

const getToken = async (params): Promise<any> => {

    return new Promise(async (resolve) => {

        console.log("params [test] : ", params);

        let accessKey = params.accessKeyId
        let secretKey = params.secretAccessKey
        let sessionToken = params.sessionToken
        const currentWorkingDirectory = null
        // const cliPath = 'aws'
        var options = new Options(
            accessKey,
            secretKey,
            sessionToken,
            currentWorkingDirectory,
            // cliPath
        );

        var aws = new Aws(options);
        let get_token = new Promise(async (resolve) => {
            let simple_command = `eks get-token --cluster-name ${params.clusterName} --region ${params.region}`
            console.log("simple command : ", simple_command);

            aws.command(simple_command, function (err, data) {
                if (err) {
                    console.log("err[ eks get-token ] : ", err);
                    resolve(err)
                } else {
                    console.log("data[ eks get-token ] : ", data);
                    resolve(data.object)
                }
            });
        });
        let res_get_token = await get_token
        console.log("res_get_token : ", res_get_token);

        resolve(res_get_token)
    })
}

export { getToken }
