# ⭐ gravity

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dend/gravity)

A web application designed to visualize cross-referenced issues in a GitHub repository.

It leverages [Netlify Graph](http://ntl.fyi/netlify-graph-docs) to authenticate against GitHub, and then execute one of stored GraphQL queries.

![Demo of the Gravity tool](media/gravity-demo.gif)

## Running

To get the application running, you will need to deploy it to Netlify and ensure that you have connected GitHub with Netlify Graph in your website.

![GitHub enabled as a connection in Netlify Graph](media/gravity-auth.gif)

## Editing Queries

To edit the pre-programmed GraphQL queries:

1. Install the Netlify CLI: `npm install netlify-cli -g`
2. Open the repository folder in your Terminal: `cd <repo_path>`
3. Ensure that the repository is linked to your site on Netlify: `netlify link`
4. Run: `netlify graph:edit`
