# Deploy scripts

This action deploys season metadata to your tentant's database. See main readme for information on how to set up a season.yaml file. This action looks for a season.yaml file in the root of the repository and for articles folder. Articles are .md files that are used to create articles in the database.

## Prerequisites

Contcat talent::digital support to get the required input values.

## Usage

```yaml
name: Canary

on:
  push:
    branches: ["main"]

jobs:
  deploy-metadata:
    runs-on: ubuntu-latest
    name: Deploy metadata
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Deploy season metadata
        uses: ./deploy-scripts
        with:
          environment_name: "devtd2"
          episodes_provisioner_client_password: ${{ secrets.EPISODES_PROVISIONER_CLIENT_PASSWORD }}
          episodes_provisioner_client: "episodes-provisioner-client"
          target_domain: "talentdigit.al"
```

## Inputs

- `environment_name`: (Required) tenant name
- `episodes_provisioner_client_password`: (Required) ask talentdigital support. This needs to be setup in github secrets, [see](https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md).
- `episodes_provisioner_client`: (Required) ask talentdigital support
- `target_domain`: (Required) e.g. talent.digital.eu
- `season_file_path`: (Optional) Custom path for `season.yaml`, default to root directory.

## Development

### Running locally

To run the script locally for windows, run the following command:

`export GITHUB_REPOSITORY=season-name && export GITHUB_WORKSPACE=my-season-path && export PW=XXX && pnpm run deploy`

_Note_
Replace `GITHUB_REPOSITORY` with the season name, `GITHUB_WORKSPACE` with the path to the season.yaml file & `PW` with the episodes_provisioner_client_password.

### Making changes

After you make changes in the src files, you need to update the `dist/index.js` file. This is the file that is used by the action. To update this file, run `pnpm build`.

### Releasing new version

After merging your changes to the main branch use the github.com release / tag functionality. These tags are available in the workflows of the season repositories.
