export interface DescribeInstancesProps {
    InstanceIds: Array<string>;
    region: String;
    accountId: String;
    iamRole: String;
};