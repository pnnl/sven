export default function (chart) {
  var properties = {};
  return function (name, defaultValue) {
    properties[name] = arguments.length === 1 ?
      d => d[name] :
      defaultValue;

    chart[name] = function (value) {
      if (arguments.length === 0) {
        return properties[name];
      }

      properties[name] = value;
      return chart;
    };
  };
}
