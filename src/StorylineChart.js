import React from 'react';
import {Set} from 'immutable';

import ChartComponent from './ReactD3Chart';

import './Storyline.css';

import {scaleLinear} from 'd3-scale';
import {min, max, merge} from 'd3-array';
import {line, curveMonotoneX} from 'd3-shape';

const storylinesInit = ({data={}, width, height, groupLabel}) => {
  let {interactions=[], events=[]} = data;

  if (interactions.length === 0) {
    return {layers: []};
  } else {
    const xAxisData = Set(events.map(d => +d.x))
      .sort()
      .toArray();

    const padding = width/xAxisData.length/3;

    const x = scaleLinear()
      .domain([xAxisData[0] || 0, xAxisData[xAxisData.length - 1] || 1])
      .range([padding, width - padding]);

    const ymax = max(interactions, d => d.y1);
    const ymin = min(interactions, d => d.y0);

    const actualHeight = Math.min(height, (ymax - ymin)*20);

    const y = scaleLinear()
      .domain([ymin, ymax])
      .range([actualHeight - height, -height]);

    const yAxisData = interactions.map(({values, y0, y1}) => ({
      group: groupLabel && groupLabel(values[0].values[0].data),
      values: merge(values.map(d => d.values.map(d => d.data))),
      y: (y0 + y1)/2,
      y0, y1
    }));

    return {x, y, xAxisData, yAxisData, padding};
  }
};

const storylineLayers = [
  {
    name: 'groups',
    callback: (selection, {yAxisData, width, y, onClick=Object}) => {
      const groups = selection.selectAll('rect')
          .data(yAxisData, d => d.group);

      groups.enter()
        .append('rect')
        .on('click', d => onClick(d.values))
        .merge(groups)
          .attr('x', 0)
          .attr('width', width)
          .attr('y', d => y(d.y1))
          .attr('height', d => Math.abs(y(d.y1) - y(d.y0)));

      groups.exit()
        .remove();

      const labels = selection.selectAll('text')
        .data(yAxisData, d => d.group);

      labels.enter()
        .append('text')
        .merge(labels)
          .attr('x', 0)
          .attr('y', d => y(d.y1))
          .text(d => d.group);

      labels.exit()
        .remove();
    }
  },
  {
    name: 'storylines',
    callback: (selection, {data, x, y, color, padding, highlights, onClick=Object, lineLabel}) => {

      const storyline = line()
        .curve(curveMonotoneX);

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
          .on('click', d => onClick(d.values.map(d => d.data)));

      paths_enter.append('path');
      paths_enter.append('text');

      const paths_merge = paths_enter.merge(paths)
        .classed('highlighted', d => highlights && highlights.has(d.key));

      paths_merge.select('path')
        .style('stroke', d => color && color(d))
        .attr('d', d => storyline(getPoints(d)));

      paths_merge.select('text')
        .style('fill', d => color && color(d))
        .text(d => lineLabel ? lineLabel(d) : d.key)
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
    margin={{top: 30, right: 125, bottom: 0, left: 20}}
    className='storylines-chart'
  />;

export default StorylineChart;
