# Auto Backup

This AWS CDK project deploys functionality to automatically back up resources based on tags.

## Supported Tags

| Tag           | Description                       |
| ------------- | --------------------------------- |
| backup:policy | Name of the backup policy to use. |

## Backup Policies

| Policy          | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| default-7-years | 35 days of daily, 90 days of weekly and 2555 days of monthly |
| default-year    | 35 days of daily, 90 days of weekly, 365 days of monthly     |
| default-quarter | 35 days of daily, 90 days of weekly                          |
| default-month   | 35 days of daily                                             |
| default-week    | 7 days of daily                                              |

## Immutable Backups (Vault Lock)

This project supports **fully immutable backups** using **AWS Backup Vault Lock**.

When immutable backups are enabled:

- A separate immutable backup vault is created
- AWS Backup Vault Lock is configured on that vault
- Backups written to the immutable vault cannot be deleted or modified until their retention expires
- Users opt in by using `*-immutable` policy tag values

In this project, **immutable always means Vault Lock is enabled**. Without Vault Lock, backups are not considered immutable.

## Immutable Policy Tags

Each standard policy has an immutable equivalent:

| Immutable Policy          | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| default-7-years-immutable | 35 days of daily, 90 days of weekly and 2555 days of monthly |
| default-year-immutable    | 35 days of daily, 90 days of weekly, 365 days of monthly     |
| default-quarter-immutable | 35 days of daily, 90 days of weekly                          |
| default-month-immutable   | 35 days of daily                                             |
| default-week-immutable    | Hourly (7 days) and daily (7 days)                           |

To protect a resource with immutable backups, apply the following tag:

backup:policy=<policy-name>-immutable

## Vault Lock Modes

AWS Backup Vault Lock supports two modes.

### Governance Mode

- Vault Lock is enabled
- Authorized IAM users can remove or modify the lock
- Suitable for operational guardrails and testing

### Compliance Mode

- Vault Lock becomes irreversible after a grace period
- No user (including the root user) can delete backups or the vault
- Suitable for regulatory and ransomware protection

## How to Deploy

Bootstrap the account for CDK (if not already done):

```
cdk bootstrap \
"aws://$(aws sts get-caller-identity --query 'Account' --output text)/${AWS_DEFAULT_REGION}" \
--cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

Deploy without immutable backups (default):

```
cdk deploy
```

Deploy with immutable backups in Governance mode:

```
cdk deploy -c enableImmutable=true
```

Deploy with immutable backups in Compliance mode (adjust vaultLockChangeableForDays as needed):

```
cdk deploy -c enableImmutable=true -c vaultLockChangeableForDays=3

```

WARNING: After the grace period ends, Compliance mode cannot be disabled and the vault cannot be deleted until all backups expire.

## Important Notes

- Tag evaluation happens at backup run time, not when tags are applied
- Only one backup:policy tag value should be set per resource
- Immutable backups are write-once, read-many (WORM)
- All backup rules in the immutable vault must comply with the vault lock retention range

## Summary

- Use backup:policy=<policy> for standard backups
- Use backup:policy=<policy>-immutable for immutable backups
- Immutable backups always use AWS Backup Vault Lock
- Compliance mode should only be enabled once retention settings are fully validated
