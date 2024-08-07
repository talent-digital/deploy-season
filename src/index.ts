import { getAuthorizationHeader } from "./auth";
import { deploySeason } from "./deploy-season";
import { deployArticles } from "./deploy-articles";
import * as core from "@actions/core";

const {
  GITHUB_REPOSITORY,
  GITHUB_WORKSPACE,
  INPUT_ENVIRONMENT_NAME,
  INPUT_EPISODES_PROVISIONER_CLIENT_PASSWORD,
  INPUT_EPISODES_PROVISIONER_CLIENT,
  INPUT_SEASON_FILE_PATH,
  INPUT_TARGET_DOMAIN,
  PW,
} = process.env;

let baseUrl: string;
let environment: string;
let domain: string;

if (!GITHUB_REPOSITORY)
  throw "The GITHUB_REPOSITORY environment variable is empty!";

if (!GITHUB_WORKSPACE)
  throw "The GITHUB_WORKSPACE environment variable is empty!";

const repositoryId = GITHUB_REPOSITORY.replace("/", "-");

if (!!INPUT_ENVIRONMENT_NAME && !!INPUT_TARGET_DOMAIN) {
  baseUrl = `https://${INPUT_ENVIRONMENT_NAME}.${INPUT_TARGET_DOMAIN}`;
  environment = INPUT_ENVIRONMENT_NAME;
  domain = INPUT_TARGET_DOMAIN;
} else {
  baseUrl = "http://localhost:8081";
  environment = "devtd2";
  domain = "talentdigit.al";
}

let rootPath = GITHUB_WORKSPACE;
if (INPUT_SEASON_FILE_PATH) rootPath = `${rootPath}/${INPUT_SEASON_FILE_PATH}`;

const clientId =
  INPUT_EPISODES_PROVISIONER_CLIENT || "episodes-provisioner-client";

let clientSecret: string;

if (INPUT_EPISODES_PROVISIONER_CLIENT_PASSWORD) {
  clientSecret = INPUT_EPISODES_PROVISIONER_CLIENT_PASSWORD;
} else {
  if (PW) {
    clientSecret = PW;
  } else {
    throw new Error(
      "You need to set environment variable for either EPISODES_PROVISIONER_CLIENT_PASSWORD or PW"
    );
  }
}

core.info(`Base URL: ${baseUrl}`);
core.info(`Environment: ${environment}`);
core.info(`Domain: ${domain}`);
core.info(`RootPath: ${rootPath}`);

const authorization = await getAuthorizationHeader(
  domain,
  environment,
  clientId,
  clientSecret
);

await deploySeason({
  repositoryId,
  baseUrl,
  authorization,
  rootPath,
});

await deployArticles({
  authorization,
  baseUrl,
  rootPath: GITHUB_WORKSPACE,
});
