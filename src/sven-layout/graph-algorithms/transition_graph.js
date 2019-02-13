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

import properties from '../util/properties.js';
import incrementer from './incrementer.js';


import {nest} from 'd3-collection'

const jsnx = require('jsnetworkx');

export default function () {
  function self(data) {
    const id = self.id();
    const group = self.group();
    const time = self.time();

    // build a graph of group transitions
    const G = new jsnx.Graph();
    const inc = incrementer(G);

    nest()
      .key(id)
      .rollup(function (leaves) {
        leaves
          .sort((a, b) => time(b) - time(a))
          .forEach((d, i, a) => {
            delete d.next;
            delete d.prev;
            delete d.first;

            if (d.prev && group(d.prev) === group(d)) {
              d.first = d.prev.first;
            } else {
              d.first = d;
            }

            if (i < a.length - 1) {
              d.next = a[i + 1];
            }

            if (i > 0) {
              inc(group(d), group(a[i - 1]));
              d.prev = a[i - 1];
            }
          });
      })
      .entries(data);

    return G;
  }

  // add property accessers
  const addProperty = properties(self);
  addProperty('id');
  addProperty('group');
  addProperty('time');

  return self;
}
