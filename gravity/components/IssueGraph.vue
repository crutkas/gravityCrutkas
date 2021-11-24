<!-- Please remove this file from your project -->
<template>
  <div>
    <svg id="issueGraph" width="600" height="600"></svg>
  </div>
</template>

<script>
export default {
  props: {
    issueData: String,
  },
  mounted() {
    this.getData(this.issueData);
  },
  methods: {
    getData(issueData) {
      d3.csv(issueData, function(error, data) {
        createNetwork(data)
      });
    }
  },
}

function createNetwork(edgelist) {
    var nodeHash = {};
    var nodes = [];
    var edges = [];

    edgelist.forEach(function(edge) {
        if (!nodeHash[edge.source]) {
            nodeHash[edge.source] = {
                id: edge.source,
                label: edge.source
            };
            nodes.push(nodeHash[edge.source]);
        }
        if (!nodeHash[edge.target]) {
            nodeHash[edge.target] = {
                id: edge.target,
                label: edge.target
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
    createForceNetwork(nodes, edges);
}

function createForceNetwork(nodes, edges) {

    //create a network from an edgelist

    var force = d3.layout.force().nodes(nodes).links(edges)
        .size([500, 500])
        .charge(function(d) {
            return Math.min(-100, d.weight * -50)
        })
        .on("tick", updateNetwork);

    d3.select("svg").selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .style("stroke-width", "1px")
        .style("stroke", "#996666");

    var nodeEnter = d3.select("svg").selectAll("g.node")
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
        .style("fill", "#CC9999")
        .style("stroke", "black")
        .style("stroke-width", "1px")

    nodeEnter.append("text")
        .style("text-anchor", "middle")
        .attr("y", 2)
        .style("stroke-width", "1px")
        .style("stroke-opacity", 0.75)
        .style("stroke", "white")
        .style("font-size", "8px")
        .text(function(d) {
            return d.id
        })
        .style("pointer-events", "none")

    nodeEnter.append("text")
        .style("text-anchor", "middle")
        .attr("y", 2)
        .style("font-size", "8px")
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
            .style("fill", "#CC9999");

        d3.selectAll("line")
            .style("stroke", "#996666")
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

</script>
