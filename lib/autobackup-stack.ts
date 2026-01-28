import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AutoBackup, AutoBackupProps } from "./autobackup-construct";
import * as p from "../package.json";

export interface AutoBackupStackProps extends cdk.StackProps {
  autoBackup?: AutoBackupProps;
}

export class AutoBackupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AutoBackupStackProps) {
    super(scope, id, props);

    this.addMetadata("Version", p.version);
    this.addMetadata("Name", p.name);
    this.addMetadata("RepositoryType", p.repository.type);
    this.addMetadata("Repository", p.repository.url);
    this.addMetadata("Homepage", p.homepage);

    new AutoBackup(this, "AutoBackup", props?.autoBackup ?? {});
  }
}
