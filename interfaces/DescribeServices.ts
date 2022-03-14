export interface DescribeServicesProps {
    InstanceIds: Array<string>;
    region: String;
    accountId: String;
    iamRole: String;
    service: String;
};