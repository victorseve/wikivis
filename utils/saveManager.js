const { dialog } = require('electron').remote
const fs = require('fs');

var saveManager = (function() {

  function saveGraph(graph) {
    var fileExists = (filename) => fs.readdir('saves', (err, files) => files.includes(filename));
    graph.network.storePositions();
    let nodes = Object.values(graph.nodes._data)
    let edges = Object.values(graph.edges._data)
    let data = JSON.stringify({nodes: nodes, edges: edges})
    confirmed = false;
    while (confirmed !== true) {
      var filename = dialog.showSaveDialog({title: 'Save', message: 'Enter filename'})
      if (fileExists(filename)) {
        confirmed = prompt('This filename already exists. Continue?') 
      } else { confirmed = true}
    }
    fs.writeFile(filename, data, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("File saved");
    }); 
  }
  
  function loadGraph(graphTarget) {
    dialog.showOpenDialog(filename => loadNetwork(filename[0]))
    function loadNetwork(filepath) {
      fs.readFile(filepath, 'utf-8', (err, data) => {
        if (err) { return console.log("An error ocurred reading the file :" + err.message); }
        graphTarget.updateDataset(JSON.parse(data))
      })
    }
  }

  return {
    save: saveGraph,
    load: loadGraph
  }
})()

module.exports = saveManager

