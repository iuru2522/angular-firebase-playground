# Angular Firebase Playground

A playground for **BugTracker**, a role-based bug tracking workspace. It is a place to try Angular with Firebase Auth and Firestore: sign-in, roles, bug reports, test cases, and an admin user screen.

## What it is for

- Sign in with email and password or Google, register, and reset a password.
- See a home screen that changes by role: admin, project manager, developer, QA tester, or reporter.
- File, list, view, and edit bugs stored in Firestore.
- Manage test cases in the browser.
- Let admins view and update users and roles.
- Switch between light and dark theme.

## Technologies

- **Angular 22** — standalone components, signals, OnPush change detection, Angular Router
- **Angular Material** and **Angular CDK**
- **TypeScript 6** and **RxJS**
- **Firebase 13** — Authentication and Cloud Firestore (`users`, `bugs`)
- **Angular SSR** with **Express**
- **pnpm 10** via Corepack, **Node.js 22.22.3** (see `.nvmrc`)
- **Karma** and **Jasmine** for unit tests

## Prerequisites

Use the Node.js version in [`.nvmrc`](.nvmrc). This repo uses [pnpm](https://pnpm.io/) via [Corepack](https://nodejs.org/api/corepack.html):

```bash
corepack enable
pnpm install
```

You need a Firebase project with Authentication (email/password and Google) and Firestore enabled. The web config lives in `src/app/firebase-config.ts`.

## Development server

```bash
pnpm start
```

Open `http://localhost:4200/`. The app reloads when you change source files.

## Build

```bash
pnpm build
```

Output goes to `dist/angular-firebase-playground`. To run the SSR server:

```bash
pnpm run serve:ssr:angular-firebase-playground
```

## Tests

```bash
pnpm test
```

## Routes

| Path | Who can open it |
|---|---|
| `/` | Everyone |
| `/signin`, `/register`, `/forgot-password` | Everyone |
| `/file-bug`, `/bug-list`, `/bug-details/:id`, `/bug-edit/:id`, `/settings` | Signed-in users |
| `/admin/users`, `/admin/users-table` | Admins |
| `/test-cases`, `/test-cases-form` | Everyone (no auth guard yet) |
