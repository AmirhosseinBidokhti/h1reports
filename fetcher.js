import got from 'got';
import { JSONFilePreset,JSONFile } from 'lowdb/node'
import { Low } from 'lowdb'
import { Logger, sendNotification } from './message.js';
import 'dotenv/config'

let {TELEGRAM_CHANNEL_ID, TELEGRAM_BOT_TOKEN} = process.env


async function getLatestDisclosedReport () {
  try {
    const response = await got.post('https://hackerone.com/graphql', {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9,fa;q=0.8,es;q=0.7',
        'content-type': 'application/json',
        'origin': 'https://hackerone.com',
        'referer': 'https://hackerone.com/hacktivity/overview?queryString=disclosed%3Atrue&sortField=latest_disclosable_activity_at&sortDirection=DESC&pageIndex=0',
        'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'x-product-area': 'hacktivity',
        'x-product-feature': 'overview',
      },
      json: {
        "operationName": "CompleteHacktivitySearchQuery",
        "variables": {
          "userPrompt": null,
          "queryString": "disclosed:true",
          "size": 100,
          "from": 0,
          "sort": {
            "field": "latest_disclosable_activity_at",
            "direction": "DESC"
          },
          "product_area": "hacktivity",
          "product_feature": "overview"
        },
        "query": "query CompleteHacktivitySearchQuery($queryString: String!, $from: Int, $size: Int, $sort: SortInput!) {\n  me {\n    id\n    __typename\n  }\n  search(\n    index: CompleteHacktivityReportIndexService\n    query_string: $queryString\n    from: $from\n    size: $size\n    sort: $sort\n  ) {\n    __typename\n    total_count\n    nodes {\n      __typename\n      ... on CompleteHacktivityReportDocument {\n        id\n        _id\n        reporter {\n          id\n          name\n          username\n          ...UserLinkWithMiniProfile\n          __typename\n        }\n        cve_ids\n        cwe\n        severity_rating\n        upvoted: upvoted_by_current_user\n        public\n        report {\n          id\n          databaseId: _id\n          title\n          substate\n          url\n          disclosed_at\n          report_generated_content {\n            id\n            hacktivity_summary\n            __typename\n          }\n          __typename\n        }\n        votes\n        team {\n          handle\n          name\n          medium_profile_picture: profile_picture(size: medium)\n          url\n          id\n          currency\n          ...TeamLinkWithMiniProfile\n          __typename\n        }\n        total_awarded_amount\n        latest_disclosable_action\n        latest_disclosable_activity_at\n        submitted_at\n        disclosed\n        has_collaboration\n        __typename\n      }\n    }\n  }\n}\n\nfragment UserLinkWithMiniProfile on User {\n  id\n  username\n  __typename\n}\n\nfragment TeamLinkWithMiniProfile on Team {\n  id\n  handle\n  name\n  __typename\n}"
      },
    });

    return response.body
  } catch (error) {
    console.error(error);
  }

}

// later
async function readAllReports() {

}


export async function checkAndInsert() {
  // get latest disclosed reports from hackerone
  let latestDisclosedReports = await getLatestDisclosedReport()
  latestDisclosedReports = JSON.parse(latestDisclosedReports).data.search.nodes

  // get current existing reports from own db
  let db = await JSONFilePreset('reportsDB.json', {})
  let existingReports = db.data;

  // find new reports which might exist
  const newReports = latestDisclosedReports.filter(newItem => !existingReports.some(existingItem => existingItem.id === newItem.id));

  if (newReports.length > 0) {
    console.log('new ones', newReports.length);
    newReports.map(newReport => {
      existingReports.push(newReport);
      sendNotification(new Logger().notifFormatter(newReport), TELEGRAM_CHANNEL_ID, TELEGRAM_BOT_TOKEN);
    });
    await db.write();
    // todo: separate to other function and area. more atomic
    
  }

}


export async function seeder() {
  // if database does not exist, create one and populate it with current discloused reports
  // maybe add them to telegram too or simply does this with last 100 reports
  let latestReports = await getLatestDisclosedReport();
  latestReports = JSON.parse(latestReports).data.search.nodes

  const db = await JSONFilePreset('reportsDB.json', latestReports)
  let res = await db.write()

}






/*Limits
Lowdb doesn't support Node's cluster module.

If you have large JavaScript objects (~10-100MB) you may hit some performance issues. This is because whenever you call db.write, the whole db.data is serialized using JSON.stringify and written to storage.

Depending on your use case, this can be fine or not. It can be mitigated by doing batch operations and calling db.write only when you need it.

If you plan to scale, it's highly recommended to use databases like PostgreSQL or MongoDB instead.
*/
