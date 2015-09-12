var fs = require('fs');
var _  = require('lodash');

var parseFile = function(filename, fields, callback){
  fs.readFile(require.resolve(filename), 'utf8', function(err, area){
    if(err) return callback(err);
    var lines = area.split('\n').filter(function(line){
      return !!line.trim() && !/^#/.test(line);
    }).map(function(line){
      var data = {};
      line.split(/\s+/).forEach(function(field, i){
        return data[ fields[i] ] = field;
      });
      return data;
    });
    callback(null, lines);
  });
};

module.exports = function(callback){
  parseFile('./data/link.txt', 'id from to level'.split(' '), function(err, linked){
    err && callback(err);
    parseFile('./data/area.txt', 'id name level fullname'.split(' '), function(err, area){
      err && callback(err);
      var groupedLinked = _.groupBy(linked, 'level');
      Object.keys(groupedLinked).sort().reverse().forEach(function(groupKey){
        var key  = { '2': 'cities', '3': 'districts' }[ groupKey ];
        groupedLinked[ groupKey ].forEach(function(item){
          var from  = _.find(area, { id: item.from });
          var to    = _.find(area, { id: item.to });
          // if(to.level != 1){ // to must be a top-level.
            from[ key ] = from[ key ] || [];
            from[ key ].push(_.cloneDeep(to));
          // }
        });
      });

      var provinces = area.filter(function(line){
        return line.level == 1;
      });

      callback(err, provinces);

    });
  });
};
