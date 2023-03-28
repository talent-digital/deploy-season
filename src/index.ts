import { deploySeason } from "./deploy-season";

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

const id = GITHUB_REPOSITORY.replace("/", "-");

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

console.log(`Base URL: ${baseUrl}`);
console.log(`Environment: ${environment}`);
console.log(`Domain: ${domain}`);
console.log(`RootPath: ${rootPath}`);

await deploySeason({
  id,
  baseUrl,
  clientId,
  clientSecret,
  domain,
  environment,
  rootPath,
});
