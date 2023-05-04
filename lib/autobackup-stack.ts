import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {AutoBackup} from "../test/autobackup-construct"

export class AutoBackupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AutoBackup(this, "AutoBackup", {});

  }
}
