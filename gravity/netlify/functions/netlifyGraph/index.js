// GENERATED VIA NETLIFY AUTOMATED DEV TOOLS, EDIT WITH CAUTION!
const https = require("https")
const crypto = require("crypto")

exports.verifySignature = (input) => {
  const secret = input.secret
  const body = input.body
  const signature = input.signature

  if (!signature) {
    console.error('Missing signature')
    return false
  }

  const sig = {}
  for (const pair of signature.split(',')) {
    const [k, v] = pair.split('=')
    sig[k] = v
  }

  if (!sig.t || !sig.hmac_sha256) {
    console.error('Invalid signature header')
    return false
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(sig.t)
    .update('.')
    .update(body)
    .digest('hex')

  if (
    !crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(sig.hmac_sha256, 'hex')
    )
  ) {
    console.error('Invalid signature')
    return false
  }

  if (parseInt(sig.t, 10) < Date.now() / 1000 - 300 /* 5 minutes */) {
    console.error('Request is too old')
    return false
  }

  return true
}

const operationsDoc = `

query GetIssueBreakdown($after: String) @netlify(id: """c67c5c11-cbc4-48ed-8ac8-2803a4e4dc5f""", doc: """Issue that allows querying GitHub for more information about issues.""") {
  gitHub {
    repository(owner: "microsoft", name: "powertoys") {
      issues(first: 100, states: OPEN, after: $after) {
        totalCount
        pageInfo {
          startCursor
          hasNextPage
          endCursor
        }
        edges {
          node {
            number
            title
            url
            state
            timelineItems(first: 200, itemTypes: CROSS_REFERENCED_EVENT) {
              totalCount
              pageInfo {
                startCursor
                hasNextPage
                endCursor
              }
              nodes {
                ... on GitHubCrossReferencedEvent {
                  source {
                    ... on GitHubIssue {
                      number
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

query ExampleQuery @netlify(id: """df4c8cc1-2f1e-4d69-89c6-d695f77d45fd""", doc: """An example query to start with.""") {
  __typename
}`

const httpFetch = (siteId, options) => {
  const reqBody = options.body || null
  const userHeaders = options.headers || {}
  const headers = {
    ...userHeaders,
    'Content-Type': 'application/json',
    'Content-Length': reqBody.length,
  }

  const reqOptions = {
    method: 'POST',
    headers,
    timeout: 30000,
  }

  const url = 'https://serve.onegraph.com/graphql?app_id=' + siteId

  const respBody = []

  console.log("Call to:", url, "with:", reqOptions)

  return new Promise((resolve, reject) => {
    const req = https.request(url, reqOptions, (res) => {
      if (res.statusCoce && (res.statusCode < 200 || res.statusCode > 299)) {
        return reject(
          new Error(
            "Netlify OneGraph return non - OK HTTP status code" + res.statusCode,
          ),
        )
      }

      res.on('data', (chunk) => respBody.push(chunk))

      res.on('end', () => {
        const resString = Buffer.concat(respBody).toString()
        resolve(resString)
      })
    })

    req.on('error', (e) => {
      console.error('Error making request to Netlify OneGraph: ', e)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request to Netlify OneGraph timed out'))
    })

    req.write(reqBody)
    req.end()
  })
}



const fetchOneGraph = async function fetchOneGraph(input) {
  const query = input.query
  const operationName = input.operationName
  const variables = input.variables
  const options = input.options || {}
  const accessToken = options.accessToken

  const siteId = options.siteId || process.env.SITE_ID

  const payload = {
    query,
    variables,
    operationName,
  }

  const result = await httpFetch(
    siteId,
    {
      method: 'POST',
      headers: {
        Authorization: accessToken ? "Bearer " + accessToken : '',
      },
      body: JSON.stringify(payload),
    },
  )

  return JSON.parse(result)
}


exports.verifyRequestSignature = (request) => {
  const event = request.event
  const secret = process.env.NETLIFY_GRAPH_WEBHOOK_SECRET
  const signature = event.headers['x-netlify-graph-signature']
  const body = event.body

  if (!secret) {
    console.error(
      'NETLIFY_GRAPH_WEBHOOK_SECRET is not set, cannot verify incoming webhook request'
    )
    return false
  }

  return verifySignature({ secret, signature, body: body || '' })
}

exports.fetchGetIssueBreakdown = (
  variables,
  options
) => {
  return fetchOneGraph({
    query: operationsDoc,
    operationName: "GetIssueBreakdown",
    variables,
    options: options || {},
  });
}


exports.fetchExampleQuery = (
  variables,
  options
) => {
  return fetchOneGraph({
    query: operationsDoc,
    operationName: "ExampleQuery",
    variables,
    options: options || {},
  });
}


/**
 * The generated NetlifyGraph library with your operations
 */
const functions = {
  /**
  * An example query to start with.
  */
  fetchExampleQuery: exports.fetchExampleQuery,
  /**
  * Issue that allows querying GitHub for more information about issues.
  */
  fetchGetIssueBreakdown: exports.fetchGetIssueBreakdown
}

exports.default = functions

exports.handler = async (event, context) => {
  // return a 401 json response
  return {
    statusCode: 401,
    body: JSON.stringify({
      message: 'Unauthorized',
    }),
  }
}