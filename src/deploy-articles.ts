import { promises as fsPromises } from "fs";
import * as yamlFront from "yaml-front-matter";
import { join } from "path";
import * as core from "@actions/core";
import got from "got";
import { ArticleWeb } from "@talentdigital/api-client";
import fetch from "node-fetch";

const { readFile, readdir } = fsPromises;

type ArticleMd = {
  __content?: string;
  abstract?: string;
  author?: string;
  competences?: number[];
  created?: string;
  draft?: boolean;
  language?: string;
  slug?: string;
  tags?: string[];
  teaser?: string;
  title?: string;
  videoFileName?: string;
};

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

    const serverArticles = await getServerArticles(authorization, baseUrl);

    for (const file of mdFiles) {
      const content = await readFile(join(path, file), {
        encoding: "utf-8",
      });
      const article: ArticleMd = yamlFront.loadFront(content);

      if (serverArticles.some((a) => a.title === article.title)) {
        core.info(
          `Article ${article.title} already exists on the server, skipping`
        );
        continue;
      }

      const imageName = article.teaser?.split("/").pop();

      await uploadImage(article, authorization, baseUrl, imageName, rootPath);
      await uploadArticle(article, authorization, baseUrl, imageName);
    }
  } catch (e) {
    core.setFailed(JSON.stringify(e));
  }

  core.info("\nArticles deploy completed\n");
};

const uploadImage = async (
  article: ArticleMd,
  authorization: string,
  baseUrl: string,
  fileName: string,
  rootPath: string
) => {
  core.info(`Uploading image ${fileName}\n`);
  const blob: Blob = await getBlobFromFilePath(join(rootPath, article.teaser));

  const imageFile = new File([blob], fileName, {
    type: "image",
  });

  const formData = new FormData();

  formData.append(
    "files",
    new File([imageFile as Blob], fileName, {
      type: "image",
    })
  );

  try {
    const response = await fetch(`${baseUrl}/api/v1/assets/image/upload`, {
      method: "POST",
      headers: {
        authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to upload: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }
    core.info(`Uploaded ${fileName} successfully\n`);
  } catch (error) {
    if (error.response) {
      core.setFailed(`Error response from server: ${error.response.body}`);
    } else {
      core.setFailed(`Request error: ${error}`);
    }
    throw error;
  }
};

const uploadArticle = async (
  article: ArticleMd,
  authorization: string,
  baseUrl: string,
  fileName: string
) => {
  core.info(`Deploying article ${JSON.stringify(article)}\n`);

  const json: ArticleWeb = {
    author: article.author ?? "",
    title: article.title ?? "",
    created: article.created,
    tags: article.tags ?? [],
    teaser: fileName ?? "",
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
};

const getServerArticles = async (
  authorization: string,
  baseUrl: string
): Promise<ArticleWeb[]> => {
  return await got
    .get(`${baseUrl}/api/v1/articles`, {
      headers: {
        authorization,
      },
      searchParams: {
        drafts: true,
      },
    })
    .json();
};

const getBlobFromFilePath = async (filePath) => {
  try {
    const absolutePath = join(filePath);
    const fileBuffer = await readFile(absolutePath);
    return new Blob([fileBuffer]);
  } catch (error) {
    core.setFailed(`Error reading file: ${error}`);
    throw error;
  }
};
