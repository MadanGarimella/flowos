import { useMemo } from "react";
import { download, request } from "../api/client";

export function useApi(token) {
  return useMemo(() => ({
    get: (path) => request(path, { method: "GET" }, token),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }, token),
    upload: (path, body) => request(path, { method: "POST", body }, token),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }, token),
    delete: (path) => request(path, { method: "DELETE" }, token),
    download: (path) => download(path, token),
  }), [token]);
}
