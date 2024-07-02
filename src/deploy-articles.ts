const { readFile, readdir } = require("fs").promises;
const yamlFront = require("yaml-front-matter");
import { join } from "path";
import * as core from "@actions/core";
import got from "got";
import { ArticleWeb } from "@talentdigital/api-client";

type DeployArticlesInput = {
  authorization: string;
  baseUrl: string;
  rootPath: string;
};

/**
 * Deploy articles to the server. If the article already exists on the server, it will be skipped.
 * For now if you want to update an article you need to delete it first.
 */
export const deployArticles = async ({
  authorization,
  baseUrl,
  rootPath,
}: DeployArticlesInput) => {
  try {
    const path = join(rootPath, "articles");
    const files = await readdir(path);
    const mdFiles = files.filter((file) => file.endsWith(".md"));
    core.info(`Found ${mdFiles.length} files`);

    const serverArticles = (await got
      .get(`${baseUrl}/api/v1/articles`, {
        headers: {
          authorization,
        },
        searchParams: {
          drafts: true,
        },
      })
      .json()) as ArticleWeb[];

    for (const file of mdFiles) {
      const content = await readFile(join(path, file), {
        encoding: "utf-8",
      });
      const article = yamlFront.loadFront(content);

      if (serverArticles.some((a) => a.title === article.title)) {
        core.info(
          `Article ${article.title} already exists on the server, skipping`
        );
        continue;
      }

      core.info(`Deploying article ${JSON.stringify(article)}\n`);

      const json: ArticleWeb = {
        author: article.author ?? "",
        title: article.title ?? "",
        created: article.created,
        tags: article.tags ?? [],
        teaser: article.teaser ?? "",
        content: article.__content.trim() ?? "",
        draft: article.draft ?? true,
        videoFileName: article.videoFileName ?? "",
        abstract: article.abstract ?? "",
      };

      await got.post(`${baseUrl}/api/v1/articles`, {
        headers: {
          authorization,
        },
        json,
      });
    }
  } catch (e) {
    core.setFailed(JSON.stringify(e));
  }

  core.info("\nArticles deploy completed\n");
};
