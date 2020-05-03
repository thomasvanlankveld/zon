import React, { SFC, useRef, useEffect } from 'react';
import { select } from 'd3';

interface SlocViewProps {
  data: number[];
}

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;

  const svgNode = useRef(null);

  useEffect(() => {
    // Bail if the node is null
    if (!svgNode.current) return;

    // Select the svg
    const svg = select(svgNode.current);

    // Style the text
    svg
      .selectAll('div')
      .style('font', '10px sans-serif')
      .style('text-align', 'right')
      .style('color', 'white');

    // Style the bars, add bars and text
    svg
      .selectAll('div')
      .data(data)
      .join('div')
      .style('background', 'steelblue')
      .style('padding', '3px')
      .style('margin', '1px')
      .style('width', (d) => `${d * 10}px`)
      .text((d) => d);
  }, [svgNode.current, data]);

  return <div ref={svgNode} />;
  // return <div ref={svgNode} width={500} height={500} />;
};

export default SlocView;
