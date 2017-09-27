export default function (G, weight, w0, w1) {
  weight = weight || 'weight';
  var wobj = {};
  wobj[weight] = w0 || 0;
  w1 = w1 || 1;

  return function (u, v, w) {
    var obj = {};
    obj[weight] = (G.getEdgeData(u, v) || wobj)[weight] + (w || w1);
    G.addEdge(u, v, obj);
  };
}
