export default function (G, weight) {
  var sourcesAdded = [];
  var sinksAdded = [];

  while (G.numberOfNodes()) {
    var sources = [];
    var sinks = [];
    var vMax = null;
    var dMax = -Infinity;

    for (var v of G) {
      var dIn = G.inDegree(v, weight);
      var dOut = G.outDegree(v, weight);
      var delta = dOut - dIn;

      if (dIn === 0) {
        sources.push(v);
      } else if (dOut === 0) {
        sinks.push(v);
      } else if (delta > dMax || (delta === dMax && v < vMax)) {
        dMax = delta;
        vMax = v;
      }
    }

    if (sources.length + sinks.length === 0) {
      sources.push(vMax);
    }

    G.removeNodesFrom(sources);
    sourcesAdded = sourcesAdded.concat(sources.sort());

    G.removeNodesFrom(sinks);
    sinksAdded = sinksAdded.concat(sinks.sort().reverse());
  }

  sourcesAdded.push.apply(sourcesAdded, sinksAdded.reverse());
  return sourcesAdded;
}
