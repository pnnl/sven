/* 

  BSD License:

  SVEN: Storyline Visualization Library and Demonstration

  Copyright © 2017, Battelle Memorial Institute
  All rights reserved.

  1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission
     to any person or entity lawfully obtaining a copy of this software and
     associated documentation files (hereinafter “the Software”) to redistribute
     and use the Software in source and binary forms, with or without 
     modification.  Such person or entity may use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and may permit
     others to do so, subject to the following conditions:

     * Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimers.
     * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
     * Other than as used herein, neither the name Battelle Memorial Institute
       or Battelle may be used in any form whatsoever without the express
       written consent of Battelle. 

  2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
     THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
     PURPOSEARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
     FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
     CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
     LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
     OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
     DAMAGE.
     
*/

import React from 'react';
import {Set} from 'immutable';

import ChartComponent from './ReactD3Chart';

import './Storyline.css';

import {scaleLinear} from 'd3-scale';
import {min, max, merge} from 'd3-array';
import {line, curveMonotoneX} from 'd3-shape';
import {axisBottom} from 'd3-axis';

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
    callback: (selection, {data, x, y, color, padding, highlights, onClick=Object, lineLabel, lineTitle}) => {

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
      paths_enter.append('title')

      const paths_merge = paths_enter.merge(paths)
        .classed('highlighted', d => highlights && highlights.has(d.key));

      paths_merge.select('title')
        .text(lineTitle);

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
  },
  {
    name: 'x-axis',
    callback: (selection, {data, x}) => {
      selection.call(axisBottom(x));
    }
  }      
];

const StorylineChart = props =>
  <ChartComponent
    init={storylinesInit}
    layers={storylineLayers}
    {...props}
    margin={{top: 30, right: 135, bottom: 25, left: 20}}
    className='storylines-chart'
  />;

export default StorylineChart;
