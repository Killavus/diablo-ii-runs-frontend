export enum RunType {
  Pit = "pit",
  Andariel = "andariel",
  Cows = "cows",
  Countess = "countess",
  ArcaneSanctuary = "arcane_sanctuary",
  AncientTunnels = "ancient_tunnels",
  Travincal = "travincal",
  Mephisto = "mephisto",
  Chaos = "chaos",
  Pindle = "pindle",
  Shenk = "shenk",
  Eldritch = "eldritch",
  Worldstone = "worldstone",
  Baal = "baal",
}

export enum Act {
  One = "act-i",
  Two = "act-ii",
  Three = "act-iii",
  Four = "act-iv",
  Five = "act-v",
}

const ACT_LABELS: Record<Act, string> = {
  [Act.One]: "Act I",
  [Act.Two]: "Act II",
  [Act.Three]: "Act III",
  [Act.Four]: "Act IV",
  [Act.Five]: "Act V",
};

const ACT_RUNS: Record<Act, RunType[]> = {
  [Act.One]: [RunType.Countess, RunType.Pit, RunType.Andariel, RunType.Cows],
  [Act.Two]: [RunType.AncientTunnels, RunType.ArcaneSanctuary],
  [Act.Three]: [RunType.Travincal, RunType.Mephisto],
  [Act.Four]: [RunType.Chaos],
  [Act.Five]: [
    RunType.Pindle,
    RunType.Shenk,
    RunType.Eldritch,
    RunType.Worldstone,
    RunType.Baal,
  ],
};

const RUN_TYPE_LABELS: Record<RunType, string> = {
  [RunType.Pit]: "The Pit",
  [RunType.Andariel]: "Andariel",
  [RunType.Cows]: "Cows",
  [RunType.Countess]: "The Countess",
  [RunType.ArcaneSanctuary]: "Arcane Sanctuary",
  [RunType.AncientTunnels]: "Ancient Tunnels",
  [RunType.Travincal]: "Travincal",
  [RunType.Mephisto]: "Mephisto",
  [RunType.Chaos]: "Chaos Sanctuary",
  [RunType.Pindle]: "Pindleskin",
  [RunType.Shenk]: "Shenk",
  [RunType.Eldritch]: "Eldritch",
  [RunType.Worldstone]: "Worldstone Keep",
  [RunType.Baal]: "Baal",
};

export function runTypeAct(runType: RunType): Act {
  return (
    Object.entries(ACT_RUNS).find(([, actRuns]) =>
      actRuns.includes(runType)
    )! as [Act, RunType[]]
  )[0];
}

export function actRunTypes(act: Act): RunType[] {
  return ACT_RUNS[act];
}

export function actsList(): Act[] {
  return [Act.One, Act.Two, Act.Three, Act.Four, Act.Five];
}

export function runTypesList(): RunType[] {
  return [
    RunType.AncientTunnels,
    RunType.Andariel,
    RunType.ArcaneSanctuary,
    RunType.Baal,
    RunType.Chaos,
    RunType.Countess,
    RunType.Cows,
    RunType.Eldritch,
    RunType.Mephisto,
    RunType.Pindle,
    RunType.Pit,
    RunType.Shenk,
    RunType.Travincal,
    RunType.Worldstone,
  ];
}

export function actLabel(act: Act): string {
  return ACT_LABELS[act];
}

export function runTypeLabel(runType: RunType): string {
  return RUN_TYPE_LABELS[runType];
}
