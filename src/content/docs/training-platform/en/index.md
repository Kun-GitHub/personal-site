---
title: Documentation
description: Guides to modules, groups, environment orchestration and reports in the Dafeiyu Project Training Platform.
order: 1
updated: 2026-11-22
---

The Dafeiyu Project Training Platform connects project images, tasks, environments and reports into a teaching workflow. Teachers configure modules and groups; students use individual or shared environments and submit their own reports for review. The platform is not tied to one system under test.

Visit the [official product site](https://training.wkong.kdns.fr) for product information. Ask your institution for the login address of its own deployment.

## By role

- **Teachers:** [Create and manage a training module](/en/docs/training-platform/guide/teacher/) covers tasks, resources, environment combinations, groups, publication, archiving and grading.
- **Students:** [Complete tasks and submit reports](/en/docs/training-platform/guide/student/) covers module environments, sharing, personal environments and reports.
- **School administrators:** prepare local or SSH Docker nodes, images and CPU/memory configurations, and maintain accounts, classes and permissions. See the [FAQ](/en/docs/training-platform/faq/) for environment and queue troubleshooting.

## Capabilities and limits

### Multi-node resource pool and orchestration

The resource pool can include local Docker and remote Docker connected over SSH. Automatic placement considers nodes that are not offline, have the image ready and have sufficient capacity. CPU and memory reservations are capped at 80% of node capacity, with transactional reservations preventing concurrent double allocation. A node can also be explicitly selected; queued requests keep that selection rather than switching nodes.

In **Modules**, open **Environments** to configure node/image/resource combinations and choose **Spread** (`spread`, the default) or **Bin-pack** (`binpack`). These policies order placement for new environments; they do not move existing instances.

### One per student or one shared per group

Modules default to **One per student** (`per_student`) and can use **One shared per group** (`per_group`). An edit in **Groups** can override the module setting. Current group members can view shared instance details and access information, and use its terminal. Leaving the group removes that shared access. Students cannot reset, destroy or remove a shared environment, even if they originally created it; these actions require a teacher or administrator with environment-management permission.

Personal environments have no module or group association, and a user can create several. They differ from module environments, which reuse an existing instance for the same student or group.

### Queues and failure isolation

Requests queue when capacity is unavailable. Each module allows up to 20 pending requests, with a 10-minute timeout and priority for teachers and administrators. The UI updates pending status about every 5 seconds; background dispatch runs every minute by default. No instance database is created while a request is pending.

Multi-node availability means **resource-node failure isolation only**, not active/standby platform services or databases. Existing instances on a failed node do not migrate or receive automatic takeover. An instance marked `error.serverOffline` must be removed and recreated; a teacher or administrator with management permission must handle a shared instance.

### Images define access and data capabilities

Instance details show ports and access methods, but not every image has a business web UI, login account or test dataset. Alpine typically uses a terminal, Nginx serves HTTP, and Redis, MySQL and PostgreSQL use their own protocols. Follow the image instructions and course requirements. Switch support also comes from the image; the platform does not hard-code a project-specific defect catalogue.

The platform provisions an independent database only when the image startup command uses `APP_DB_NAME` and the institution has configured `instance_db`. The image application creates its own schema and seed data. Reset is not a database restore, and data retention cannot be guaranteed for every image. Back up first; see the [FAQ](/en/docs/training-platform/faq/).

## Licensing and open source

**The platform is closed source and licensed per school for private deployment.** It is not a public source-code repository. Data location and operational responsibilities depend on the institution's deployment plan.

The example **Dafeiyu ERP** code is MIT-licensed and available on [GitHub (international)](https://github.com/training-image-marketplace/Dafeiyu-erp) and [Gitee (China)](https://gitee.com/training-image-marketplace/Dafeiyu-erp). MIT does not grant rights to the Dafeiyu name or trademarks. An optional Android client follows the contract in that separate image-project repository. Other images retain their upstream licences; they are not all MIT-licensed.
