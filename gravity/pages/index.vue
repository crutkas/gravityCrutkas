<template>
  <div>
    <IssueGraph :issueData="issueData"/>
    <IssueSummary :issueSummary="issueSummary"/>
  </div>
</template>

<script lang="ts">
import { getSecrets, NetlifySecrets } from "@netlify/functions";
import { Context } from "@nuxt/types";

export interface Container {
    data: Data;
}

export interface Data {
    repository: Repository;
}

export interface Repository {
    issues: Issues;
}

export interface Issues {
    totalCount: number;
    pageInfo:   PageInfo;
    edges:      Edge[];
}

export interface Edge {
    node: EdgeNode;
}

export interface EdgeNode {
    number:        number;
    title:         string;
    url:           string;
    state:         string;
    timelineItems: TimelineItems;
}

export interface TimelineItems {
    totalCount: number;
    pageInfo:   PageInfo;
    nodes:      NodeElement[];
}

export interface NodeElement {
    source: Source;
}

export interface Source {
    number?: number;
}

export interface PageInfo {
    startCursor: null | string;
    hasNextPage: boolean;
    endCursor:   null | string;
}

export interface IssueSummary {
  title: string;
  url: string;
  referencedIn: number;
}

export interface Relationship {
  source: string;
  target: string;
  weight: number;
}

export interface BarebonesNode {
  id: string;
  group: number;
}

export interface D3DataContainer {
  nodes: Array<BarebonesNode>;
  links: Array<Relationship>;
}


export default {
  async asyncData(context: Context) {
    try {
      let secrets: NetlifySecrets = {};
      secrets = await getSecrets();
      if (secrets.gitHub) {
        // Empty array at first - we haven't yet gotten any issues.
        let sanitizedIssues = [];

        // Initial call - let's get the first batch.
        let issues: Container = await getIssues(secrets.gitHub?.bearerToken, null);
        console.log(issues);

        // See if we have a stack of referenced issues
        if (issues.data.repository.issues.edges) {
          // Insert the current stack of issues
          sanitizedIssues.push(issues.data.repository.issues.edges);

          // If there is more than one page, let's get all the issues.
          while (issues.data.repository.issues.pageInfo.hasNextPage) {
            console.log("Iterating!");
            issues = await getIssues(
              secrets.gitHub?.bearerToken,
              issues.data.repository.issues.pageInfo.endCursor
            );
            sanitizedIssues.push(issues.data.repository.issues.edges);
          }
        }

        let relationships = computeLinks(sanitizedIssues);
        let nodeStates = computeNodeStates(sanitizedIssues);
        let summaries = computeSummary(sanitizedIssues);

        let d3data : D3DataContainer = {
          nodes: nodeStates,
          links: relationships
        }

        return {
          issueData: d3data,
          issueSummary: summaries
        };
      } else {
        return {
          issueData: { error: "No issue data available." },
          issueSummary: { error: "No summary available." },
        };
      }
    } catch (e) {
      context.error(e);
    }
  },
  created() {
    console.log("Created!");
  },
};

// Returns the list of issues along with cross-referenced
// issues/PRs in the same repository.
// ---
// The `after` argument is used to set the cursor for
// query pagination in cases where the repository has a lot of issues.
async function getIssues(token: string | null, after: string | null) {
  console.log("Trying to get issues...");

  const headers = {
    Authorization: `bearer ${token}`,
  };

  let body = {};

  if (after) {
    body = {
      query: `query {repository(owner:"microsoft",name:"powertoys"){issues(first:100, states:OPEN, after:"${after}"){totalCount pageInfo{startCursor hasNextPage endCursor}edges{node{number title url state timelineItems(first:200,itemTypes:CROSS_REFERENCED_EVENT){totalCount pageInfo{startCursor hasNextPage endCursor}nodes{...on CrossReferencedEvent{source{...on Issue{number state}}}}}}}}}}`,
    };
  } else {
    body = {
      query:
        'query {repository(owner:"microsoft",name:"powertoys"){issues(first:100, states:OPEN){totalCount pageInfo{startCursor hasNextPage endCursor}edges{node{number title url state timelineItems(first:200,itemTypes:CROSS_REFERENCED_EVENT){totalCount pageInfo{startCursor hasNextPage endCursor}nodes{...on CrossReferencedEvent{source{...on Issue{number state}}}}}}}}}}',
    };
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers,
  });

  const data = await response.json();
  return data;
}

function computeSummary(nodeContainer: Array<Edge[]> | null){
  let summaryItems : Array<IssueSummary> = []

  if (nodeContainer) {
    nodeContainer.forEach(function (nodeBlock) {
      nodeBlock.forEach(function(node) {
        let summary : IssueSummary = {
          url: '',
          title: '',
          referencedIn: 0
        };
        summary.url = node.node.url;
        summary.title = node.node.title;
        summary.referencedIn = node.node.timelineItems.totalCount;

        summaryItems.push(summary);
      });
    });
  }

  return summaryItems;
}

function computeNodeStates (nodeContainer: Array<Edge[]> | null)
{
  let nodeStates : Array<BarebonesNode> = []

  if (nodeContainer) {
    nodeContainer.forEach(function (nodeBlock) {
      nodeBlock.forEach(function(node) {
        let topLevelNode : BarebonesNode = {
          id: node.node.number.toString(),
          group: equalsIgnoringCase(node.node.state , "OPEN") ? 1 : 0
        };

        nodeStates.push (topLevelNode);

        node.node.timelineItems.nodes.forEach(function (referenceNode) {
          let nestedNode : BarebonesNode = {
            id: referenceNode.source.number.toString(),
            group: equalsIgnoringCase(referenceNode.source.state, "OPEN") ? 1 : 0
          };

          nodeStates.push(nestedNode);
        });
      });
    });
  }

  let filteredNodeStates = nodeStates.filter((value, index, array)=>array.findIndex(t=>(t.id === value.id))===index)
  return filteredNodeStates;
}

function computeLinks (nodeContainer: Array<Edge[]> | null)
{
  let relationships:any = [];

  if (nodeContainer)
  {
    nodeContainer.forEach(function (nodeBlock) {
      nodeBlock.forEach(function(node) {
        let number = node.node.number;
        node.node.timelineItems.nodes.forEach(function (referenceNode) {
          let relationship : Relationship = {
            source: number.toString(),
            target: referenceNode.source.number.toString(),
            weight: 6
          };
          relationships.push(relationship);
        });
      });
    });

    let filteredRelationships = relationships.filter(function (entity:Relationship) {
      return (entity.source != null && entity.target != null)
    });

    return filteredRelationships; 
  }
  else
  {
    return { "error": "Could not compute links." }
  }
}

function equalsIgnoringCase(text, other) {
    return text.localeCompare(other, undefined, { sensitivity: 'base' }) === 0;
}
</script>
