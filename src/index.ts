require('dotenv').config();
const express = require('express');
const Twitter = require('twitter');
const { TranslationServiceClient } = require("@google-cloud/translate").v3;

const app = express();
const host = process.env.HOST;
const port = process.env.PORT;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// space対応の為postに変更 
app.get('/', async (req: any, res: any) => {
    var params = {
        q: req.query.words,
        lang: 'en',
        result_type: 'popular',
        count: 10,
        tweet_mode: 'extended',
        include_entities: false
    };
    
    const results = await getTweets(req, res, params);
    // console.log(results);
    for (let result of results) {
        // console.log(result);
        result['jaText'] = await translate(result.text, 'en', 'ja');
    }
    res.send(results);
});

app.listen(port, () => console.log(`Successfully served app listening http://${host}:${port}`));

let twitterResult: any = [];    
async function getTweets(req: any, res: any, params: any): Promise<any> {
    const twitterClient = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    console.log("requested words:", req.query.words);
    await twitterClient.get('/search/tweets.json', params, (error: any, tweets: any, response: any) => {
        if (error) {
            console.log(error);
            return;
        }

        if (response.statusCode !== 200) {
            console.log(response);
            console.log('response error');
        }

        console.log("twitter api query:", params.q);
        
        const datas = tweets.statuses;
        const results = datas
            // .filter((x: any) => x.text.match(`/${query}/`))
            .map((x: any) => {
                // console.log(x);
                return {
                    name: x.user.name,
                    text: x.full_text
                };
            });
        twitterResult = results;
        // console.log(twitterResult);
        // console.log(results);
    });

    // console.log(twitterResult);
    return twitterResult;
}

async function translate(text: any, sourceLang: any, targetLang: any) {
    const apiKey = process.env.GCP_TRANSLATE_API_KEY;
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;

    const translationClient = new TranslationServiceClient({key: apiKey});
    const req = {
        parent: translationClient.locationPath(projectId, location),
        contents: [text],
        mimeType: "text/plain",
        sourceLanguageCode: sourceLang,
        targetLanguageCode: targetLang,
    };
    const res = await translationClient.translateText(req);
    for (const elem of res) {
        if (elem == null) // なぜかnullがレスポンスに含まれる
            continue;
        return elem["translations"][0]["translatedText"];
    }
}