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











let twitterResult: any = [];












// todo: space対応の為postに変更 
app.get('/', (req: any, res: any, next: any) => {
    (async () => {
        console.log('start api.');
        
        if (!req.query.words) {
            console.log('words are required.');
            res.send('words are required.');
            return;
        }

        var params = {
            q: req.query.words,
            lang: 'en',
            result_type: 'popular',
            count: 10,
            tweet_mode: 'extended',
            include_entities: false
        };
        
        // const results = await getTweets(req, res, params);
        await getTweets(req, res, params);
        console.log(twitterResult);
        console.log('twitterResult');
        for (let result of twitterResult) {
            // console.log(result);
            result['jaText'] = await translate(result.text, 'en', 'ja');
        }
        res.send(twitterResult);

        console.log('end api.');
    })().catch(next);
});

app.listen(port, () => console.log(`Successfully served http://${host}:${port}`));


async function getTweets(req: any, res: any, params: any): Promise<any> {
    const twitterClient = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    console.log("requested words:", req.query.words);
    twitterClient.get('/search/tweets.json', params)
        .then((tweets: any, response: any) => {
            // if (error) {
            console.log(tweets);
            console.log(response);
            //     return;
            // }

            // if (response.statusCode !== 200) {
            //     console.log(response);
            //     console.log('response error');
            // }

            console.log("twitter api query:", params.q);
            
            const datas = tweets.statuses;
            for (let x of datas) {
                twitterResult.push(
                    {
                        name: x.user.name,
                        text: x.full_text
                    }
                );
            }
        });
}

async function translate(text: any, sourceLang: any, targetLang: any) {
    // console.log('tran');
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
    const reses = await translationClient.translateText(req);
    
    for (const res of reses) {
        if (res == null) {
            continue; // なぜかnullがレスポンスに含まれる
        }
        console.log(res);
        return res["translations"][0]["translatedText"];
    }
}
