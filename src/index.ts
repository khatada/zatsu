"use strict"

import express = require("express");
import bodyParser = require("body-parser");
import superagent = require("superagent");
import HttpsProxyAgent = require("https-proxy-agent");

const proxy = process.env.http_proxy;
const agent = new HttpsProxyAgent(proxy);
const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200);
    res.json({speech: `zatsu is running. port=${port}`});
    res.end();
});

let context = "";
function kaiwa(text: string): Promise<string>{
    return new Promise<string>((resolve, reject) => {
        const token = process.env.DOCOMO_TOKEN;
        const url = `https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=${token}`;
        const post = superagent.post(url);
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

app.listen(port);
