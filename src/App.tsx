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
  Act,
  actLabel,
  actRunTypes,
  actsList,
  isRunType,
  RunType,
  runTypeAct,
  runTypeLabel,
  runTypesList,
} from "./runs";
import React from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

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

function useRunFilters(): [
  RunType[] | null,
  (runType: RunType) => void,
  Act[]
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilters = (searchParams.get("filters") || "")
    .split(",")
    .filter(isRunType);

  const activeActs: Act[] =
    activeFilters.length > 0
      ? activeFilters.reduce((acts, runType) => {
          const act = runTypeAct(runType);

          if (!acts.includes(act)) {
            acts.push(act);
          }

          return acts;
        }, [] as Act[])
      : actsList();

  const toggleFilter = useCallback(
    (runType: RunType) => {
      const filterPosition = activeFilters.indexOf(runType);

      if (filterPosition === -1) {
        setSearchParams({ filters: [...activeFilters, runType].join(",") });
      } else {
        const newFilters = [
          ...activeFilters.slice(0, filterPosition),
          ...activeFilters.slice(filterPosition + 1),
        ];

        if (newFilters.length === 0) {
          setSearchParams({});
        } else {
          setSearchParams({
            filters: newFilters.join(","),
          });
        }
      }
    },
    [setSearchParams, activeFilters]
  );

  return [
    activeFilters.length > 0 ? activeFilters : null,
    toggleFilter,
    activeActs,
  ];
}

type FilterInputProps = {
  runType: RunType;
};

const FilterInput: React.FC<FilterInputProps> = ({ runType }) => {
  const [filters, toggleFilter] = useRunFilters();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(() => {
      toggleFilter(runType);
    }, [runType, toggleFilter]);

  return (
    <input
      type="checkbox"
      checked={(filters || []).includes(runType)}
      onChange={handleChange}
    />
  );
};

type ActFilterProps = {
  act: Act;
};

const ActFilter: React.FC<ActFilterProps> = ({ act }) => {
  return (
    <section>
      <h2>{actLabel(act)}</h2>
      {actRunTypes(act).map((runType) => (
        <label key={runType}>
          <FilterInput runType={runType} />
          <span>{runTypeLabel(runType)}</span>
        </label>
      ))}
    </section>
  );
};

const Filters: React.FC = () => {
  return (
    <article className="filters">
      <h1>Filters</h1>
      {actsList().map((act) => (
        <ActFilter key={act} act={act} />
      ))}
    </article>
  );
};

type RunCounterProps = {
  runType: RunType;
  count: number;
  initialCount: number;
};

