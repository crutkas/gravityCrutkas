import { getSecrets, NetlifySecrets } from '@netlify/functions'
import NetlifyGraph, { NetlifyGraphFunctionOptions } from './netlifyGraph'

export const handler = async (event, context) => {
  const accessToken = event.authlifyToken
  const eventBodyJson = JSON.parse(event.body || '{}')

  const after = eventBodyJson?.after

  const { errors: GetIssueBreakdownErrors, data: GetIssueBreakdownData } =
    await NetlifyGraph.fetchGetIssueBreakdown({ after }, { accessToken })

  if (GetIssueBreakdownErrors) {
    console.error(JSON.stringify(GetIssueBreakdownErrors, null, 2))
  }

  console.log(JSON.stringify(GetIssueBreakdownData, null, 2))

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      GetIssueBreakdownErrors,
      GetIssueBreakdownData,
    }),
    headers: {
      'content-type': 'application/json',
    },
  }
}
