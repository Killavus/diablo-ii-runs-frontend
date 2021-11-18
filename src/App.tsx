import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { APIError, default as API, Run } from "./api";
import {
  actLabel,
  actRunTypes,
  actsList,
  RunType,
  runTypeLabel,
  runTypesList,
} from "./runs";
import React from "react";

const queryClient = new QueryClient();

function countRuns(runs: Run[]): Record<RunType, number> {
  const initialCounters = Object.fromEntries(
    runTypesList().map((runType) => [runType, 0])
  ) as Record<RunType, number>;

  return runs.reduce((counters, { type }) => {
    counters[type] += 1;
    return counters;
  }, initialCounters);
}

type RunCountersListProps = {
  runs: Run[];
  initialRuns: Run[];
};

type RunCounterProps = {
  runType: RunType;
  count: number;
  initialCount: number;
};

const Filters: React.FC = () => {
  return <p></p>;
};

const RunCounter: React.FC<RunCounterProps> = ({
  runType,
  count,
  initialCount,
}) => {
  const activeDifference = count - initialCount;

  const queryClient = useQueryClient();
  const handleCreationSuccess = useCallback(
    (newRun: Run) => {
      const listQueryState = queryClient.getQueryState<Run[], APIError>(
        "runsList"
      )!;

      if (listQueryState.status === "success") {
        queryClient.setQueryData<Run[]>("runsList", (data) => {
          return [...data!, newRun];
        });
      }
    },
    [queryClient]
  );

  const createRun = useMutation<Run, APIError>(
    `create-${runType}-run`,
    () => API.create(runType),
    { onSuccess: handleCreationSuccess }
  );

  const handleRecord = useCallback(() => {
    createRun.mutate();
  }, [createRun]);

  return (
    <article className="run-counter">
      <h1>{runTypeLabel(runType)}</h1>
      <p>
        {count}
        {activeDifference > 0 && (
          <span className="difference"> (+{activeDifference})</span>
        )}
      </p>
      <button aria-label="Record run" onClick={handleRecord}>
        +
      </button>
    </article>
  );
};

const RunCountersList: React.FC<RunCountersListProps> = ({
  runs,
  initialRuns,
}) => {
  const runCounts: Record<RunType, number> = useMemo(
    () => countRuns(runs),
    [runs]
  );

  const initialRunCounts: Record<RunType, number> = useMemo(
    () => countRuns(initialRuns),
    [initialRuns]
  );

  return (
    <>
      {actsList().map((act) => (
        <React.Fragment key={act}>
          <h2 className="act-label">{actLabel(act)}</h2>
          <section key={act} className="run-counters">
            {actRunTypes(act).map((runType) => (
              <RunCounter
                key={runType}
                runType={runType}
                count={runCounts[runType]}
                initialCount={initialRunCounts[runType]}
              />
            ))}
          </section>
        </React.Fragment>
      ))}
    </>
  );
};

const RunCounters: React.FC = () => {
  const initialRunList = useRef<Run[]>();
  const runList = useQuery<Run[], APIError>("runsList", API.list, {
    onSuccess(runs) {
      if (!initialRunList.current) {
        initialRunList.current = runs;
      }
    },
  });

  return (
    <>
      {runList.isError && <p>Failed to fetch runs data.</p>}
      {runList.isLoading && <p>Loading…</p>}
      {runList.isSuccess && (
        <RunCountersList
          runs={runList.data!}
          initialRuns={initialRunList.current!}
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <main className="application">
      <Filters />
      <RunCounters />
    </main>
  </QueryClientProvider>
);

export default App;
