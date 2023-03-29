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
    core.setFailed(
      `\nFailed to authorize\n ${util.inspect(err, {
        showHidden: false,
        depth: null,
        colors: true,
      })}`
    );
  }
};
