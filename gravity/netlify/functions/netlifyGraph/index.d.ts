// GENERATED VIA NETLIFY AUTOMATED DEV TOOLS, EDIT WITH CAUTION!

export type NetlifyGraphFunctionOptions = {
  accessToken?: string
  siteId?: string
}

export type WebhookEvent = {
  body: string
  headers: Record<string, string | null | undefined>
}

export type GraphQLError = {
  path: Array<string | number>
  message: string
  extensions: Record<string, unknown>
}

export type ExampleQuery = {
  /**
   * Any data from the function will be returned here
   */
  data: /** No fields, named fragments, or inline fragments found */ Record<
    string,
    unknown
  >
  /**
   * Any errors from the function will be returned here
   */
  errors: Array<GraphQLError>
}

/**
 * An example query to start with.
 */
export function fetchExampleQuery(
  variables: Record<string, never>,
  options?: NetlifyGraphFunctionOptions
): Promise<ExampleQuery>

export type GetIssueBreakdownInput = { after: string }

export type GetIssueBreakdown = {
  /**
   * Any data from the function will be returned here
   */
  data: {
    gitHub: {
      /**
       * Lookup a given repository by the owner and repository name.
       */
      repository: {
        /**
         * A list of issues that have been opened in the repository.
         */
        issues: {
          /**
           * Identifies the total count of items in the connection.
           */
          totalCount: number
          /**
           * Information to aid in pagination.
           */
          pageInfo: {
            /**
             * When paginating backwards, the cursor to continue.
             */
            startCursor: string
            /**
             * When paginating forwards, are there more items?
             */
            hasNextPage: boolean
            /**
             * When paginating forwards, the cursor to continue.
             */
            endCursor: string
          }
          /**
           * A list of edges.
           */
          edges: Array<{
            /**
             * The item at the end of the edge.
             */
            node: {
              /**
               * Identifies the issue number.
               */
              number: number
              /**
               * Identifies the issue title.
               */
              title: string
              /**
               * The HTTP URL for this issue
               */
              url: string
              /**
               * Identifies the state of the issue.
               */
              state: 'OPEN' | 'CLOSED'
              /**
               * A list of events, comments, commits, etc. associated with the issue.
               */
              timelineItems: {
                /**
                 * Identifies the total count of items in the connection.
                 */
                totalCount: number
                /**
                 * Information to aid in pagination.
                 */
                pageInfo: {
                  /**
                   * When paginating backwards, the cursor to continue.
                   */
                  startCursor: string
                  /**
                   * When paginating forwards, are there more items?
                   */
                  hasNextPage: boolean
                  /**
                   * When paginating forwards, the cursor to continue.
                   */
                  endCursor: string
                }
              }
            }
          }>
        }
      }
    }
  }
  /**
   * Any errors from the function will be returned here
   */
  errors: Array<GraphQLError>
}

/**
 * Issue that allows querying GitHub for more information about issues.
 */
export function fetchGetIssueBreakdown(
  variables: GetIssueBreakdownInput,
  options?: NetlifyGraphFunctionOptions
): Promise<GetIssueBreakdown>
