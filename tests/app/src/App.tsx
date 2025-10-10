import { type ComponentType, Suspense, useEffect, useState } from "react";
const scenarios = import.meta.glob("./scenarios/**/*.tsx");
import { urlDecodeObject } from "./lib/url.ts";
import type { ScenarioProps } from "./types/scenarios.ts";

function App() {
  const [scenario, setScenario] = useState<null | {
    Component: ComponentType<ScenarioProps>;
    props: ScenarioProps;
  }>(null);

  useEffect(() => {
    (async () => {
      // 1.) Get scenario component:
      const path = `./scenarios${window.location.pathname}.tsx`;
      const importScenario = scenarios[path];
      if (!importScenario) {
        throw new Error(`Could not find a scenario for path: ${path}`);
      }
      const scenario = (
        (await importScenario()) as { default: ComponentType<ScenarioProps> }
      ).default;

      // 2.) Get scenario props:
      const params = new URLSearchParams(window.location.search);
      const encodedProps = params.get("props");
      if (!encodedProps) {
        return setScenario(() => ({
          Component: scenario,
          props: {} as ScenarioProps,
        }));
      }
      const props = urlDecodeObject(encodedProps);
      // 3.) Set scenario state:
      setScenario(() => ({
        Component: scenario,
        props: props as ScenarioProps,
      }));
    })();
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {scenario && <scenario.Component {...scenario.props} />}
    </Suspense>
  );
}

export default App;
