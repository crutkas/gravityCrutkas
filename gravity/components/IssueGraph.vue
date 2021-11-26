<!-- Please remove this file from your project -->
<template>
  <div class="svg-container">
    <svg id="issueGraph"></svg>
  </div>
</template>

<script>
const d3 = require("d3");

export default {
  props: {
    issueData: String
  },
  mounted() {
    console.log(JSON.stringify(this.issueData));
    this.getData(this.issueData);
  },
  methods: {
    getData(issueData) {
      createNetwork(issueData);
    }
  },
}

function createNetwork(edgelist) {
    var nodeHash = {};
    var nodes = [];
    var edges = [];

    edgelist.links.forEach(function(edge) {
        if (!nodeHash[edge.source]) {
            nodeHash[edge.source] = {
                id: edge.source,
                label: edge.source,
                group: edgelist.nodes.find(x => x.id === edge.source).group
            };
            nodes.push(nodeHash[edge.source]);
        }
        if (!nodeHash[edge.target]) {
            nodeHash[edge.target] = {
                id: edge.target,
                label: edge.target,
                group: edgelist.nodes.find(x => x.id === edge.target).group
            };
            nodes.push(nodeHash[edge.target]);
        }
        if (edge.weight >= 5) {
            edges.push({
                source: nodeHash[edge.source],
                target: nodeHash[edge.target],
                weight: edge.weight
            });
        }
    });

    console.log("Nodes")
    console.log(nodes)
    console.log("Edges")
    console.log(edges)

    createForceNetwork(nodes, edges);
}

// Layout inspired from: https://bl.ocks.org/emeeks/df6ea0128724289337ef
function createForceNetwork(nodes, edges) {
    var force = d3.layout.force().nodes(nodes).links(edges)
        .size([500, 500])
        .charge(function(d) {
            return Math.min(-100, d.weight * -50)
        })
        .on("tick", updateNetwork);

    var svg = d3.select("svg")
       .attr("preserveAspectRatio", "xMinYMin meet")
       .attr("viewBox", "0 0 1900 1900")
       .classed("svg-content-responsive", true)
       .attr("width", 1900)
       .attr("height", 1900)
       .call(d3.behavior.zoom().on("zoom", function () {
            console.log(d3.event.transform);
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
        }))
       .append("g")

    svg.selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .style("fill", "#000")
        .style("stroke-width", "1px")
        .style("stroke", "#996666");

    var nodeEnter = svg.selectAll("g.node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .on("click", nodeClick)
        .on("dblclick", nodeDoubleClick)
        .on("mouseover", nodeOver)
        .on("mouseout", nodeOut)
        .call(force.drag());

    nodeEnter.append("circle")
        .attr("r", 5)
        .style("fill", function(d) {
            if (d.group == 1) {
                return "#238636"
            } else {
                return "#8957e5"
            }
        })
        .style("stroke", "black")
        .style("stroke-width", "1px")

    nodeEnter.append("text")
        .style("text-anchor", "middle")
        .attr("y", 2)
        .style("font-size", "12px")
        .text(function(d) {
            return d.id
        })
        .style("pointer-events", "none")

    force.start();

    function nodeClick(d) {
        d.fixed = true;
    }

    function nodeDoubleClick(d) {
        d.fixed = false;
    }

    function nodeOver(d) {
        force.stop();
        highlightEgoNetwork(d);
    }

    function nodeOut() {
        force.start();
        d3.selectAll("g.node > circle")
            .style("fill", function(d) {
            if (d.group == 1) {
                return "#238636"
            } else {
                return "#8957e5"
            }
        })

        d3.selectAll("line")
            .style("stroke", "#996666")
            .style("fill", "#000")
            .style("stroke-width", "1px");
    }

    function highlightEgoNetwork(d) {
        var egoIDs = [];
        var filteredEdges = edges.filter(function(p) {
            return p.source == d || p.target == d
        });

        filteredEdges
            .forEach(function(p) {
                if (p.source == d) {
                    egoIDs.push(p.target.id)
                } else {
                    egoIDs.push(p.source.id)
                }
            });

        d3.selectAll("line").filter(function(p) {
                return filteredEdges.indexOf(p) > -1
            })
            .style("stroke", "#66CCCC")
            .style("fill", "#000")
            .style("stroke-width", "2px");

        d3.selectAll("circle").filter(function(p) {
                return egoIDs.indexOf(p.id) > -1
            })
            .style("fill", "#66CCCC");
    }

    function updateNetwork() {
        d3.select("svg").selectAll("line")
            .attr("x1", function(d) {
                return d.source.x
            })
            .attr("y1", function(d) {
                return d.source.y
            })
            .attr("x2", function(d) {
                return d.target.x
            })
            .attr("y2", function(d) {
                return d.target.y
            });

        d3.select("svg").selectAll("g.node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"
            });

        d3.select("svg").selectAll("g.node > circle")
            .attr("r", function(d) {
                return d.weight
            });

    }
  }

</script>

<style type="text/css">
  .svg-container {
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 100%; /* aspect ratio */
    vertical-align: top;
    overflow: hidden;
  }

  .svg-content-responsive {
    display: inline-block;
    position: absolute;
    top: 10px;
    left: 0;
  }

  svg .rect {
    fill: #fff;
  }
</style>
