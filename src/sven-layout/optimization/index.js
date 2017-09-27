import {PriorityQueue} from 'pq2';

const d3 = require('d3');

export function getSwapLattice1d (n) {
  const moves = d3.range(n - 1);
  const lattice = moves.map(i => [i - 1, i + 1]);

  lattice[0] = [1];
  lattice[n - 2] = [n - 3];

  const createApplyMove = (state, callback) =>
    key => {
      const u = state[key];
      const v = state[key + 1];
      state[key    ] = v;
      state[key + 1] = u;

      callback && callback(key, u, v);

      return lattice[key];
    }

  return {moves, createApplyMove};
}

export function minimizeEnergy (initialMoves, applyMove, getEnergy) {
  const moves = new PriorityQueue();
  let delta = 0;
  let steps = 0;
  let bestMove = {};
  
  initialMoves.forEach(d =>
    moves.enq({key: d, priority: getEnergy(d)})
  );

  while (moves.size() && (bestMove = moves.peek()).priority < 0) {
    // update the change in energy
    delta += bestMove.priority;
    steps += 1;

    // apply the move, recalculate dependent moves
    applyMove(bestMove.key).forEach(d =>
      moves.change_key(d, getEnergy(d))
    );

    // update the utility of the move performed
    moves.change_key(bestMove.key, getEnergy(bestMove.key));
  }

  return {delta, steps};
}
