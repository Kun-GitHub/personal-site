---
title: Complete tasks and submit reports
description: Use module or personal environments, work in a shared group instance, and save and submit your own reports.
order: 3
updated: 2026-11-22
---

The platform provides browser-based tasks, resources, reports and a Web terminal. Native clients or command-line tools may still be required by a course image; not every image is a business website with a login. Visit the [official site](https://training.wkong.kdns.fr) for product information, but use your institution's login address for class.

## 1. Check the module and your group

In **Modules**, open **Tasks** and **Resources** for a published module. Download handouts and templates from the resource controls and check the required deliverables.

You must belong to a group in the module to open a module environment. Check your membership in **Groups**. If creation says you are not in a group, contact your teacher rather than retrying repeatedly. An archived module cannot open new environments or accept draft saves or report submissions.

## 2. Open an environment in Instances

1. In **Instances**, select **Open environment**.
2. Select a published module and, if configured, one of its environment combinations. A combination pins its node, image and configuration. Without a combination, select the image and configuration required by your teacher; choose an automatic or explicit server.
3. After submitting, check the instance list. An existing individual or shared instance for the module is reused; repeated clicks do not create extra module environments.
4. Once running, open access information or details for actual ports and access methods. Use **Terminal** for command-line work. Select **Resume** first if the instance is paused.

Automatic placement requires a node that is not offline, has the image ready and has CPU/memory capacity. Explicitly choosing a server does not enable automatic switching to another node.

### If the instance is queued

`pending` means the request is queued for capacity, not that its container is ready. Each module allows up to 20 pending requests, with a 10-minute timeout and priority for teachers and administrators. The UI updates pending status about every 5 seconds, while background dispatch runs every minute by default. One refresh without a change does not indicate failure. No instance database is created while pending.

For a full queue or timeout, ask your teacher about capacity and follow the prompt to remove a failed instance before recreating it. Shared instances must be removed by a teacher or administrator. Requests pinned to a node do not switch to another idle node.

## 3. Check whether the instance is individual or shared

- **One per student (default):** you use your own instance within the module.
- **One shared per group:** current members use the same instance. Terminal commands and application changes may affect other members. Everyone can view details and access information, and use the terminal; coordinate your work.
- **Permissions:** students cannot reset, destroy or remove a shared environment, including the original creator. These actions require a teacher or administrator with environment-management permission. Leaving the group removes shared-instance access.

Teachers set the arrangement for the module and can override it for a group. Later setting changes do not convert existing instances. Sharing an environment does not share a report: each student submits their own.

## 4. Follow the image's access instructions

Alpine typically uses a terminal, Nginx serves HTTP, and Redis, MySQL and PostgreSQL use their own protocols. Business logins, sample data, defect switches and Android clients depend on the image and course instructions. Your platform account is not automatically an account inside the image's application.

Record your steps, actual and expected results, and any screenshots or logs required by the task. Do not put passwords, tokens or other sensitive credentials in reports.

## 5. Save and submit your own report

In **Reports**, select **New report**, choose the module and enter a title. Each student has one report per module. Edit the content, attach files if required, and save a draft. Review it before submitting; submitted reports cannot be edited.

Filter the list by module, class, group and status; CSV export follows the same conditions. **Students can list, open and export only their own reports**, even when sharing an environment. Open the report after review to see the teacher's score and comments.

> Archiving makes existing drafts read-only and blocks both saving and submission. Submit before the module is archived. Teachers can still review reports submitted earlier.

## 6. Personal environments and data safety

For practice outside a module, select **Open a personal environment** in **Instances**, then choose an image, configuration and automatic or explicit server. No group membership is required. Every creation adds a new personal environment and a user can have several; unlike module environments, they are not reused automatically.

The default idle-pause threshold is 240 minutes, with a scan every 10 minutes; your institution can change the configuration. Pausing is not destruction and the instance can be resumed. This is not a timed automatic-destruction guarantee.

**Reset is not a restore-initial-data button.** It rebuilds the container using the original configuration. A platform-provisioned independent database is retained, but container files, image-declared volumes and other mounts can have different handling; no universal no-data-loss promise applies. Destroying and permanently removing an instance are also different: destruction retains its record and platform-provisioned database, while permanent removal cleans up that database. Export important files and application data according to the image documentation first.

An instance marked `error.serverOffline` will not migrate or receive automatic takeover. Starting, resuming or resetting cannot recover it; remove the failed instance and create another. Contact your teacher for a shared instance. Offline removal may leave remote containers or directories for an administrator to clean up later. See the [FAQ](/en/docs/training-platform/faq/) for more detail.
