import got from "got";
import * as core from "@actions/core";
import util from "util";

export const getAuthorizationHeader = async (
  domain: string,
  environment: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  try {
    const { token_type, access_token }: any = await got
      .post(
        `https://${environment}.${domain}/auth/realms/talentdigital-${environment}/protocol/openid-connect/token`,
        {
          form: {
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
          },
        }
      )
      .json();

    return `${token_type} ${access_token}`;
  } catch (err) {
    const statusMsg = err.response.status
      ? `, status: ${err.response.status}`
      : "";
    const bodyMsg = util.inspect(err.response.body, {
      showHidden: false,
      depth: null,
      colors: true,
    });
    core.setFailed(`Failed to authorize ${statusMsg}, ${bodyMsg}`);
  }
};
