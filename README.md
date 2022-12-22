<h1 align="center">
  <a href="http://www.amitmerchant.com/electron-markdownify">
    <img width="150" alt="Expo for vscode" src="https://raw.githubusercontent.com/expo/vscode-expo/main/images/logo-repository.png" />
  </a>
  <br />
  Expo for vscode
</h1>

<p align="center">
  <a href="https://github.com/expo/vscode-expo/releases" title="Latest release">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/package-json/v/expo/vscode-expo?style=flat-square&color=0366D6&labelColor=49505A">
      <img alt="Latest release" src="https://img.shields.io/github/package-json/v/expo/vscode-expo?style=flat-square&color=0366D6&labelColor=D1D5DA" />
    </picture>
  </a>
  <a href="https://github.com/expo/vscode-expo/actions" title="Workflow status">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/actions/workflow/status/expo/vscode-expo/test.yml?branch=main&style=flat-square&labelColor=49505A">
      <img alt="Workflow status" src="https://img.shields.io/github/actions/workflow/status/expo/vscode-expo/test.yml?branch=main&style=flat-square&labelColor=D1D5DA" />
    </picture>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=byCedric.vscode-expo" title="Install from vscode marketplace">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/vscode-marketplace-25292E?style=flat-square&label=%20&logoColor=BCC3CD&labelColor=49505A&logo=Visual%20Studio%20Code">
      <img alt="Install from vscode marketplace" src="https://img.shields.io/badge/vscode-marketplace-6C737C?style=flat-square&label=%20&logoColor=595F68&labelColor=D1D5DA&logo=Visual%20Studio%20Code" />
    </picture>
  </a>
  <a href="https://open-vsx.org/extension/byCedric/vscode-expo" title="Install from open vsx">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/vscode-open%20vsx-25292E?style=flat-square&label=%20&logoColor=BCC3CD&labelColor=49505A&logo=Eclipse%20IDE" />
      <img alt="Install from open vsx" src="https://img.shields.io/badge/vscode-open%20vsx-6C737C?style=flat-square&label=%20&logoColor=595F68&labelColor=D1D5DA&logo=Eclipse%20IDE" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://github.com/expo/vscode-expo#readme"><b>Back to plugin</b></a> &nbsp;&mdash;&nbsp;
  <a href="https://github.com/expo/vscode-expo/commits/schemas"><b>Schema changes</b></a>
</p>

<br />

This branch holds all JSON Schemas used in [Expo](https://expo.dev) for vscode.

## What is this branch?

To get IntelliSense for Expo tooling in vscode, like [**app.json**](https://docs.expo.dev/versions/latest/config/app/) and **store.config.json**, we import JSON Schemas. We use these JSON Schemas in other Expo tools too, and because of that, the schemas aren't optimized for vscode. In plugin versions `<=0.7.4`, downloading, modifying, and applying the schema was done inside the actual vscode plugin. Although this worked, it did cause unexpected issues like [#87](https://github.com/expo/vscode-expo/issues/87) and [#83](https://github.com/expo/vscode-expo/issues/83).

To avoid these issues, we now pre-process the JSON Schemas in this repository and host the result in this orphaned **schemas** branch.

## How it works

If you are lucky to maintain this system, you probably need to know how it works. Because JSON Schemas are supposed to be static, and the basic JSON Schema versions aren't optimized for vscode usage, we need to do some pre-processing. Here are some of the constraints that define the JSON Schema system currently implemented in this repo:

### VSCode plugin integration

The JSON Schemas are configured in the vscode plugin through ["Contribution Points"](https://code.visualstudio.com/api/references/contribution-points#contributes.jsonValidation). Contribution points are defined through the [**package.json** in the **main** branch](https://github.com/expo/vscode-expo/blob/main/package.json). The JSON Schema URLs are pointing to this branch, used as the primary endpoint to serve the vscode optimized JSON Schemas.

### JSON Schema modifications

We use JSON Schemas in different parts of the Expo ecosystem. It's used for validation at runtime in the CLIs and generating components of the [documentation](https://docs.expo.dev/versions/latest/config/app/).

In this vscode plugin, we also use it to generate the IntelliSense. But these schemas aren't optimized for usage in vscode, e.g., markdown is used in the `description` properties even though vscode only renders markdown in `markdownDescription`.

To compensate for this, we use the [`scripts/schema-expo-xdl`](https://github.com/expo/vscode-expo/blob/main/scripts/schema-expo-xdl.js) code. We modify the JSON Schema in this script file for optimal usage inside vscode. The resulting schema from these scripts is committed to this branch and automatically updated using GitHub Actions.

> Not every schema requires extensive modifications to use in vscode. See the appropriate GitHub Action workflows below.

### Updating the schemas

The JSON Schemas are updated automatically through GitHub Actions. The workflows managing these schemas are listed below and should have a manual trigger for unscheduled emergency updates.

#### Schema workflows

- [`eas.json`](./schema/eas.json) → Managed by the [schema-eas.yml](https://github.com/expo/vscode-expo/blob/main/.github/workflows/schema-eas.yml) workflow.
- [`eas-metadata.json`](./schema/eas-metadata.json) → Managed by the [schema-metadata.yml](https://github.com/expo/vscode-expo/blob/main/.github/workflows/schema-metadata.yml) workflow.
- [`expo-module.json`](./schema/expo-module.json) → _Workflow TBD (see issue [#113](https://github.com/expo/vscode-expo/issues/113))_
- [`expo-xdl.json`](./schema/expo-xdl.json) → Managed by the [schema-xdl.yml](https://github.com/expo/vscode-expo/blob/main/.github/workflows/schema-xdl.yml) workflow.

### Adding more schemas

Whenever this vscode plugin needs more JSON Schemas, you can create a new [script in the **./scripts** folder`](https://github.com/expo/vscode-expo/blob/main/scripts). Because that script is part of the infrastructure around the vscode plugin, it should be considered part of the code and added to the main branch. All new schemas **must have** the following parts:

- Tests to validate the final JSON Schema used in vscode
- Workflow to both generate and publish the schema to this branch
- A new contribution point entry to integrate it in the vscode plugin

<div align="center">
  <br />
  with&nbsp;:heart:&nbsp;&nbsp;<strong>byCedric</strong>
  <br />
</div>
