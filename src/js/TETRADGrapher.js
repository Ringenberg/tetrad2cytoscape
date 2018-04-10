/** @overview Online tool for converting TETRAD graphs into images or json */
/** @module */
import $ from 'jquery';
import cytoscape from 'cytoscape';
import contextMenus from 'cytoscape-context-menus';
import ccmccs from 'cytoscape-context-menus/cytoscape-context-menus.css';

contextMenus(cytoscape, $);

var graph;

/**
 * Event handler for loading a TETRAD exported xml file into a cytoscape graph.
 * @param {Event} ev - the load event that has the contents of the file.
 */
function handleFileUpload(ev) {
  var files = ev.target.files;
  graph.elements().remove(); // clear cytoscape graph
  Array.prototype.forEach.call(files, function (file) {
    //console.log(file,'is',file.type);
    if (file.type.match('text/xml')) { // only xml files
      //console.log(file,'as xml');
      var reader = new FileReader();
      reader.onload = (function (xfile) {
	return function (e) {
	  var $xml = $($.parseXML(e.target.result));
	  // Find all the nodes.
	  $xml.find('variable').each(function () {
	    graph.add({group: "nodes",
		       data: {id: $(this).text()}});
	  });
	  // Find all the edges
	  $xml.find('edge').each(function () {
	    var edge = $(this).text();
	    if (edge.includes('-->')) {
	      var st = edge.split(' --> ');
	      graph.add({group: "edges",
			 data: {id: $(this).text(),
				source: st[0],
				target: st[1]}});
	    }
	    if (edge.includes('o-o')) {
	      var oo = edge.split(' o-o ');
	      graph.add({group: "edges",
			 data: {id: edge, source: oo[0],
				target: oo[1]},
			 classes: "doublecircle"});
	    }
	    if (edge.includes('o->')) {
	      var ol = edge.split(' o-> ');
	      graph.add({group: "edges",
			 data: {id: edge, source: ol[0],
				target: ol[1]},
			 classes: "circlearrow"});
	    }
	    if (edge.includes('<->')) {
	      var aa = edge.split(' <-> ');
	      graph.add({group: "edges",
			 data: {id: edge, source: aa[0],
				target: aa[1]},
			 classes: "doublearrow"});
	    }
	  });
	  var layout = graph.elements().layout({
	    name:'circle',
	    padding:10,
	    radius: 125,
	    fit: false,
	    avoidOverlap: false});
	  layout.run();
	};
      })(file);
      reader.readAsText(file);
    } else if (file.type.match('application/json')) { // or json
      //console.log(file,'as json');
      var jreader = new FileReader();
      jreader.onload = (function () {
        return function (e) {
          //console.log(e.target.result);
          var json = JSON.parse(e.target.result);
          var lopt = json.layout;
          lopt.position = function(n) {
	    return {row: n.data('row') , col: n.data('column')};
	  };
          //json.elements.forEach(function(n) { console.log(n); graph.add(n); });
          graph.add(json.elements);
          graph.layout(lopt).run();
        };
      })(file);
      jreader.readAsText(file);
    } else {
      console.log(file,'as unknown');
    }
  });
}

$(function () {
  $('#tetradxml').on('change', handleFileUpload);
  graph = cytoscape({
    container: $('#graph'),
    selectionType: 'additive',
    style: [{selector: 'node',
             style: {
               'background-color' : 'lightblue',
               'label' : 'data(id)',
               'shape' : 'roundrectangle',
               'text-valign' : 'center',
               'border-width' : '1px',
               'border-style' : 'solid',
               'border-color' : 'grey',
               'width': 'label',
               'height': 'label',
               'padding': 5
             }},
            {selector: 'node:selected',
             style: { 'background-color': 'orange'}
            },
            {selector: 'node.latent',
             style: { 'shape': 'ellipse'}
            },
            {selector: 'edge',
             style: {
	       'arrow-scale': 2,
               'width': 3,
               'line-color': 'blue',
               'target-arrow-shape' : 'triangle',
               'target-arrow-color' : 'blue',
               'source-arrow-color' : 'blue',
               'curve-style' : 'bezier'
             }},
            {selector: 'edge.doublearrow',
             style: {
               'source-arrow-shape': 'triangle'
             }},
            {selector: 'edge.circlearrow',
             style: {
               'source-arrow-shape': 'circle',
               'source-arrow-fill': 'hollow'
             }
            },
            {selector: 'edge.doublecircle',
             style: {
               'source-arrow-shape': 'circle',
               'target-arrow-shape': 'circle',
               'source-arrow-fill': 'hollow',
               'target-arrow-fill': 'hollow'
             }
            },
            {selector: 'edge:selected',
             style: {
               'line-color' : 'orange',
               'target-arrow-color' : 'orange',
               'source-arrow-color' : 'orange'
               //'line-style': 'dashed'
             }},
            {selector: 'edge.undirected',
             style: {
               'target-arrow-shape': 'none',
               'source-arrow-shape': 'none'
             }} ]
  });
  graph.contextMenus(
    {
      menuItems: [
	{
	  id: 'latent',
	  content: 'Toggle Normal/Latent',
	  selector: 'node',
	  onClickFunction: function (ev) {
	    ev.target.toggleClass('latent');
	  },
	  show: true,
	  disabled: false,
	  coreAsWell: false
	}
      ]
    }
  );
  window.cytograph = graph;
  $('#out_png').on('click', function () {
    $('#image_png').attr('src', graph.png());
  });
  $('#out_json').on('click', function () {
    $('#image_json').text(JSON.stringify(graph.json(), null, 2));
  });
});
