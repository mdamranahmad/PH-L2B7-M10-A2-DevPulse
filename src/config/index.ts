import dotenv from "dotenv";

import { env } from "process";

dotenv.config();

export const config = {
  port: env.PORT as string,
  database_url: env.CONNECTION_STRING as string,
  secret_key: env.SECRET as string,
  refresh_secret_key: env.SECRET_REFRESH as string,
  node_env: env.NODE_ENV as string,
};
