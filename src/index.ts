import express = require("express");
const bodyParser = require("body-parser");

const googlehome = require('google-home-notifier');
import superagent = require("superagent");

googlehome.device('Google Home'); // Change to your Google Home name
// or if you know your Google Home IP
// googlehome.ip('192.168.x.x');
googlehome.accent('ja'); // optional: 'us'= american voice (default), 'uk'= british voice
googlehome.notify("こんにちは", function(res) {
    console.log(res);
  });

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200);
    res.json({speech: "aaa"});
    res.end();
});

let context = "";
function kaiwa(text: string): Promise<string>{
    return new Promise<string>((resolve, reject) => {
        const token = process.env.DOCOMO_TOKEN;
        const url = `https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=${token}`;
        const post = superagent.post(url);
        post.send({
            "utt": text,
            "context": context,
            "nickname": "光",
            "nickname_y": "ヒカリ",
            "sex": "女",
            "bloodtype": "B",
            "birthdateY": "1997",
            "birthdateM": "5",
            "birthdateD": "30",
            "age": "16",
            "constellations": "双子座",
            "place": "東京",
            "mode": "dialog"
        });
        post.then((res) => {
            console.log(res.body);
            context = res.body.context;
            resolve(res.body.utt);
        }).catch(reject);
    });
}

app.post("/api/dialog", (req, res) => {
    console.log(req.body.result);
    if(req.body.result.resolvedQuery){
        const text = req.body.result.resolvedQuery;
        console.log(text);
        kaiwa(text)
            .then((reply)=>{
                res.status(200);
                res.json({speech: reply});
                res.end();
            }).catch((error)=>{
                console.error(error);
                res.status(200);
                res.json({speech: "リクエスト失敗したよ"});
                res.end();
            });

    }else{
        res.status(200);
        res.json({speech: "ええと"});
        res.end();
    }
});


app.post("/api/speech", (req, res) => {
    console.log(req.body);
    res.status(200);
    res.json({});
    res.end();

    const text = req.body.text as string;
    googlehome.notify(text, function(res) {
        console.log(res);
      });
});

app.listen(3000);
