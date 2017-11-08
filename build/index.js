Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var googlehome = require('google-home-notifier');
var superagent = require("superagent");
googlehome.device('Google Home'); // Change to your Google Home name
// or if you know your Google Home IP
// googlehome.ip('192.168.x.x');
googlehome.accent('ja'); // optional: 'us'= american voice (default), 'uk'= british voice
googlehome.notify("こんにちは", function (res) {
    console.log(res);
});
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
    res.status(200);
    res.json({ speech: "aaa" });
    res.end();
});
var context = "";
function kaiwa(text) {
    return new Promise(function (resolve, reject) {
        // 50486f713564674a4a514c2f34726d2e4378374a6a726276326c7a526678414b4a682e7272775934676e44
        var token = "50486f713564674a4a514c2f34726d2e4378374a6a726276326c7a526678414b4a682e7272775934676e44";
        var url = "https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=" + token;
        var post = superagent.post(url);
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
app.post("/api/speech", function (req, res) {
    console.log(req.body);
    res.status(200);
    res.json({});
    res.end();
    var text = req.body.text;
    googlehome.notify(text, function (res) {
        console.log(res);
    });
});
app.listen(3000);
