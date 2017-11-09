"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var superagent = require("superagent");
var HttpsProxyAgent = require("https-proxy-agent");
var proxy = process.env.http_proxy;
var agent = new HttpsProxyAgent(proxy);
var port = 3000;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
    res.status(200);
    res.json({ speech: "zatsu is running. port=" + port });
    res.end();
});
var context = "";
function kaiwa(text) {
    return new Promise(function (resolve, reject) {
        var token = process.env.DOCOMO_TOKEN;
        var url = "https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=" + token;
        var post = superagent.post(url);
        post.agent(agent);
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
        post.then(function (res) {
            console.log(res.body);
            context = res.body.context;
            resolve(res.body.utt);
        }).catch(reject);
    });
}
app.post("/api/dialog", function (req, res) {
    console.log(req.body.result);
    if (req.body.result.resolvedQuery) {
        var text = req.body.result.resolvedQuery;
        console.log(text);
        kaiwa(text)
            .then(function (reply) {
            res.status(200);
            res.json({ speech: reply });
            res.end();
        }).catch(function (error) {
            console.error(error);
            res.status(200);
            res.json({ speech: "リクエスト失敗したよ" });
            res.end();
        });
    }
    else {
        res.status(200);
        res.json({ speech: "ええと" });
        res.end();
    }
});
app.listen(port);
