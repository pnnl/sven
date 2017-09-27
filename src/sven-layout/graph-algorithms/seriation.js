import {getSwapLattice1d, minimizeEnergy} from '../optimization';

const d3 = require('d3');

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
      var mass = d3.sum(nei, edgeWeight.bind(G, v));
      G.node.get(v).y = 1.0 / mass * d3.sum(nei, scaledEdgeWeight.bind(G, v));
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

    const uAbove = d3.sum(nu, above);
    const uBelow = d3.sum(nu, below);
    const vAbove = d3.sum(nv, above);
    const vBelow = d3.sum(nv, below);

    return uBelow*vAbove - uAbove*vBelow ||
           uBelow + vAbove - uAbove - vBelow;
  };

  const {delta, steps} = minimizeEnergy(moves, applyMove, getEnergy);

  state.forEach((v,i) => G.node.get(v).y = i);
}
