import { readFile } from "fs/promises";
import { join } from "path";
import { getAuthorizationHeader } from "./auth";
import { parse } from "yaml";
import util from "util";
import got from "got";
import { existsSync } from "fs";
import { SeasonDefinition } from "@talentdigital/season";
import core from "@actions/core";

type DeploySeasonInput = {
  id: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  environment: string;
  rootPath: string;
};

export const deploySeason = async ({
  id,
  baseUrl,
  clientId,
  clientSecret,
  domain,
  environment,
  rootPath,
}: DeploySeasonInput) => {
  const authorization = await getAuthorizationHeader(
    domain,
    environment,
    clientId,
    clientSecret
  );
  let path = "";
  const path1 = join(rootPath, "season.yml");
  const path2 = join(rootPath, "season.yaml");

  if (existsSync(path1)) {
    path = path1;
  } else if (existsSync(path2)) {
    path = path2;
  } else {
    throw new Error(
      `season.yaml or season.yml don't exist at specified path: ${rootPath}`
    );
  }

  const season: SeasonDefinition = parse(await readFile(path, "utf-8"));

  const json = { id, ...season };

  core.debug(
    `Object to deploy:\n ${util.inspect(json, {
      showHidden: false,
      depth: null,
      colors: true,
    })}`
  );

  try {
    await got.post(`${baseUrl}/api/v1/season`, {
      headers: {
        authorization,
      },
      json,
    });
    core.debug("\nSeason deploy completed\n");
  } catch (err) {
    core.setFailed(
      `\nError during season deploy\n ${util.inspect(err, {
        showHidden: false,
        depth: null,
        colors: true,
      })}`
    );
  }
};
