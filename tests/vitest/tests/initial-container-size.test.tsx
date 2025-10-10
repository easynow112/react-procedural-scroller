import { expect, test } from "vitest";
import { getData } from "../../data/data";
import Container from "../../app/src/scenarios/date-scroller";
import { render, screen } from "@testing-library/react";

test("items should display on the initial render if 'initialContainerSize' is defined", () => {
  const props = getData().scenarioProps;
  render(
    <Container
      validateLayouts={{ container: true, items: false }}
      {...props}
    />,
  );
  const items = screen.queryAllByTestId(/^item-/);
  expect(items.length).toBeGreaterThan(0);
});

test("items should not display on the initial render if 'initialContainerSize' is undefined", () => {
  const props = getData().scenarioProps;
  delete props.containerBox;
  render(
    <Container
      validateLayouts={{ container: true, items: false }}
      {...props}
    />,
  );
  const items = screen.queryAllByTestId(/^item-/);
  expect(items.length).toBe(0);
});
