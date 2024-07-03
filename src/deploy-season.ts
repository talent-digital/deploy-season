import { readFile } from "fs/promises";
import { join } from "path";
import { parse } from "yaml";
import util from "util";
import got from "got";
import { existsSync } from "fs";
import { SeasonDefinition } from "@talentdigital/season";
import * as core from "@actions/core";

type DeploySeasonInput = {
  repositoryId: string;
  baseUrl: string;
  authorization: string;
  rootPath: string;
};

export const deploySeason = async ({
  repositoryId,
  baseUrl,
  authorization,
  rootPath,
}: DeploySeasonInput) => {
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

  const json = {
    ...season,
    id: season.id !== undefined ? season.id : repositoryId,
  };

  core.info(
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
    core.info("\nSeason deploy completed\n");
  } catch (err) {
    const statusMsg = err.response.status
      ? `, status: ${err.response.status}`
      : "";
    const bodyMsg = util.inspect(err.response.body, {
      showHidden: false,
      depth: null,
      colors: true,
    });

    core.setFailed(`Error during season deploy ${statusMsg}, ${bodyMsg}`);
  }
};
