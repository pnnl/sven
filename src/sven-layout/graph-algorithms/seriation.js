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

import {getSwapLattice1d, minimizeEnergy} from '../optimization';

import {sum} from 'd3-array'

function byY(u, v) {
  return this.node.get(u).y - this.node.get(v).y;
}

function yBecomesIndex(v, i) {
  this.node.get(v).y = i;
}

function edgeWeight(v, u) {
  return this.getEdgeData(u, v).weight;
}

function scaledEdgeWeight(v, u) {
  return this.node.get(u).y * this.getEdgeData(u, v).weight;
}

export function seriateBySorting(G, nIters) {
  nIters = nIters || 5;

  for (var i = 0; i < nIters; i++) {
    // sort nodes by y-coordinate, then
    // re-assign y-coordinate
    G.nodes()
      .sort(byY.bind(G))
      .forEach(yBecomesIndex.bind(G));

    if (i === nIters - 1) {
      return;
    }

    for (var v of G) {
      var nei = G.neighbors(v);
      var mass = sum(nei, edgeWeight.bind(G, v));
      G.node.get(v).y = 1.0 / mass * sum(nei, scaledEdgeWeight.bind(G, v));
    }
  }
}

export function countCrossings(G) {
  const E = G.edges();
  var nCrossings = 0;

  for (var i = 0; i < E.length; i++) {
    const e0 = E[i];
    const y00 = G.node.get(e0[0]).y;
    const y01 = G.node.get(e0[1]).y;

    for (var j = i + 1; j < E.length; j++) {
      const e1 = E[j];
      const y10 = G.node.get(e1[0]).y;
      const y11 = G.node.get(e1[1]).y;

      nCrossings += (y00 >= y10 && y01 >= y11) ||
                    (y00 <= y10 && y01 >= y11);
    }
  }
  return nCrossings;
}

export function seriateByEnergyMinimization (G) {

  // initial state: nodes sorted by their existing y value
  const state = G.nodes(true)
    .sort(([u,du],[v,dv]) => du.y - dv.y)
    .map(([u,du]) => u);

  // update the y-value of the nodes in the graph
  state.forEach((v,i) => G.node.get(v).y = i);

  const {moves, createApplyMove} = getSwapLattice1d(state.length);

  const applyMove = createApplyMove(state, (k, u, v) => {
    G.node.get(u).y = k + 1;
    G.node.get(v).y = k;
  });

  const neighborData = v =>
    G.neighbors(v).map(v => G.node.get(v));

  const getEnergy = key => {
    const u = state[key];
    const v = state[key + 1];

    const yu = G.node.get(u).y;
    const yv = G.node.get(v).y;

    const above = d =>
      d.y > yv ? (d.weight || 1) : 0;

    const below = d =>
      d.y < yu ? (d.weight || 1) : 0;

    const nu = neighborData(u);
    const nv = neighborData(v);

    const uAbove = sum(nu, above);
    const uBelow = sum(nu, below);
    const vAbove = sum(nv, above);
    const vBelow = sum(nv, below);

    return uBelow*vAbove - uAbove*vBelow ||
           uBelow + vAbove - uAbove - vBelow;
  };

  const {delta, steps} = minimizeEnergy(moves, applyMove, getEnergy);

  state.forEach((v,i) => G.node.get(v).y = i);
}
