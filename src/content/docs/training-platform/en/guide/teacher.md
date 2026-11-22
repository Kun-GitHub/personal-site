---
title: Create and manage a training module
description: Configure modules, groups and multi-node environments, publish training, review reports and archive modules.
order: 2
updated: 2026-11-22
---

This guide uses the current **Modules**, **Groups**, **Reports** and **Instances** menus. Available actions depend on institutional permissions. Ask an administrator to prepare resource nodes, images and CPU/memory configurations first. See the [official site](https://training.wkong.kdns.fr) for product and licensing information.

## 1. Create a module and its tasks

1. In **Modules**, select **New** and enter a code, name, intro and task description. The task reference is visible only to teachers and is not returned to students. A new module is a draft; publish only when it is ready.
2. Open **Tasks** on the module row. Add titles, content, sort values and whether each task is required. Use the sort field to control display order.
3. Open **Resources** on the module row and upload handouts, templates or assessment requirements. Students download resources from the platform, not from inside a container.

State the required deliverables, assessment criteria, and whether students need a terminal, web browser or native client.

## 2. Configure environment combinations and placement

In **Modules**, open **Environments** on the relevant row. Add the required **server, image and configuration** combinations; the configuration defines CPU and memory needs. A combination binds its selected server, so free capacity elsewhere does not move the request. Automatic placement applies when no bound combination is used and the server is set to automatic.

Set **Node affinity** in the same dialog:

- **Spread** (`spread`, default) prefers nodes with more spare capacity.
- **Bin-pack** (`binpack`) prefers the smallest remaining capacity that can fit the request, aiming to leave whole nodes free.

The policy affects newly opened environments, not existing instances. Automatic placement requires an image-ready node that is not offline. The platform transactionally reserves CPU and memory up to 80% of node capacity. An explicit server is also capacity-checked; a missing image is not automatically pulled. Accounting uses the platform's recorded instance specifications, not a guarantee about every external host process's actual load.

## 3. Choose sharing and organise groups

**Environment arrangement** in the **Environments** dialog offers:

| Mode | Behaviour |
| --- | --- |
| One per student (`per_student`, default) | Reuses that student's independent environment within the module. |
| One shared per group (`per_group`) | Reuses one environment for the group. Current members can view details and access information, and use its terminal. |

In **Groups**, create a group for the module and class, then use **Members** to add individual students or a whole class. **Students must belong to a group in the module to open a module environment, even in one-per-student mode.**

For a different arrangement in one group, edit its **Environment arrangement** in **Groups**. Choose to follow the module, use one per student, or share one per group. The order is **group override, then module setting, then one per student**. The arrangement is recorded at instance creation; changing settings does not convert existing individual instances into shared ones or vice versa.

> Resetting, destroying or removing a shared environment affects the group and requires a teacher or administrator with environment-management permission. Students cannot perform these actions, even if they opened it first. A student who leaves the group loses shared-instance access.

## 4. Publish and verify access

Once tasks, resources, groups and images are ready, select **Publish** on the module row. Students can view content in **Modules** and select **Open environment** in **Instances**, then choose the published module and an available combination.

Before class, verify image readiness, node connectivity, ports or terminal access, and the image's data and switch behaviour. Teachers or administrators who are not student-group members should use **Open a personal environment** in **Instances** for an independent check. Personal environments have no module or group association; every creation adds another instance, and a user can keep several. This does not replace checking the group arrangement.

Capacity shortages queue requests instead of guaranteeing startup within a few seconds:

- Each module allows up to 20 pending requests; additional requests receive a queue-full error. Requests fail after 10 minutes in the queue.
- Teachers and administrators have priority; other requests follow queue order. Background dispatch runs every minute by default, while the UI updates pending status about every 5 seconds.
- Pending requests do not create instance databases. Requests pinned to a server keep it instead of using spare capacity on another node.

## 5. Review and export in Reports

In **Reports**, filter by **module, class, group and status**. Teachers work within their authorised scope; students see only their own reports. CSV exports use the same filters and visibility rules as the list.

Students create, save and submit their own drafts. Teachers and administrators cannot create a report on a student's behalf. Students cannot edit submitted reports; teachers open them to enter scores and comments. A shared environment does not mean a shared report: each student still submits their own.

## 6. Check before archiving

Archiving seals a module; it is not a temporary unpublish action. Ask students to finish saving and submitting first, then select **Archive** in **Modules**.

- Module information, tasks, resources and environment combinations become read-only. Sharing and node-affinity settings cannot be changed.
- Its groups are also archived: information, membership and environment arrangements cannot be edited.
- No new module environments can be opened, and pending requests stop dispatching.
- Report drafts become read-only: saving and submission are blocked. Teachers can still review reports submitted before archiving.

Archiving is not a backup, nor a promise to automatically destroy every environment after a particular interval.

## 7. Handle node failures and data carefully

Multi-node operation isolates resource-node failures; it does not provide active/standby platform services or databases. Existing instances are not migrated or automatically taken over. Once marked `error.serverOffline`, starting, resuming or resetting cannot clear the terminal error; remove the failed instance and create a new one. A teacher or administrator with management permission must handle shared instances. Offline removal can leave remote directories or containers for an administrator to clean up after the node returns.

Reset rebuilds the container using its original configuration; it does not restore an initial database. A platform-provisioned independent database is retained during reset. Container files, image-declared volumes and other mounts have different lifecycles and may lose data. Export needed data according to the image instructions before acting. See the [FAQ](/en/docs/training-platform/faq/) for database conditions, idle pausing and troubleshooting.
