const fs = require("fs");
const convert = require("xml-js");
const axios = require('axios')
const path = require('path')

let allErrors = [];

function main() {
    let rawXml = fs.readFileSync("input.xml",{encoding:'utf8'});
    const raw = convert.xml2js(rawXml, {compact: true});

    let items = raw.rss.channel.item;
    let allMetadata = [];

    for(var i=0; i<items.length; i++){
        let q = items[i];
        let info = {
            link: q.guid["_text"],
            dateModifiedGmt: q["wp:post_modified_gmt"]["_cdata"],
            wordpressId: q["wp:post_id"]["_text"],
            creator: q["dc:creator"]["_cdata"],
            name: q["wp:post_name"]["_cdata"],
            sort: i+1
        }
        info.ext = path.extname(info.link);
        info.fileName = `${info.wordpressId}-${info.name}${info.ext}`;

        downloadImage(info.link, `output/${info.fileName}`).then(console.log).catch(errorList(error));
        allMetadata.push(info)
    };

    fs.writeFileSync("output/metadata.json",JSON.stringify(allMetadata))
    fs.writeFileSync("output/errors.json",JSON.stringify(allErrors))
}

async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath));
    });
}

function errorList(error){
    allErrors.push(error);
}

main();