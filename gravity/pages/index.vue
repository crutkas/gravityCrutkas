<template>
  <IssueGraph :issueData="issueData" :issueSummary="issueSummary"/>
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
        let summaries = computeSummary(sanitizedIssues);

        return {
          issueData: relationships,
          issueSummary: JSON.stringify(summaries)
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
      query: `query {repository(owner:"microsoft",name:"powertoys"){issues(first:100, states:OPEN, after:"${after}"){totalCount pageInfo{startCursor hasNextPage endCursor}edges{node{number title url timelineItems(first:200,itemTypes:CROSS_REFERENCED_EVENT){totalCount pageInfo{startCursor hasNextPage endCursor}nodes{...on CrossReferencedEvent{source{...on Issue{number}}}}}}}}}}`,
    };
  } else {
    body = {
      query:
        'query {repository(owner:"microsoft",name:"powertoys"){issues(first:100, states:OPEN){totalCount pageInfo{startCursor hasNextPage endCursor}edges{node{number title url timelineItems(first:200,itemTypes:CROSS_REFERENCED_EVENT){totalCount pageInfo{startCursor hasNextPage endCursor}nodes{...on CrossReferencedEvent{source{...on Issue{number}}}}}}}}}}',
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
        let summary : IssueSummary = {};
        summary.url = node.node.url;
        summary.title = node.node.title;
        summary.referencedIn = node.node.timelineItems.totalCount;

        summaryItems.push(summary);
      });
    });
  }

  return summaryItems;
}

function computeLinks (nodeContainer: Array<Edge[]> | null)
{
  let relationships:any = [["source", "target", "weight"]];

  if (nodeContainer)
  {
    nodeContainer.forEach(function (nodeBlock) {
      nodeBlock.forEach(function(node) {
        let number = node.node.number;
        node.node.timelineItems.nodes.forEach(function (referenceNode) {
          relationships.push([number, referenceNode.source.number, 6]);
        });
      });
    });

    let filteredRelationships = relationships.filter(function (entity:any) {
      return (entity[0] != null && entity[1] != null)
    });

    return filteredRelationships.map((e:any) => e.join(",")).join("\n"); 
  }
  else
  {
    return { "error": "Could not compute links." }
  }
}
</script>
