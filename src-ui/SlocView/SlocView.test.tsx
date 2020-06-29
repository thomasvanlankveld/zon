import React from 'react';
import { render } from '@testing-library/react';

import SlocView from './SlocView';
import { createTreeFromFiles } from '../file-tree';

describe('SlocView', () => {
  it('renders breadcrumbs, a diagram and a list', () => {
    expect.hasAssertions();

    const project = createTreeFromFiles([{ path: 'test/foo.js', data: { numberOfLines: 5 } }]);
    const { asFragment } = render(<SlocView data={project} />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          style="margin-bottom: 20px;"
        >
          <button
            class="sc-AxjAm fkFbrw"
            style="color: rgb(175, 240, 91); cursor: pointer;"
          >
            <span>
              test
            </span>
          </button>
        </div>
        <div
          class="sc-AxiKw kvctUQ"
        >
          <svg
            height="500"
            viewBox="-250 -250 500 500"
            width="500"
          >
            <path
              class="sc-AxirZ gEHNzQ"
              d="M7.654042494670958e-15,-125A125,125,0,1,1,-7.654042494670958e-15,125A125,125,0,1,1,7.654042494670958e-15,-125Z"
            />
            <path
              class="sc-AxirZ gEHNzQ"
              d="M1.5308084989341916e-14,-250A250,250,0,1,1,-1.5308084989341916e-14,250A250,250,0,1,1,1.5308084989341916e-14,-250M-2.2962127484012872e-14,-125A125,125,0,1,0,2.2962127484012872e-14,125A125,125,0,1,0,-2.2962127484012872e-14,-125Z"
            />
          </svg>
          <div>
            <h3
              style="color: white;"
            >
              <strong>
                test
              </strong>
              : 5
            </h3>
            <p>
              <button
                class="sc-AxjAm fkFbrw"
                style="color: rgb(175, 240, 91); cursor: pointer;"
              >
                <strong>
                  foo.js
                </strong>
                : 5 lines
              </button>
            </p>
          </div>
        </div>
      </DocumentFragment>
    `);
  });
});
