import createClient from "openapi-fetch";
import { paths } from "./path-api";

export const client = createClient<paths>({ baseUrl: "/" });

export function authClient(token: string) {
  return createClient<paths>({
    baseUrl: "/",
    headers: { Authorization: `Bearer ${token}` },
  });
}
