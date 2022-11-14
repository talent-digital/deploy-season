import { readFile } from "fs/promises";
import { join } from "path";
import { getAuthorizationHeader } from "./auth";
import { parse } from "yaml";
import util from "util";
import got from "got";

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
  const path = join(rootPath, "season.yaml");
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
