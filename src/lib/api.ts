import createClient from "openapi-fetch";
import { paths } from "./path-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const client = createClient<paths>({ baseUrl: BASE_URL });

export function authClient(token: string) {
  return createClient<paths>({
    baseUrl: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
}
