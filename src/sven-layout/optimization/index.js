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
