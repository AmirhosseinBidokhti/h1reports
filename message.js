import got from 'got';

const messageEmojis = {
    "report.title": "✍🏻",
    "report.url": "🔗",
    "cwe": "CWE",
    "severity_rating": "Severity",
    "reporter.username": "🧑🏻‍💻",
    "team.handle": "🏢",
    "total_awarded_amount": "💵",
    "report.disclosed_at": "📆",
}

// Thank you ChatGPT
function reduceObject(input1, input2) {
    const reducedObject = {};
  
    Object.keys(input2).forEach(key => {
      // Access nested properties if key contains dot notation
      const value = key.split('.').reduce((obj, k) => obj && obj[k], input1);
      // Assign value to the key from input2
      reducedObject[input2[key]] = value;
    });
  
    return reducedObject;
  }

// Thank you ChatGPT
function objectToString(obj) {
  let result = '';
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result += `${key}: ${obj[key]}\n `;
    }
  }
  console.log(result);
  return result;
}

export class Logger {
    constructor(verbose) {
        this.verbose = verbose
    }
    info(message) {
        if (this.verbose) {
            console.log(`[+]: ${message}`);
        }
    }

    notifFormatter(message) {
        const messageObj = reduceObject(message, messageEmojis);
        return objectToString(messageObj)
    }
}

export async function sendNotification(message, channelID, botToken) {
    try {
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelID}&text=${encodeURIComponent(message)}`;

        console.log(`[+] Sending notification to telegram...`);

        const response = await got.get(apiUrl);

        if (response.statusCode === 200) {
            console.log('[+] Notification sent successfully!');
        } else {
            throw new Error(`[-] Failed to send notification. Status code: ${response}`);
        }
    } catch (error) {
        console.log(error);
        console.error('[-] Error sending notification: ', error.message);
    }
}

