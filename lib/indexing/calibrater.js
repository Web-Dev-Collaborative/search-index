exports.calibrate = function(reverseIndex, docFreqIndex, callback) {
  documentFrequencies(reverseIndex, docFreqIndex, function(msg) {
    countDocuments(reverseIndex, docFreqIndex, function(msg) {
      callback(msg);
    });
  });
};

exports.getTotalDocs = function(docFreqIndex, callback) {
  docFreqIndex.get('forage.totalDocs', function(err, value){
    if (err) {
      console.log('Index is empty or not calibrated, see https://github.com/fergiemcdowall/forage#indexing-api');
      callback(0);
    }
    else {
//      console.log(value + ' documents searchable');
      callback(value);
    }
  });
}

countDocuments = function(reverseIndex, docFreqIndex, callback) {
  var tally = 0;
  reverseIndex.createReadStream({
    start: 'DOCUMENT~',
    end: 'DOCUMENT~~'})
    .on('data', function(data) {
      tally++;
    })
    .on('end', function() {
      docFreqIndex.put('forage.totalDocs', tally, function(){
//        console.log('totalDocs: ' + tally);
        callback('calibrated ' + tally + ' docs');
      });
    });  
};


documentFrequencies = function(reverseIndex, docFreqIndex, callback) {
  var lastToken = '~';
  var tally = 1;
  var progressCounter = 0;
  reverseIndex.createReadStream({
    start: 'REVERSEINDEX~',
    end: 'REVERSEINDEX~~'})
    .on('data', function(data) {
      var splitKey = data.key.split('~');
//      if (splitKey[4] == 'forage.composite') {
//        var token = splitKey[1];
        var token = splitKey.slice(1,5).join('~');
//        console.log(token);
        if (token != lastToken) {
          console.log(lastToken + ' : ' + tally);
          progressCounter++;
          if (progressCounter % 1000 == 0)
            console.log('calibrated ' + progressCounter + ' tokens');
          docFreqIndex.put(lastToken, tally);
          lastToken = token;
          tally = 1;
        }
        else {
          tally++;
        }
//      }
    })
    .on('close', function() {
      callback('done');
    });  
}