const RunCounter: React.FC<RunCounterProps> = ({
  runType,
  count,
  initialCount,
}) => {
  const activeDifference = count - initialCount;
  const { scope } = useParams();

  const queryClient = useQueryClient();
  const handleCreationSuccess = useCallback(
    (newRun: Run) => {
      const queryKey = `runsList-${scope!}`;

      const listQueryState = queryClient.getQueryState<Run[], APIError>(
        queryKey
      )!;

      if (listQueryState.status === "success") {
        queryClient.setQueryData<Run[]>(queryKey, (data) => {
          return [...data!, newRun];
        });
      }
    },
    [queryClient, scope]
  );

  const createRun = useMutation<Run, APIError>(
    `create-${runType}-${scope!}-run`,
    () => API.create(scope!, runType),
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

type RunCountersListProps = {
  runs: Run[];
  initialRuns: Run[];
};

const IncrementAllButton: React.FC = () => {
  const [filters] = useRunFilters();
  const { scope } = useParams();

  const queryClient = useQueryClient();
  const handleCreationSuccess = useCallback(
    (newRuns: Run[]) => {
      const queryKey = `runsList-${scope!}`;

      const listQueryState = queryClient.getQueryState<Run[], APIError>(
        queryKey
      )!;

      if (listQueryState.status === "success") {
        queryClient.setQueryData<Run[]>(queryKey, (data) => {
          return [...data!, ...newRuns];
        });
      }
    },
    [queryClient, scope]
  );

  const toggleAll = useMutation(
    "runs-toggleAll",
    () => API.createBatch(scope!, filters!),
    { onSuccess: handleCreationSuccess }
  );

  const handleClick = useCallback(() => {
    toggleAll.mutate();
  }, [toggleAll]);

  return (
    <button type="button" className="toggle-all" onClick={handleClick}>
      + All
    </button>
  );
};

const RunCountersList: React.FC<RunCountersListProps> = ({
  runs,
  initialRuns,
}) => {
  const [filters, , filterActs] = useRunFilters();
  const hasFilters = filters !== null;

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
          {!hasFilters && <h2 className="act-label">{actLabel(act)}</h2>}
          {filterActs.includes(act) && (
            <section key={act} className="run-counters">
              {actRunTypes(act)
                .map(
                  (runType) =>
                    (!hasFilters || filters.includes(runType)) && (
                      <RunCounter
                        key={runType}
                        runType={runType}
                        count={runCounts[runType]}
                        initialCount={initialRunCounts[runType]}
                      />
                    )
                )
                .filter(Boolean)}
            </section>
          )}
        </React.Fragment>
      ))}
      {hasFilters && filters.length > 1 && <IncrementAllButton />}
    </>
  );
};

const RunCounters: React.FC = () => {
  const initialRunList = useRef<Run[]>();
  const { scope } = useParams();

  const runList = useQuery<Run[], APIError>(
    `runsList-${scope!}`,
    () => API.list(scope!),
    {
      onSuccess(runs) {
        if (!initialRunList.current) {
          initialRunList.current = runs;
        }
      },
    }
  );

  return (
    <article className="runs-data">
      {runList.isError && <p>Failed to fetch runs data.</p>}
      {runList.isLoading && <p>Loading…</p>}
      {runList.isSuccess && (
        <RunCountersList
          runs={runList.data!}
          initialRuns={initialRunList.current!}
        />
      )}
    </article>
  );
};

function zeroPadded(n: number, padSize: number) {
  const nString = n.toString();
  const zerosToAdd = Math.max(padSize - nString.length, 0);

  return `${"0".repeat(zerosToAdd)}${nString}`;
}

const RunClock: React.FC = () => {
  const startDate = useRef<Date>(new Date());
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const clockTick = setInterval(() => {
      const now = new Date();
      const startDateUnix = Math.floor(startDate.current.getTime() / 1000);
      const nowDateUnix = Math.floor(now.getTime() / 1000);

      setSecondsElapsed(nowDateUnix - startDateUnix);
    }, 1000);
    return () => clearInterval(clockTick);
  }, []);

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;

  return (
    <article className="clock">
      {minutes}:{zeroPadded(seconds, 2)}
    </article>
  );
};

const RunsPage: React.FC = () => {
  const { scope } = useParams();

  useEffect(() => {
    document.title = `${scope} – Diablo II Runs`;

    return () => {
      document.title = "Diablo II Runs";
    };
  }, []);

  return (
    <main className="runs">
      <RunClock />
      <Filters />
      <RunCounters />
    </main>
  );
};

const EnterScopePage: React.FC = () => {
  const navigate = useNavigate();
  const [scope, setScope] = useState("");

  const handleSubmit: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      navigate(`../runs/${scope}`, { replace: true });
    },
    [navigate, scope]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setScope(event.target.value),
    []
  );

  return (
    <main className="enter-scope">
      <form onSubmit={handleSubmit}>
        <label>
          Please enter an unique name for your run logs.
          <input type="text" onChange={handleChange} value={scope} />
        </label>
        <button type="submit">Go</button>
      </form>
    </main>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="runs/:scope" element={<RunsPage />} />
        <Route path="enter" element={<EnterScopePage />} />
        <Route path="*" element={<Navigate to="enter" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
