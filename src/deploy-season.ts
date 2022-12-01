import { readFile } from "fs/promises";
import { join } from "path";
import { getAuthorizationHeader } from "./auth";
import { parse } from "yaml";
import util from "util";
import got from "got";
import { existsSync } from "fs";

type DeploySeasonInput = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  environmemt: string;
  rootPath: string;
};

export const deploySeasons = async ({
  baseUrl,
  clientId,
  clientSecret,
  domain,
  environmemt,
  rootPath,
}: DeploySeasonInput) => {
  const authorization = await getAuthorizationHeader(
    domain,
    environmemt,
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

  const season = parse(await readFile(path, "utf-8"));

  console.log(
    "Object to deploy:\n",
    util.inspect(season, { showHidden: false, depth: null, colors: true })
  );

  try {
    await got.post(`${baseUrl}/api/v1/season`, {
      headers: {
        authorization,
      },
      json: season,
    });

    console.log("\nSeason deploy completed\n");
  } catch (err) {
    console.error("\nError during season deploy\n", err);
  }
};
