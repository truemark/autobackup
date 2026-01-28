#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AutoBackupStack } from "../lib/autobackup-stack";

const app = new cdk.App();

const enableImmutable =
  (app.node.tryGetContext("enableImmutable") ?? "false").toString() === "true";

const vaultLockChangeableForDaysRaw = app.node.tryGetContext(
  "vaultLockChangeableForDays",
);

// allow undefined (Governance mode)
const vaultLockChangeableForDays =
  vaultLockChangeableForDaysRaw !== undefined
    ? Number(vaultLockChangeableForDaysRaw)
    : undefined;

new AutoBackupStack(app, "AutoBackup", {
  autoBackup: {
    enableImmutable,
    // include this ONLY if provided; if undefined => Governance
    ...(vaultLockChangeableForDays !== undefined
      ? { vaultLockChangeableForDays }
      : {}),
  },
});

app.synth();
