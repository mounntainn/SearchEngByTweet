require('dotenv').config();
const express = require('express');
var Twitter = require('twitter');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const host = process.env.HOST;
const port = process.env.PORT;

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// space対応の為postに変更 
app.get('/', (req: any, res: any) => {
    var params = {
        q: req.query.words,
        lang: 'en',
        result_type: 'popular',
        count: 10,
        tweet_mode: 'extended',
        include_entities: false
    };
    
    console.log("requested words:", req.query.words);
    client.get('/search/tweets.json', params, (error: any, tweets: any, response: any) => {
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
        const texts = datas
        // res.send(datas);
            // .filter((x: any) => x.text.match(`/${query}/`))
            .map((x: any) => {
                // console.log(x);
                return {
                    name: x.user.name,
                    text: x.full_text
                };
            });
        res.send(texts);
    });
});

app.listen(port, () => console.log(`Successfully served app listening http://${host}:${port}`));