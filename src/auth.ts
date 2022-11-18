import got from "got";

export const getAuthorizationHeader = async (
  domain: string,
  environmemt: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  const { token_type, access_token }: any = await got
    .post(
      `https://${environmemt}.${domain}/auth/realms/talentdigital-${environmemt}/protocol/openid-connect/token`,
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
};
