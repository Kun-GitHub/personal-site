---
title: FAQ
description: Troubleshooting for multi-node placement, queues, shared environments, report archiving and data lifecycles.
order: 4
updated: 2026-11-22
---

See the [teacher guide](/en/docs/training-platform/guide/teacher/) and [student guide](/en/docs/training-platform/guide/student/) for workflows, and the [official site](https://training.wkong.kdns.fr) for product and licensing information. Contact your institution about its deployment; do not publish passwords, tokens or connection credentials.

## Environment startup is waiting. Should I click again?

First distinguish the status in **Instances**:

- **Pending** (`pending`): waiting for capacity; no container or instance database has been created. Each module allows up to 20 pending requests. Further requests receive `error.queueFull`, and queued requests fail after 10 minutes.
- **Creating** (`creating`): creation has started. Time depends on the node and image application; no fixed startup time is guaranteed.
- **Error** (`error`): read the error and ask your teacher or administrator for help rather than repeatedly starting it.

The UI updates pending status about every 5 seconds; background dispatch runs every minute by default. Teachers and administrators have priority; other requests follow queue order. Module environments reuse the existing instance for a student or group, while each personal-environment creation adds another instance and may consume extra resources.

## Why am I queued when another node is idle?

Automatic placement requires a node that is **not offline, has the image ready and has CPU/memory reservation capacity**. Transactional reservations are capped at 80% of node CPU and memory, not 100%. An idle node without the image does not automatically pull it to accept the request. Accounting uses recorded instance specifications, not every external process's actual host usage.

Explicitly choosing a server, or using a combination bound to one, pins the request to that node even while queued. Ask an administrator to check image readiness, connectivity, configuration and capacity, not only the host's idle percentage.

Teachers set `spread` (default) or `binpack` in **Modules**, under **Environments**. This changes candidate ordering for new instances; it neither bypasses capacity checks nor moves existing ones.

## Does multi-node availability automatically take over failed instances?

**No.** Availability currently means resource-node failure isolation only, not active/standby platform services or databases. Existing instances and node-local data do not migrate automatically.

`error.serverOffline` is a terminal failure marker. Starting, resuming or resetting cannot clear it, even if the node later returns. Back up anything still accessible, remove the failed instance and create a new one. Recreation does not restore the old data. Automatic placement can select an available node for the new instance; an explicit selection of an offline node needs to be changed separately.

Owners can remove their own exclusive failed or destroyed instances. **Shared instances require a teacher or administrator with environment-management permission.** Removal from a confirmed offline node may skip remote container and directory cleanup; an administrator must clean up leftovers when the node returns. Cleanup failures on healthy nodes, or database-deletion failures, retain the record for retry.

## Can students share an environment? Why can I not reset it?

Yes. A module defaults to `per_student` (one per student). Teachers can select `per_group` (one shared per group) under the module's **Environments**. Editing a group in **Groups** can override the module. Precedence is group override, then module setting, then one per student; this determines the arrangement of newly created instances only.

Current members can view shared instance details and access information, and use its terminal. Leaving the group revokes that access. Students cannot reset, destroy or remove a shared environment, even if they created it first. Those actions affect everyone and require a teacher or administrator with management permission.

Personal environments are different: they have no module or group association, require no group membership, and a user can have several.

## A module is missing, or creation says I have no group

Check in **Modules** that the teacher has published it. Ask the teacher to verify the module, class and membership in **Groups**. Module environments require membership even in one-per-student mode. Missing menus or buttons may indicate insufficient permissions; contact an administrator.

Archived modules cannot open new environments and pending requests stop dispatching. Module information, tasks, resources and combinations are read-only. Their groups are archived too, with no changes to information, members or environment arrangements.

## How do report filters and exports work? Can group members see my report?

In **Reports**, filter by **module, class, group and status**, then export CSV. Server-side visibility applies to lists, details and exports: students can see and export only their own reports, and teachers see their authorised teaching scope. Sharing an environment does not share reports.

Students create, save and submit their own drafts, one report per student per module. Teachers and administrators cannot create them on a student's behalf. Students cannot edit submitted reports; teachers review, score and comment on them. Do not assume an administrator can unlock a submission for further editing; check before submitting.

## Why can I no longer save an unsubmitted draft?

Check whether the module is archived. Archiving makes reports read-only and blocks draft saves and submission. Teachers can still review reports submitted before archiving. Finish submitting before your teacher archives the module; archiving is not a temporary course closure.

## Does every environment have an independent database and login?

No. The platform provisions an independent empty database and rewrites its name only when **the image startup command uses `APP_DB_NAME` and the deployment has `instance_db` configured**. The image application supplies its schema, seed data and business accounts. Pending requests do not provision databases.

Alpine typically uses a terminal, Nginx serves HTTP, and Redis, MySQL and PostgreSQL use their own protocols. A universal “open the business URL and enter credentials” workflow does not apply. Follow the image's ports and access instructions; platform accounts are not application accounts. Images without the switch interfaces do not automatically gain defect injection or menu controls.

## Are idle environments automatically destroyed?

The defaults are **pause after 240 idle minutes, scanning every 10 minutes**. Your institution can change the threshold and task configuration. Pausing is not destruction; the instance can normally be resumed. This feature is not a fixed-time automatic-destruction guarantee. Keep your own backups of important work.

## How do reset, destruction and removal differ?

- **Reset:** rebuilds the container using the original configuration, retaining a platform-provisioned independent database. It does not restore initial database contents. The writable container layer and image-declared volumes may be recreated or cleared. Other mounts follow image and deployment configuration; retention is not universal.
- **Destroy:** cleans up the container and instance data directory, retaining its record and platform-provisioned database. This is not a backup or a guarantee that all content can be recovered by rebuilding.
- **Permanent removal:** cleans up the instance record and platform-managed independent database. Database cleanup failures retain the record for retry. Remote leftovers on a confirmed offline node require later administrator cleanup.

Back up files and application data separately first. An independent database, container files, Docker volumes and mounted directories are not the same data. “Reset retains the independent database” does not mean “nothing can be lost.” Shared-environment actions require a teacher or administrator with management permission.

## Are the platform and all images MIT-licensed open source?

**No. The platform is closed source and licensed per school for private deployment.** The example Dafeiyu ERP code is MIT-licensed and available on [GitHub (international)](https://github.com/training-image-marketplace/Dafeiyu-erp) and [Gitee (China)](https://gitee.com/training-image-marketplace/Dafeiyu-erp). Name and trademark rights are reserved; MIT does not license the brand. ERP's optional Android client follows the contract in its separate image-project repository, not a universal platform feature. Other upstream images retain their own licences.

## How do I reset my platform password?

Contact your institutional administrator. Change the initial password after first login, and never post credentials in public issues or reports.
