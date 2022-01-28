// GENERATED VIA NETLIFY AUTOMATED DEV TOOLS, EDIT WITH CAUTION!
/**
 * Issue that allows querying GitHub for more information about issues.
 */
export function fetchGetIssueBreakdown(
  variables: {"after": string},
  accessToken?: string
): Promise<
  {/**
  * Any data retrieved by the function will be returned here
  */
  "data": {
        "gitHub": {
        /**
  * Lookup a given repository by the owner and repository name.
  */
  "repository": {
        /**
  * A list of issues that have been opened in the repository.
  */
  "issues": {
        /**
  * Identifies the total count of items in the connection.
  */
  "totalCount": number, /**
  * Information to aid in pagination.
  */
  "pageInfo": {
        /**
  * When paginating backwards, the cursor to continue.
  */
  "startCursor": string, /**
  * When paginating forwards, are there more items?
  */
  "hasNextPage": boolean, /**
  * When paginating forwards, the cursor to continue.
  */
  "endCursor": string
    }, /**
  * A list of edges.
  */
  "edges": Array<{
        /**
  * The item at the end of the edge.
  */
  "node": {
        /**
  * Identifies the issue number.
  */
  "number": number, /**
  * Identifies the issue title.
  */
  "title": string, /**
  * The HTTP URL for this issue
  */
  "url": any, /**
  * Identifies the state of the issue.
  */
  "state": "OPEN" | "CLOSED", /**
  * A list of events, comments, commits, etc. associated with the issue.
  */
  "timelineItems": {
        /**
  * Identifies the total count of items in the connection.
  */
  "totalCount": number, /**
  * Information to aid in pagination.
  */
  "pageInfo": {
        /**
  * When paginating backwards, the cursor to continue.
  */
  "startCursor": string, /**
  * When paginating forwards, are there more items?
  */
  "hasNextPage": boolean, /**
  * When paginating forwards, the cursor to continue.
  */
  "endCursor": string
    }, /**
  * A list of nodes.
  */
  "nodes": Array<{
        /**
  * Issue or pull request that made the reference.
  */
  "source": {
        /**
  * Identifies the issue number.
  */
  "number": number, /**
  * Identifies the state of the issue.
  */
  "state": "OPEN" | "CLOSED"
    }
    }>
    }
    }
    }>
    }
    }
    }
    }, /**
  * Any errors in the function will be returned here
  */
  "errors": Array<any>}
>;

/**
 * An example query to start with.
 */
export function fetchExampleQuery(
  variables: {},
  accessToken?: string
): Promise<
  {/**
  * Any data retrieved by the function will be returned here
  */
  "data": {
        /**
  * Internal GraphQL field
  */
  "__typename": any
    }, /**
  * Any errors in the function will be returned here
  */
  "errors": Array<any>}
>;
