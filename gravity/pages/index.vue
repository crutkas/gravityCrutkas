<template>
  <IssueGraph :issueData="issueData"/>
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

        return {
          issueData: JSON.stringify(relationships),
        };
      } else {
        return {
          issueData: { error: "No GitHub token available." },
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
      query: `query {repository(owner:"microsoft",name:"powertoys"){issues(first:100, states:OPEN, after:"${after}"){totalCount pageInfo{startCursor hasNextPage endCursor}edges{node{number timelineItems(first:200,itemTypes:CROSS_REFERENCED_EVENT){totalCount pageInfo{startCursor hasNextPage endCursor}nodes{...on CrossReferencedEvent{source{...on Issue{number}}}}}}}}}}`,
    };
  } else {
    body = {
      query:
        'query {repository(owner:"microsoft",name:"powertoys"){issues(first:100, states:OPEN){totalCount pageInfo{startCursor hasNextPage endCursor}edges{node{number timelineItems(first:200,itemTypes:CROSS_REFERENCED_EVENT){totalCount pageInfo{startCursor hasNextPage endCursor}nodes{...on CrossReferencedEvent{source{...on Issue{number}}}}}}}}}}',
    };
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers,
  });

  console.log(`About to submit a request with the following parameters: ${JSON.stringify(body)}`)
  const data = await response.json();
  return data;
}

function computeLinks (nodeContainer: Array<Edge[]> | null)
{
  let relationships:any = [];

  if (nodeContainer)
  {
    nodeContainer.forEach(function (nodeBlock) {
      // Here we now have an array of node objects
      nodeBlock.forEach(function(node) {
        let number = node.node.number;
        node.node.timelineItems.nodes.forEach(function (referenceNode) {
          relationships.push([number, referenceNode.source.number]);
        });
      });
    });

    return JSON.stringify(relationships); 
  }
  else
  {
    return { "error": "Could not compute links." }
  }
}
</script>
