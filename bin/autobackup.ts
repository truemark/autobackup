#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AutoBackupStack } from '../lib/autobackup-stack';

const app = new cdk.App();
new AutoBackupStack(app, 'AutoBackupStack', {});