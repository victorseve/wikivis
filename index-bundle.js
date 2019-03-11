let visDS = null; 
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    var wiki = require('./utils/wiki')
    const suggestions = require('./utils/suggestions')

    console.log('index loaded')

    suggestions({ search: document.getElementById('search'), list: document.getElementById('autocomplete-list'), async: wiki.suggestions });

    // (function() {
    //   var configComponent = document.querySelector('link[rel="import"]').import;
    //   var el = configComponent.querySelector('#node-configure')
    //   document.body.appendChild(el.cloneNode(true));
    // })()

  const options = {
    physics: { enabled: false },
    edges: {smooth: {enabled: true, type: 'continuous'}, color: {color: '#2b7ce9', highlight: '#2b7ce9', hover: '#2b7ce9'}, selectionWidth: function(width) { return width*2; }},
    manipulation: {enabled: true, addNode: false},
    configure: {
      enabled: false,
      container: document.getElementById('configure-panel'),
      showButton: false
    },
    interaction: {multiselect: true}
  }

    var container = document.getElementById('network');

    var NodesDataset = function() {

      let nodes = new vis.DataSet();
      let edges = new vis.DataSet();
      let network = new vis.Network(container, {nodes: nodes, edges: edges}, options);
      let curr_id = 0;

      function dataToNode(props) {
        var image = (summary) => summary.thumbnail !== undefined ? summary.thumbnail.source : ''
        var shape = (summary) => summary.thumbnail !== undefined ? 'image' : 'dot'
        return {
          id: curr_id++,
          label: props.summary.title,
          image: image(props.summary),
          shape: shape(props.summary),
          data: {summary: props.summary},
          font: {size: 14, color: '#000000', background: '#ffffff'},
          borderWidth: 1,
          size: 30,
          color: '#2b7ce9'
        }
      }
      this.updateDataset = function(dataset) {
        nodes.add(dataset.nodes);
        edges.add(dataset.edges);
        curr_id = Math.max(...dataset.nodes.map(x => x.id)) + 1
      }

      let selectionParameters = null

      network.on('click', networkClickCallback)
      network.on('dragStart', networkClickCallback)
      network.on('oncontext', networkContextCallback)

      function networkClickCallback(params) {
        selectionParameters = params
        if (params.nodes.length) {
          showExtract(document.getElementById('response'), nodes.get(params.nodes[0]))
        }
      }
      function showExtract(target, node) {
        let extract = node.data.summary.extract_html;
        extract += `<p><a href="${node.data.summary.content_urls.desktop.page}" target="_blank" >Article Wikipedia</a></p>`
        target.innerHTML = extract
      }

      var hasNodesSelected = (params) => params.nodes!==undefined && params.nodes.length > 0;
      var hasEdgesSelected = (params) => params.edges!==undefined && params.edges.length > 0;
      var hasItemsSelected = (params) => hasNodesSelected(params) || hasEdgesSelected(params); 

      function networkContextCallback(params) {
        if ( network.getNodeAt(params.pointer.DOM) === undefined ) {
          if ( !hasItemsSelected(selectionParameters) ) { return } 
        } else {
          params.nodes = [network.getNodeAt(params.pointer.DOM)], 
          network.selectNodes(params.nodes)
          params.edges = network.getConnectedEdges(network.getNodeAt(params.pointer.DOM))
          selectionParameters = params
        }
        showStyleForm(params) 
        matchNodeStyle(nodes.get(params.nodes[0]), edges.get(params.edges))
        network.storePositions();
      }

      function showStyleForm(params) {
        let div = document.getElementById('node-configure')
        if (!params.nodes.length) {
          document.getElementById('node-configure-form-nodes').style.display='none';
        } else {
          document.getElementById('node-configure-form-nodes').style.display='block';
        }
        div.style.display = 'block'
        div.style.top = Math.min(window.innerHeight-div.offsetHeight-25, params.pointer.DOM.y) + 'px'
        div.style.left = Math.min(window.innerWidth-div.offsetWidth-25, params.pointer.DOM.x) + 'px'
      }

      function matchNodeStyle(node, edges) {
        var setInputValue = (name, value) => document.querySelector(`input[name=${name}]`).value = value;
        document.querySelector(`input[name=node-border-toggle]`).checked = node.shapeProperties && node.shapeProperties.useBorderWithImage
        setInputValue('node-size', node.size) 
        setInputValue('node-border-width', node.borderWidth) 
        setInputValue('node-border-color', node.color) 
        setInputValue('node-font-size', node.font.size) 
        setInputValue('node-font-color', node.font.color) 
        setInputValue('node-font-back', node.font.background) 
        setInputValue('edge-color', edges[0].color.color) 
        setInputValue('edge-width', edges[0].width) 
      }

      document.getElementById('node-configure-form').addEventListener('change', applyStyle)
      document.getElementById('apply-custom-style').addEventListener('click', closeStyleForm)

      function applyStyle() {
        updateStyle(nodes.get(selectionParameters.nodes), edges.get(selectionParameters.edges))
      }
      function closeStyleForm() {
        document.getElementById('node-configure').style.display = 'none'
      }

      function updateStyle(affected_nodes, affected_edges) {        
        nodes.update(affected_nodes.map(node => updateNodeStyle(node)))
        edges.update(affected_edges.map(edge => updateEdgeStyle(edge)))
      }
      function updateNodeStyle(node) {
        var inputValue = (name) => document.querySelector(`input[name=${name}]`).value;
        node.shapeProperties = { useBorderWithImage: document.querySelector(`input[name=node-border-toggle]`).checked }
        node.size = parseInt(inputValue('node-size'))
        node.borderWidth = parseInt(inputValue('node-border-width'))
        node.borderWidthSelected = 2*node.borderWidth
        node.color = inputValue('node-border-color')
        node.font.size = parseInt(inputValue('node-font-size'))
        node.font.color = inputValue('node-font-color')
        node.font.background = inputValue('node-font-back')
        return node
      }
      function updateEdgeStyle(edge) {
        var inputValue = (name) => document.querySelector(`input[name=${name}]`).value;
        edge.color = {color: inputValue('edge-color'), highlight: inputValue('edge-color'), hover: inputValue('edge-color')}
        edge.width = parseInt(inputValue('edge-width'))
        return edge
      }

      addNode = function(props) {
        let node_id = nodeIndexFromTitle(props.summary) || curr_id
        if (nodeIndexFromTitle(props.summary) === undefined) {
          nodes.add(dataToNode(props))
        }
        let children_ids = [];
        props.categories.map(summary => addChildren(node_id, summary, children_ids))

        disperseNodes(node_id, children_ids)
        network.selectNodes(children_ids.concat(node_id))
      }

      function nodeIndexFromTitle(summary) {
        return nodes.getIds({filter: node => node.label == summary.title})[0]
      }
      function addEdge(startId, nodeId=curr_id-1) {
        edges.add({from: startId, to: nodeId, color: {color: '#2b7ce9', highlight: '#2b7ce9', hover: '#2b7ce9'}, width: 1})
      }
      function addChildren(node_id, summary, children_ids) {
        if (nodeIndexFromTitle(summary) === undefined) {
          children_ids.push(curr_id)
          nodes.add(dataToNode({summary: summary}));
          addEdge(node_id)
          //wiki.relations(summary.title).then(relations => connectNode(curr_id-1, relations.pages))
        } else {
          let id = nodes.get(nodeIndexFromTitle(summary)).id
          addEdge(node_id, id);
          children_ids.push(id)
        }
      }
      function connectNode(id, relations) {
        let titles = relations.map(x => x.title)
        let nodesToConnect = Object.values(nodes._data).filter(n => titles.indexOf(n.label) > -1)
        for (let node of nodesToConnect) {
          addEdge(id, node.id)
        }
      }
      function disperseNodes(parentId, childrenIds) {
        const radius = 200;
        let [xi, yi] = Object.values(network.getPositions(parentId)[parentId])
        var position = (center, curr, total) => [xi + radius*Math.cos(2*curr*Math.PI/total), yi + radius*Math.sin(2*curr*Math.PI/total)] 
        childrenIds.forEach((id, index) => network.moveNode(id, ...position(parentId, index, childrenIds.length)))
      }

      function keyEvent(e) {
        if (document.activeElement === document.getElementById('search')) return;
        switch(e.key) {
          case 'd':
            deleteSelectedNodes();
            break;
          case 'a':
            populateNode();
            break;
        }
      }
      function populateNode() {
        let node = nodes.get(network.getSelectedNodes()[0])
        let title = node.data.summary.titles.canonical;
        wiki.all(title).then(array => fillChilds(array)).then(array => displayPopup(array))
      }
      function deleteSelectedNodes() {
        for (let id of network.getSelectedNodes()) {
          deleteNode(id)
        }
      }
      function deleteNode(id) {
        nodes.remove(id)
        let edge_map = {};
        let edge_data = Object.values(edges._data), node_data = Object.values(nodes._data)
        for (let node of node_data) {
          edge_map[node.id] = [
            ...edge_data.filter(e => e.from==node.id).map(e => e.to),
            ...edge_data.filter(e => e.to==node.id).map(e => e.from)
          ]
        }
        var isDetached = (node) => edge_map[node.id].length==1 && edge_map[node.id][0] == id;
        let detached_nodes = nodes.getIds({filter: isDetached})
        nodes.remove(detached_nodes)
        let deprecated_edges = edges.getIds({filter: edge => edge.from == id})
        edges.remove(deprecated_edges)
      }
      document.body.addEventListener('keydown', keyEvent)

      document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault()
        getTitleInformation()
      })

      function getTitleInformation() {
        let title = document.querySelector('input[name=title]').value
        if (!title.length) return
        document.querySelector('input[name=title]').value = ''
        wiki.all(title)
        .then(array => fillChilds(array))
        .then(array => displayPopup(array))
        .catch(err => console.log(err))
      }

      async function fillChilds(array) {
        var relatedTitles = (data) => data.pages.map(page => page.title)
        var categoryTitles = (data) => data.categories.filter(category => !category.hidden).map(category => category.titles.canonical)
        let [summary, meta, relations] = array
        let d =  await Promise.all([
          wiki.images(relatedTitles(relations)),
          wiki.images(categoryTitles(meta))
        ])
        return [summary, ...d]
      }

      function filterSelectedNodes() {
        let popup = document.getElementById('popup');
        let data = popup.data;
        let selected_titles = [...document.querySelectorAll('input[type=checkbox]')].filter(x => x.checked).map(x => x.name);
        data[1] = data[1].filter(x => selected_titles.includes(x.title));
        updateNetwork(data);
        popup.style.display = 'none'
      }

      function updateNetwork(array) {
        let [summary, meta, relations] = array
        let props = {
          summary: summary,
          relations: relations, 
          categories: meta
        }
        addNode(props)
      }

      return {
        nodes: nodes,
        edges: edges,
        network: network,
        filterSelectedNodes: filterSelectedNodes
      }
    } 

    visDS = new NodesDataset()

    console.log(visDS)

    function displayPopup(data) {
      let checkbox = (text) => `<p><label><input class='title-filter' type="checkbox" name="${text}">${text}</label></p>`
      let html = data[1].map(d => checkbox(d.title)).join('');
      html += '<button onclick="return visDS.filterSelectedNodes()">Valider</button>'
      let popup = document.getElementById('popup')
      popup.style.display = 'block'
      popup.innerHTML = html
      popup.style.top = '200px'; popup.style.left = '300px';
      popup.data = data
    }





    // const saveManager = require('./utils/saveManager');
    // document.getElementById('btn-saveGraph').addEventListener('click', () => saveManager.save(visDS))
    // document.getElementById('btn-loadGraph').addEventListener('click', () => saveManager.load(visDS))
},{"./utils/suggestions":2,"./utils/wiki":3}],2:[function(require,module,exports){
var SuggestionModule = (function(props) {

  let $search = props.search, $list = props.list
  let asyncF = props.async

  $search.addEventListener('input', showSuggestions)
  $search.addEventListener('focusout', () => setTimeout(emptySuggestionList, 100))

  function emptySuggestionList() { $list.innerHTML = '' }

  function showSuggestions(e) {
    if (!e.target.value) return
    asyncF(e.target.value).then(results => {
      emptySuggestionList()
      results.query.search.slice(0, 5).map(page => addSuggestion(page))
    });

    function addSuggestion(page) {
      $list.appendChild(makeDiv(page.title))

      function makeDiv(title) {
        let div = document.createElement('div');
        div.addEventListener('click', suggestionClicked)
        div.innerText = title;
        return div
      }
    }
  }

  function suggestionClicked(e) {
    $search.value = e.target.innerText
    emptySuggestionList();
  }

  return {
    suggestionsClick: suggestionClicked
  }

})

module.exports = SuggestionModule
},{}],3:[function(require,module,exports){
module.exports = (function() {

  this.suggestions = function(search) {
    let url = `https://fr.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${search}&format=json`
    return fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error))
  }

  const API = 'https://fr.wikipedia.org/api/rest_v1'
  const endpoints = {
    summary: (title) => `${API}/page/summary/${title}`,
    meta: (title) => `${API}/page/metadata/${title}`,
    relations: (title) => `${API}/page/related/${title}`,
    instanceOf: (query) => `https://www.wikidata.org/wiki/Special:EntityData/${query}.json`
  }

  this.all = async function(title) {
    try {
      var data = await Promise.all([
        this.summary(title),
        this.meta(title),
        this.relations(title)
      ])
      return data
    }
    catch(error) {
      console.log(error)
    }
  }

  this.images = async function(titles) {
    try {
      return await Promise.all(titles.map(title => this.summary(title)))
    } catch(err) {
      console.log(err)
    }
  }

  this.get = function(url) {
    return fetch(url)
      .then(response => response.json())
      .catch(error => console.log(error))
  }

  this.summary = function(title) {
    return this.get(endpoints.summary(title));
  }

  this.meta = function(title) {
    return this.get(endpoints.meta(title));
  }

  this.relations = function(title) {
    return this.get(endpoints.relations(title));
  }

  this.instanceOf = function(query) {
    return this.get(endpoints.relations(query));
  }

  return {
    summary: this.summary.bind(this),
    meta: this.meta.bind(this),
    relations: this.relations.bind(this),
    all: this.all.bind(this),
    images: this.images.bind(this),
    suggestions: this.suggestions.bind(this)
  }

})()
},{}]},{},[1]);
