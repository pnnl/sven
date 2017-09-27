import properties from '../util/properties.js';
import incrementer from './incrementer.js';

const d3 = require('d3');
const jsnx = require('jsnetworkx');

export default function () {
  function self(data) {
    const id = self.id();
    const group = self.group();
    const time = self.time();

    // build a graph of group transitions
    const G = new jsnx.Graph();
    const inc = incrementer(G);

    d3.nest()
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
