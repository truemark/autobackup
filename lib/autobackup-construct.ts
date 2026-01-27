import { Construct } from "constructs";
import {
  BackupPlan,
  BackupPlanRule,
  BackupResource,
  BackupVault,
  CfnBackupVault,
} from "aws-cdk-lib/aws-backup";
import { Duration } from "aws-cdk-lib";
import { Schedule } from "aws-cdk-lib/aws-events";

export interface AutoBackupProps {
  /**
   * Enables immutable backups by creating an immutable vault, immutable backup plans, and applying AWS Backup Vault Lock.
   */
  enableImmutable?: boolean;

  /**
   * Minimum and maximum retention enforced by Vault Lock.
   * All immutable backup rules must fall within this range, default range: 7days-7years.
   */
  vaultLockMinRetentionDays?: number;
  vaultLockMaxRetentionDays?: number;

  /**
   * Sets Vault Lock to Compliance mode when provided (minimum 3 days).
   * When omitted, Vault Lock uses Governance mode.
   */
  vaultLockChangeableForDays?: number;
}

export class AutoBackup extends Construct {
  private daily(days: number): BackupPlanRule {
    return new BackupPlanRule({
      ruleName: "Daily",
      scheduleExpression: Schedule.cron({
        hour: "5",
        minute: "0",
      }),
      deleteAfter: Duration.days(days),
    });
  }

  private weekly(days: number): BackupPlanRule {
    return new BackupPlanRule({
      ruleName: "Weekly",
      scheduleExpression: Schedule.cron({
        hour: "5",
        minute: "0",
        weekDay: "SAT",
      }),
      deleteAfter: Duration.days(days),
    });
  }

  private monthly(days: number): BackupPlanRule {
    return new BackupPlanRule({
      ruleName: "Monthly",
      scheduleExpression: Schedule.cron({
        day: "1",
        hour: "5",
        minute: "0",
      }),
      moveToColdStorageAfter: Duration.days(30),
      deleteAfter: Duration.days(days),
    });
  }

  private tagSelection(plan: BackupPlan, tagValue: string) {
    plan.addSelection("Selection", {
      resources: [BackupResource.fromTag("backup:policy", tagValue)],
    });
  }

  constructor(scope: Construct, id: string, props: AutoBackupProps = {}) {
    super(scope, id);

    // ---------------------------------------------------------------------
    // EXISTING (unchanged): unlocked vault + existing plans
    // ---------------------------------------------------------------------
    const backupVault = new BackupVault(this, "Default", {
      backupVaultName: "AutoBackup",
    });

    const defaultWeek = new BackupPlan(this, "DefaultWeek", {
      backupVault,
      backupPlanRules: [this.daily(7)],
    });
    this.tagSelection(defaultWeek, "default-week");

    const defaultMonth = new BackupPlan(this, "DefaultMonth", {
      backupVault,
      backupPlanRules: [this.daily(35)],
    });
    this.tagSelection(defaultMonth, "default-month");

    const defaultQuarter = new BackupPlan(this, "DefaultQuarter", {
      backupVault,
      backupPlanRules: [this.daily(35), this.weekly(90)],
    });
    this.tagSelection(defaultQuarter, "default-quarter");

    const defaultDaily35Weekly90Monthly365 = new BackupPlan(
      this,
      "DefaultYear",
      {
        backupVault,
        backupPlanRules: [this.daily(35), this.weekly(90), this.monthly(365)],
      },
    );
    this.tagSelection(defaultDaily35Weekly90Monthly365, "default-year");

    const defaultDaily35Weekly90Monthly2555 = new BackupPlan(
      this,
      "Default7Years",
      {
        backupVault,
        backupPlanRules: [this.daily(35), this.weekly(90), this.monthly(2555)],
      },
    );
    this.tagSelection(defaultDaily35Weekly90Monthly2555, "default-7-years");

    // ---------------------------------------------------------------------
    // IMMUTABLE: vault + plans (opt-in via tag values) + Vault Lock always configured
    // ---------------------------------------------------------------------
    if (props.enableImmutable) {
      const immutableVault = new BackupVault(this, "Immutable", {
        backupVaultName: "AutoBackup-Immutable",
      });

      const cfnVault = immutableVault.node.defaultChild as CfnBackupVault;
      cfnVault.lockConfiguration = {
        minRetentionDays: props.vaultLockMinRetentionDays ?? 7,
        maxRetentionDays: props.vaultLockMaxRetentionDays ?? 2555,
        ...(props.vaultLockChangeableForDays !== undefined
          ? { changeableForDays: props.vaultLockChangeableForDays }
          : {}),
      };

      const defaultWeekImmutable = new BackupPlan(
        this,
        "DefaultWeekImmutable",
        {
          backupVault: immutableVault,
          backupPlanRules: [this.daily(7)],
        },
      );
      this.tagSelection(defaultWeekImmutable, "default-week-immutable");

      const defaultMonthImmutable = new BackupPlan(
        this,
        "DefaultMonthImmutable",
        {
          backupVault: immutableVault,
          backupPlanRules: [this.daily(35)],
        },
      );
      this.tagSelection(defaultMonthImmutable, "default-month-immutable");

      const defaultQuarterImmutable = new BackupPlan(
        this,
        "DefaultQuarterImmutable",
        {
          backupVault: immutableVault,
          backupPlanRules: [this.daily(35), this.weekly(90)],
        },
      );
      this.tagSelection(defaultQuarterImmutable, "default-quarter-immutable");

      const defaultYearImmutable = new BackupPlan(
        this,
        "DefaultYearImmutable",
        {
          backupVault: immutableVault,
          backupPlanRules: [this.daily(35), this.weekly(90), this.monthly(365)],
        },
      );
      this.tagSelection(defaultYearImmutable, "default-year-immutable");

      const default7YearsImmutable = new BackupPlan(
        this,
        "Default7YearsImmutable",
        {
          backupVault: immutableVault,
          backupPlanRules: [
            this.daily(35),
            this.weekly(90),
            this.monthly(2555),
          ],
        },
      );
      this.tagSelection(default7YearsImmutable, "default-7-years-immutable");
    }
  }
}
