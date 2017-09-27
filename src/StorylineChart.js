import React from 'react';
import {Set} from 'immutable';

import ChartComponent from './ReactD3Chart';

import './Storyline.css';

const d3 = require('d3');

const storylinesInit = ({data={}, width, height}) => {
  let {interactions=[], events=[]} = data;

  if (interactions.length === 0) {
    return {layers: []};
  } else {
    const xAxisData = Set(events.map(d => +d.x))
      .sort()
      .toArray();

    const padding = width/xAxisData.length/3;

    const x = d3.scaleLinear()
      .domain([xAxisData[0] || 0, xAxisData[xAxisData.length - 1] || 1])
      .range([padding, width - padding]);

    const ymax = d3.max(interactions, d => d.y1);
    const ymin = d3.min(interactions, d => d.y0);

    const actualHeight = Math.min(height, (ymax - ymin)*20);

    const y = d3.scaleLinear()
      .domain([ymin, ymax])
      .range([actualHeight - height, -height]);

    const yAxisData = interactions.map(({values, y0, y1}) => ({
      group: values[0].values[0].data.group,
      y: (y0 + y1)/2,
      y0, y1
    }));

    return {x, y, xAxisData, yAxisData, padding};
  }
};

const storylineLayers = [
  {
    name: 'groups',
    callback: (selection, {yAxisData, width, y, onGroupClick=Object}) => {
      const groups = selection.selectAll('rect')
          .data(yAxisData, d => d.key);

      groups.enter()
        .append('rect')
        .on('click', d => onGroupClick(d))
        .merge(groups)
          .attr('x', 0)
          .attr('width', width)
          .attr('y', d => y(d.y1))
          .attr('height', d => Math.abs(y(d.y1) - y(d.y0)));

      groups.exit()
        .remove();
    }
  },
  {
    name: 'storylines',
    callback: (selection, {data, x, y, padding, highlights, onClick=Object}) => {

      const line = d3.line()
        .curve(d3.curveMonotoneX);

      function getPoints (d) {
        const points = [];

        d.values.forEach(d => {
          points.push([
            x(d.x) - padding,
            y(d.y)
          ]);

          points.push([
            x(d.x) + padding,
            y(d.y)
          ]);
        });

        return points;
      }

      const paths = selection.selectAll('g')
        .data(data.storylines, d => d.key);

      const paths_enter = paths.enter()
        .append('g')
          .on('click', onClick);

      paths_enter.append('path');
      paths_enter.append('text');

      const paths_merge = paths_enter.merge(paths)
        .classed('highlighted', d => highlights && highlights.has(d.key));

      paths_merge.select('path')
        .attr('d', d => line(getPoints(d)));

      paths_merge.select('text')
        .text(d => d.key)
        .attr('x', d => x(d.values[d.values.length - 1].x) + padding)
        .attr('y', d => y(d.values[d.values.length - 1].y));

      paths.exit()
        .remove();
    }
  }      
];

const StorylineChart = props =>
  <ChartComponent
    init={storylinesInit}
    layers={storylineLayers}
    {...props}
    margin={{top: 30, right: 200, bottom: 0, left: 20}}
    className='storylines-chart'
  />;

export default StorylineChart;
