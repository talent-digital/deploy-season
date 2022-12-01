import { deploySeasons } from "./deploy-season";

const {
  INPUT_ENVIRONMENT_NAME,
  INPUT_EPISODES_PROVISIONER_CLIENT_PASSWORD,
  INPUT_EPISODES_PROVISIONER_CLIENT,
  INPUT_SEASON_FILE_PATH,
  INPUT_TARGET_DOMAIN,
  PW,
} = process.env;

let baseUrl: string;
let environmemt: string;
let domain: string;

if (!!INPUT_ENVIRONMENT_NAME && !!INPUT_TARGET_DOMAIN) {
  baseUrl = `https://${INPUT_ENVIRONMENT_NAME}.${INPUT_TARGET_DOMAIN}`;
  environmemt = INPUT_ENVIRONMENT_NAME;
  domain = INPUT_TARGET_DOMAIN;
} else {
  baseUrl = "http://localhost:8081";
  environmemt = "devtd2";
  domain = "talentdigit.al";
}

const rootPath = INPUT_SEASON_FILE_PATH ?? "./";

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
console.log(`Environment: ${environmemt}`);
console.log(`Domain: ${domain}`);
console.log(`RootPath: ${rootPath}`);

await deploySeasons({
  baseUrl,
  clientId,
  clientSecret,
  domain,
  environmemt,
  rootPath,
});
