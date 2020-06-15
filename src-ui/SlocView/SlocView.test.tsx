import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import SlocView from './SlocView';
import { NodeTypeLeaf } from '../utility/tree';

Enzyme.configure({ adapter: new Adapter() });

describe('SlocView', () => {
  it('renders breadcrumbs, a diagram and a list', () => {
    expect.hasAssertions();
    const wrapper = shallow(
      <SlocView data={{ type: NodeTypeLeaf, filename: 'test', path: 'test', numberOfLines: 5 }} />
    );
    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<div style=\\"margin-bottom:20px\\"><button style=\\"color:rgb(175, 240, 91);cursor:pointer\\" class=\\"sc-AxjAm fkFbrw\\"><span>test</span></button></div><div class=\\"sc-AxiKw kvctUQ\\"><svg width=\\"500\\" height=\\"500\\" viewBox=\\"-250 -250 500 500\\"><path d=\\"M1.5308084989341916e-14,-250A250,250,0,1,1,-1.5308084989341916e-14,250A250,250,0,1,1,1.5308084989341916e-14,-250Z\\" class=\\"sc-AxirZ gEHNzQ\\"></path></svg><div><h3 style=\\"color:white\\"><strong>test</strong>: 5</h3></div></div>"`
    );
  });
});
