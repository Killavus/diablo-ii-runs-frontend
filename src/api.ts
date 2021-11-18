import { RunType } from "./runs";

export type Run = {
  id: number;
  type: RunType;
  ranAt: Date;
};

export type APIError = {
  code: number;
  message: string;
};

function deserializeRun(record: Record<string, any>): Run {
  const { id, type, ran_at: ranAt } = record;
  return { id, type, ranAt: new Date(ranAt) };
}

function defaultAPIBaseURL(): string {
  return import.meta.env.VITE_API_URL;
}

export function createAPI(baseURL: string) {
  const apiURL = (path: string) => `${baseURL}/${path}`;
  return {
    async list() {
      const response = await fetch(apiURL("api/runs"), { method: "get" });
      const data = await response.json();

      if (response.status > 399) {
        throw new Error(
          "Failed to list runs: " + JSON.stringify(data, null, 1)
        );
      }

      return data.map(deserializeRun);
    },
    async create(runType: RunType) {
      const response = await fetch(apiURL("api/runs"), {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: runType }),
      });

      const data = await response.json();

      if (response.status > 399) {
        throw new Error(
          "Failed to create run: " + JSON.stringify(data, null, 1)
        );
      }

      return deserializeRun(data);
    },
    async createBatch(runTypes: RunType[]) {
      return await Promise.all([
        runTypes.map((runType) => this.create(runType)),
      ]);
    },
  };
}

export default createAPI(defaultAPIBaseURL());
