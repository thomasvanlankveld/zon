import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import SlocView from './SlocView';
import { createTreeFromFiles } from '../utility/file-tree';

Enzyme.configure({ adapter: new Adapter() });

describe('SlocView', () => {
  it('renders breadcrumbs, a diagram and a list', () => {
    expect.hasAssertions();

    const project = createTreeFromFiles([{ path: 'test', data: { numberOfLines: 5 } }]);
    const wrapper = shallow(<SlocView data={project} />);

    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<div style=\\"margin-bottom:20px\\"><button style=\\"color:rgb(175, 240, 91);cursor:pointer\\" class=\\"sc-AxjAm fkFbrw\\"><span></span></button></div><div class=\\"sc-AxiKw kvctUQ\\"><svg width=\\"500\\" height=\\"500\\" viewBox=\\"-250 -250 500 500\\"><path d=\\"M7.654042494670958e-15,-125A125,125,0,1,1,-7.654042494670958e-15,125A125,125,0,1,1,7.654042494670958e-15,-125Z\\" class=\\"sc-AxirZ gEHNzQ\\"></path><path d=\\"M1.5308084989341916e-14,-250A250,250,0,1,1,-1.5308084989341916e-14,250A250,250,0,1,1,1.5308084989341916e-14,-250M-2.2962127484012872e-14,-125A125,125,0,1,0,2.2962127484012872e-14,125A125,125,0,1,0,-2.2962127484012872e-14,-125Z\\" class=\\"sc-AxirZ gEHNzQ\\"></path></svg><div><h3 style=\\"color:white\\"><strong></strong>: 5</h3><p><button style=\\"color:rgb(175, 240, 91);cursor:pointer\\" class=\\"sc-AxjAm fkFbrw\\"><strong>test</strong>: 5 lines</button></p></div></div>"`
    );
  });
});
