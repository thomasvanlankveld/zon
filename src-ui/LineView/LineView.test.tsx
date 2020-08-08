import React from 'react';
import { render } from '@testing-library/react';

import LineView from './LineView';
import { createTreeFromFiles } from '../file-tree';

describe('LineView', () => {
  it('renders breadcrumbs, a diagram and a list', () => {
    expect.hasAssertions();

    // Given a project
    const project = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // When I render the line view
    const { asFragment, getByRole } = render(<LineView data={project} />);

    // Then I see the project name in the breadcrumbs
    expect(getByRole('navigation', { name: /breadcrumbs/ })).toHaveTextContent('my-project');

    // And I see the project visualized
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <nav
          aria-label="breadcrumbs"
          style="margin-bottom: 20px;"
        >
          <button
            class="sc-AxjAm fkFbrw"
            style="color: rgb(175, 240, 91); cursor: pointer;"
          >
            <span>
              my-project
            </span>
          </button>
        </nav>
        <div
          class="sc-AxiKw kvctUQ"
        >
          <svg
            aria-label="my-project content diagram"
            height="500"
            viewBox="-250 -250 500 500"
            width="500"
          >
            <path
              aria-label="my-project arc: 100 lines"
              class="sc-AxirZ gEHNzQ"
              d="M5.102694996447305e-15,-83.33333333333333A83.33333333333333,83.33333333333333,0,1,1,-5.102694996447305e-15,83.33333333333333A83.33333333333333,83.33333333333333,0,1,1,5.102694996447305e-15,-83.33333333333333Z"
            />
            <path
              aria-label="my-project/src arc: 70 lines"
              class="sc-AxirZ eyvvLs"
              d="M0.000012499986981635035,-166.6666666666662A166.66666666666666,166.66666666666666,0,1,1,-158.5094155198167,51.5028442840185L-79.2547058285535,25.751428086106067A83.33333333333333,83.33333333333333,0,1,0,0.000012499986976532307,-83.33333333333239Z"
            />
            <path
              aria-label="my-project/package.json arc: 30 lines"
              class="sc-AxirZ ckCNTr"
              d="M-158.50942324523353,51.502820507630375A166.66666666666666,166.66666666666666,0,0,1,-0.000012499987002045817,-166.6666666666662L-0.000012499986986737697,-83.33333333333239A83.33333333333333,83.33333333333333,0,0,0,-79.2547135539703,25.75140430971794Z"
            />
            <path
              aria-label="my-project/src/foo.ts arc: 50 lines"
              class="sc-AxirZ kZsyof"
              d="M0.000012499987005241455,-249.9999999999997A250,250,0,0,1,0.000012499987005241455,249.9999999999997L0.000012499986981635035,166.6666666666662A166.66666666666666,166.66666666666666,0,0,0,0.000012499986981635035,-166.6666666666662Z"
            />
            <path
              aria-label="my-project/src/bar.ts arc: 20 lines"
              class="sc-AxirZ ivsFwH"
              d="M-0.000012499986974625285,249.9999999999997A250,250,0,0,1,-237.76412521107972,77.25426048193081L-158.5094155198167,51.5028442840185A166.66666666666666,166.66666666666666,0,0,0,-0.000012499986961224256,166.6666666666662Z"
            />
          </svg>
          <div>
            <h3
              style="color: white;"
            >
              <strong>
                my-project
              </strong>
              : 100
            </h3>
            <nav
              aria-label="my-project content list"
            >
              <button
                class="sc-AxjAm fkFbrw"
                style="color: rgb(251, 150, 51); cursor: pointer; display: block; margin: 12px 0px;"
              >
                <strong>
                  src
                </strong>
                : 70 lines
              </button>
              <button
                class="sc-AxjAm fkFbrw"
                style="color: rgb(54, 140, 225); cursor: pointer; display: block; margin: 12px 0px;"
              >
                <strong>
                  package.json
                </strong>
                : 30 lines
              </button>
            </nav>
          </div>
        </div>
      </DocumentFragment>
    `);
  });
});
