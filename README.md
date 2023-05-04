# Auto Backup

This AWS CDK project deploys functionality to automatically backup resources based on tags.

## Supported Tags

| Tag                                 | Description                        |
|-------------------------------------|------------------------------------|
| backup:policy                       | Name of the backup policy to use.  |

## Backup Policies

| Policy          | Description                                                  |
|-----------------|--------------------------------------------------------------|
| default-7-years | 35 days of daily, 90 days of weekly and 2555 days of monthly |
| default-year    | 35 days of daily, 90 days of weekly, 365 days of monthly     |
| default-quarter | 35 days of daily, 90 days of weekly                          |
| default-month   | 35 days of daily                                             |
| default-week    | 7 days of of daily                                           |

