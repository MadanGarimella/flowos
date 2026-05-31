# FlowOS Migration Guide

## Product Rename

The application has been renamed to FlowOS. New installations use:

```text
Database: flowos
Backend artifact: flowos-backend-0.0.1-SNAPSHOT.jar
Spring application name: flowos
Java namespace: com.flowos
Browser storage keys: flowos_token, flowos_user
```

## Existing Database Migration

Do not delete production data. Create the new database and copy the current schema and records during a maintenance window:

```sql
CREATE DATABASE flowos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Use MySQL Workbench Data Export and Data Import, or `mysqldump`, to move the existing schema and data into `flowos`. Verify record counts before changing `DB_URL`.

For a temporary compatibility deployment, point the renamed backend at the current database explicitly:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/<existing-database>?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
```

## Schema Strategy

For the first controlled migration:

```text
JPA_DDL_AUTO=update
```

After schema verification:

```text
JPA_DDL_AUTO=validate
```

Before public SaaS rollout, replace runtime schema updates with Flyway migrations.

## Browser Session Migration

Users should sign in again after the rebrand. Previous browser sessions are intentionally not reused.
