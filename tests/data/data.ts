import { writeFileSync } from "fs";
import * as path from "node:path";
import { getRandom } from "./random";
import { type ScenarioProps } from "../app/src/types/scenarios";

interface TestData {
  scenarioProps: ScenarioProps;
  randomDirection: 1 | -1;
}

let data: TestData | null = null;

function generateData(seed: number): TestData {
  const random = getRandom(seed);
  return {
    scenarioProps: {
      scrollDirection: random.pickFromArray(["horizontal", "vertical"]),
      initialScroll: {
        block: random.pickFromArray(["start", "center", "end"]),
        index: Math.floor(random.float(-10000, 10000)),
      },
      minItemSize: random.generateArray(
        Math.floor(random.float(50, 200)),
        () => {
          return random.float(10, 300);
        },
      ),
      scrollAreaScale: Math.floor(random.float(2, 10)),
      paddingAreaScale: {
        start: Math.floor(random.float(1, 5)),
        end: Math.floor(random.float(1, 5)),
      },
      containerBox: {
        height: random.float(300, 1000),
        width: random.float(300, 1000),
        padding: Math.floor(random.float(10, 30)),
        margin: Math.floor(random.float(10, 30)),
        border: `${Math.floor(random.float(30, 30))}px solid rgba(0, 0, 0, 0.5)`,
      },
      itemBox: {
        padding: Math.floor(random.float(10, 30)),
        margin: Math.floor(random.float(10, 30)),
        border: `${Math.floor(random.float(10, 30))}px solid red`,
      },
      wrapperBox: {
        padding: Math.floor(random.float(10, 30)),
        margin: `${Math.floor(random.float(500, 2000))}px ${Math.floor(random.float(200, 700))}px ${Math.floor(random.float(200, 700))}px ${Math.floor(random.float(200, 700))}px`,
      },
    },
    randomDirection: random.float(0, 1) > 0.5 ? 1 : -1,
  };
}

function getSeed(): number {
  let seed: number;
  if (process.env.SEED) {
    seed = parseInt(process.env.SEED, 10);
  } else {
    seed = Math.floor(Math.random() * 0xffffffff);
  }
  process.env.SEED = String(seed);
  return seed;
}

export function getData(): TestData {
  const testRunner = process.env.npm_lifecycle_script as
    | "playwright"
    | "vitest";
  const logPath = `./tests/${testRunner === "playwright" ? "playwright" : "vitest"}/output/test-data.log`;
  function log(message: string) {
    const timestamp = new Date().toISOString();
    writeFileSync(path.resolve(logPath), `[${timestamp}] ${message}\n`, {
      flag: "a",
    });
  }
  if (!data) {
    const seed = getSeed();
    log(
      `Running tests with seed: ${seed}. To re-run tests with this same seed, run: 'SEED=${seed} npm run test:${testRunner === "playwright" ? "e2e" : "unit"}'\n`,
    );
    const dataA = generateData(seed);
    const dataB = generateData(seed);
    if (JSON.stringify(dataA) !== JSON.stringify(dataB)) {
      const errorString = `Data generation mismatch: generateData() produced inconsistent results with the same seed.`;
      log(
        `${errorString}\nFirst run: ${JSON.stringify(dataA, null, 2)}\nSecond run: ${JSON.stringify(dataB, null, 2)}`,
      );
      throw new Error(errorString);
    }
    data = dataA;
  }
  return data;
}
