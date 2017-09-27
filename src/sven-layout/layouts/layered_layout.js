import properties from '../util/properties.js';
import incrementer from '../graph-algorithms/incrementer.js';
import {seriateByEnergyMinimization as seriate} from '../graph-algorithms/seriation.js';
import fas from '../graph-algorithms/feedback_arc_set.js';

const d3 = require('d3');
const jsnx = require('jsnetworkx');

export default function () {
  function self(data, previousTrees) {
    const trees = self.constructTrees(data);
    const G = self.getGroupTransitionGraph(trees);

    self.initialGroupOrder(trees, G, previousTrees);
    self.finalGroupOrder(trees, G);

    self.initialEntityOrder(trees, G);
    self.finalEntityOrder(trees);

    self.findInteractionOffsets(trees);

    return trees;
  }

  const addProperty = properties(self);
  addProperty('id');
  addProperty('group');
  addProperty('time');

  self.constructTrees = function (data) {
    const id = self.id();
    const group = self.group();
    const time = self.time();

    // wrap the data
    // lets us add fields to it without mutating the underlying data
    data = data.map(d => ({data: d}));

    // store the x-coordinate in the data
    data.forEach(d => {
      d.x = time(d.data);
    });

    const interactions = d3.nest()
      .key(d => group(d.data))
      .key(d => time(d.data))
      .entries(data);

    // use nest to create a id x time data structure
    // this models the storylines
    const storylines = d3.nest()
      .key(d => id(d.data))
      .entries(data);

    // internally, sort the storylines by time, and add prev, next, first pointers
    storylines.forEach(entity => {
      entity.values
        .sort((a, b) => time(a.data) - time(b.data))
        .forEach((event, i, a) => {
          if (i > 0) {
            event.prev = a[i - 1];
            event.first = group(event.prev.data) === group(event.data) ?
              event.prev.first :
              event;
          } else {
            event.prev = event.first = event;
          }

          event.next = i < a.length - 1 ?
            a[i + 1] :
            event;
        });
    });

    // sort the groups by date
    interactions.forEach(g =>
      g.values.sort((a,b) => a.values[0].x - b.values[0].x)
    );

    const events = data.concat([])
      .sort((a, b) => a.x - b.x);

    return {interactions, storylines, events};
  };

  self.getEventSerializer = function () {
    const id = self.id();
    const time = self.time();

    return d => String([id(d), time(d)]);
  };

  self.getGroupTransitionGraph = function (trees) {
    const group = self.group();
    const G = new jsnx.Graph();
    const inc = incrementer(G);

    // add a node for each group
    trees.interactions.forEach(interaction => {
      G.addNode(group(interaction.values[0].values[0].data));
    });

    // add an edge for each
    trees.events.forEach(event => {
      const u = group(event.prev.data);
      const v = group(event.data);

      if (u !== v) {
        inc(u, v);
      }
    });

    return G;
  };

  // pos maps {id, time} -> y coordinate
  self.initialGroupOrder = function (trees, G, previousTrees) {
    const group = self.group();
    const key = self.getEventSerializer();

    const pos = new Map();
    if (previousTrees) {
      previousTrees.events.forEach(d => {
        pos.set(key(d.data), d.y);
      });
    }

    trees.interactions.forEach(g => {
      const heights = d3.merge(g.values.map(d => d.values))
        .map(d => pos.get(key(d.data)));

      G.addNode(group(g.values[0].values[0].data), {
        y: d3.mean(heights.filter(d => d !== undefined)) || -1
      });
    });
  };

  self.finalGroupOrder = function (trees, G) {
    const group = self.group();

    seriate(G);

    // sort the groups by the order found during seriation
    trees.interactions
      .forEach(g => {
        g.y = G.node.get(group(g.values[0].values[0].data)).y;
      });

    trees.interactions
      .sort((a, b) => {
        return a.y - b.y;
      });
  };

  self.initialEntityOrder = function (trees, G) {
    const group = self.group();

    trees.events.forEach(event => {
      event.y = G.node.get(group(event.data)).y;
    });
  };

  // TODO: memoization of this will help a lot
  self.getBias = function (u, v, direction) {
    while ((u[direction] !== u || v[direction] !== v) &&
            u.y === v.y) {
      u = u[direction];
      v = v[direction];
    }

    return Math.sign(v.y - u.y);
  }

  self.finalEntityOrder = function (trees) {
    const G = new jsnx.DiGraph();
    const inc = incrementer(G);
    const key = self.getEventSerializer();

    // for each pair of storyline in each {group x time}
    trees.interactions.forEach(group => {
      group.values.forEach(time => {
        time.values.forEach((u, i, ary) => {
          G.addNode(key(u.first.data), {event: u.first});

          for (var j = i + 1; j < ary.length; j++) {
            const v = ary[j];
            const bias = self.getBias(u, v, 'prev') + self.getBias(u, v, 'next');

            if (bias !== 0) {
              if (u.first.y > v.first.y) {
                inc(key(u.first.data), key(v.first.data), bias);
              } else {
                inc(key(v.first.data), key(u.first.data), -bias);
              }
            }
          }
        });
      });
    });

    // reverse the direction edges with negative weight
    G.edges(true).forEach(e => {
      const u = e[0];
      const v = e[1];
      const d = e[2];
      const w = d.weight;

      if (w <= 0) {
        G.removeEdge(u, v);
      }
      if (w < 0) {
        G.addEdge(v, u, {weight: -w});
      }
    });

    // set the y coordinate of the first node based on the FAS ordering
    fas(G.copy()).forEach(function (d, i) {
      G.node.get(d).event.yfas = i;
    });

    // loop over each interactin and find the y-coordinate by sorting
    trees.interactions.forEach(group => {
      group.values.forEach(interaction => {
        interaction.values
          .sort((a, b) => a.first.yfas - b.first.yfas)
          .forEach((event, j) => {
            event.y = j;
          });
      });
    });
  };

  self.findInteractionOffsets = function (trees) {
    // convert ranking to offsets within each interaction session
    const group = self.group();

    // loop over each group
    trees.interactions.forEach((g, j) => {
      // loop over each interaction
      g.values.forEach((interaction, i) => {
        interaction.y = 0; // by default there is no y-offset

        if (i > 0) {
          // loop over each event again to find the optimal offset
          // between the current interaction and the previous one
          const offsets = {};
          interaction.values.forEach(event => {
            if (event.prev !== event && group(event.data) === group(event.prev.data)) {
              const dy = event.y - event.prev.y;
              offsets[dy] = (offsets[dy] || 0) + 1;
            }
          });

          const ary = d3.entries(offsets);
          ary.forEach(d => {
            d.key = Number(d.key);
          });

          if (ary.length > 0) {
            const best = d3.scan(ary, (b, a) => {
              const av = a.value;
              const bv = b.value;
              if (av < bv) {
                return -1
              } else if (av > bv) {
                return 1;
              }
              return 0;
            });

            interaction.y = g.values[i - 1].y + ary[best].key;
          }
        }
      });

      // find the smallest y value of the interaction (guaranteed <= 0)
      const padding = 5;
      const origin = g.y0 = g.y1 = j > 0 ? 
        trees.interactions[j - 1].y1 + padding - d3.min(g.values, d => -d.y) : 
        0;

      // finally, find the actual y-coordinates of the storylines
      g.values.forEach(interaction => {
        interaction.values.forEach(event => {
          event.y += origin - interaction.y;
        });
        g.y0 = Math.min(g.y0, interaction.values[0].y - 1)
        g.y1 = Math.max(g.y1, interaction.values[interaction.values.length - 1].y + 1);
      });
    });
  };

  return self;
}
