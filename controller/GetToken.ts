import { GetTokenProps } from '../interfaces/GetToken'
import { getToken } from '../services/sts/getToken'
import { AWSError } from 'aws-sdk'
import { AssumeRoleResponse } from 'aws-sdk/clients/sts'

class GetToken {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    clusterName: string;
    region: string;
    constructor() {

        this.accessKeyId = " "
        this.secretAccessKey = " "
        this.sessionToken = " "
        this.clusterName = " "
        this.region = " "
    }

    setData(params: GetTokenProps) {
        this.accessKeyId = params.accessKeyId
        this.secretAccessKey = params.secretAccessKey
        this.sessionToken = params.sessionToken
        this.clusterName = params.clusterName
        this.region = params.region
    }
    async GetToken(params?: any): Promise<AssumeRoleResponse | AWSError> {
        try {
            let paramsgetToken = {
                accessKeyId: params.accessKeyId,
                secretAccessKey: params.secretAccessKey,
                sessionToken: params.sessionToken,
                clusterName: params.clusterName,
                region: params.region
            }
            let getToken_log = await getToken(paramsgetToken)
            console.log("getToken_log : ", getToken_log);


            return getToken_log;

        } catch (error) {
            return error.stack;
        }
    }

}
export default GetToken