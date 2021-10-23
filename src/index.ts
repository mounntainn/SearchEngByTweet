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

const query = '"get out of here"'; 
app.get('/', (req: any, res: any) => {
    var params = {
        q: query,
        lang: 'en',
        result_type: 'popular',
        count: 10
    };
    client.get('/search/tweets.json', params, (error: any, tweets: any, response: any) => {
        if (error) {
            console.log(error);
            return;
        }
        if (response.statusCode !== 200) {
            console.log(response);
            console.log('response error');
        }

        console.log(query);
        // res.send(tweets);
        const datas = tweets.statuses;
        const texts = datas
            // .filter((x: any) => x.text.match(`/${query}/`))
            .map((x: any) => x.text);
        res.send(texts);
    });
});

app.listen(port, () => console.log(`Successfully served app listening http://${host}:${port}`));