import React from 'react';
import { render } from '@testing-library/react';

import createProject from '../../adapters/createProject';
import LineDiagram from './LineDiagram';
import zonColoredHierarchy from '../color';

describe('LineDiagram', () => {
  it('renders a diagram of the given project', () => {
    expect.hasAssertions();

    // Given a project
    const project = createProject([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);
    const data = zonColoredHierarchy(project);

    // When I render the line diagram
    const { asFragment } = render(
      <LineDiagram
        projectRoot={data}
        diagramRootFilePath={project.path}
        isHighlighted={(): boolean => false}
        setHoveredArcFilePath={(): void => {
          /* Empty */
        }}
        setDiagramRootFilePath={(): void => {
          /* Empty */
        }}
      />
    );

    // Then I see the project visualized
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <svg
          aria-label="my-project line count diagram"
          height="500"
          role="img"
          viewBox="-250 -250 500 500"
          width="500"
        >
          <path
            class="sc-AxjAm gFUYdV"
            d="M5.102694996447305e-15,-83.33333333333333A83.33333333333333,83.33333333333333,0,1,1,-5.102694996447305e-15,83.33333333333333A83.33333333333333,83.33333333333333,0,1,1,5.102694996447305e-15,-83.33333333333333Z"
            data-testid="diagram-path-my-project"
          />
          <path
            class="sc-AxjAm glYROb"
            d="M0.000012499986981635035,-166.6666666666662A166.66666666666666,166.66666666666666,0,1,1,-158.5094155198167,51.5028442840185L-79.2547058285535,25.751428086106067A83.33333333333333,83.33333333333333,0,1,0,0.000012499986976532307,-83.33333333333239Z"
            data-testid="diagram-path-my-project/src"
          />
          <path
            class="sc-AxjAm jXgRiu"
            d="M-158.50942324523353,51.502820507630375A166.66666666666666,166.66666666666666,0,0,1,-0.000012499987002045817,-166.6666666666662L-0.000012499986986737697,-83.33333333333239A83.33333333333333,83.33333333333333,0,0,0,-79.2547135539703,25.75140430971794Z"
            data-testid="diagram-path-my-project/package.json"
          />
          <path
            class="sc-AxjAm kPTVoB"
            d="M0.000012499987005241455,-249.9999999999997A250,250,0,0,1,0.000012499987005241455,249.9999999999997L0.000012499986981635035,166.6666666666662A166.66666666666666,166.66666666666666,0,0,0,0.000012499986981635035,-166.6666666666662Z"
            data-testid="diagram-path-my-project/src/foo.ts"
          />
          <path
            class="sc-AxjAm gBarEe"
            d="M-0.000012499986974625285,249.9999999999997A250,250,0,0,1,-237.76412521107972,77.25426048193081L-158.5094155198167,51.5028442840185A166.66666666666666,166.66666666666666,0,0,0,-0.000012499986961224256,166.6666666666662Z"
            data-testid="diagram-path-my-project/src/bar.ts"
          />
        </svg>
      </DocumentFragment>
    `);
  });
});
