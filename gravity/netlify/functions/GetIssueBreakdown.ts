const { getSecrets } = require("@netlify/functions");
const NetlifyGraph = require("./netlifyGraph")

exports.handler = async (event, context) => {
  // By default, all API calls use no authentication
  let accessToken = null;

  //// If you want to use the client's accessToken when making API calls on the user's behalf:
  // accessToken = event.headers["authorization"]?.split(" ")[1]

  //// If you want to use the API with your own access token:
  // accessToken = event.authlifyToken
      
  const eventBodyJson = JSON.parse(event.body || "{}");

  const after = eventBodyJson?.after;

  const { errors: GetIssueBreakdownErrors, data: GetIssueBreakdownData } =
    await NetlifyGraph.fetchGetIssueBreakdown({ after: after }, accessToken);

  if (GetIssueBreakdownErrors) {
    console.error(JSON.stringify(GetIssueBreakdownErrors, null, 2));
  }

  console.log(JSON.stringify(GetIssueBreakdownData, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      GetIssueBreakdownErrors: GetIssueBreakdownErrors,
      GetIssueBreakdownData: GetIssueBreakdownData
    }),
    headers: {
      'content-type': 'application/json',
    },
  };
};

/** 
 * Client-side invocations:
 * Call your Netlify function from the browser (after saving
 * the code to `GetIssueBreakdown.js`) with these helpers:
 */

/**
async function fetchGetIssueBreakdown(netlifyGraphAuth, params) {
  const {after} = params || {};
  const resp = await fetch(`/.netlify/functions/GetIssueBreakdown`,
    {
      method: "POST",
      body: JSON.stringify({"after": after}),
      headers: {
        ...netlifyGraphAuth?.authHeaders()
      }
    });

    const text = await resp.text();

    return JSON.parse(text);
}
*/
