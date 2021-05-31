const fs = require("fs");
const glob = require("glob");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const mediainfo = "c:\\bin\\MediaInfo_CLI_21.03_Windows_x64\\MediaInfo.exe --Output=JSON ";

if (!process.argv[2]) {
    console.log("Usage node index.js \"inputDir\"")
    return
}

const inputDir = process.argv[2]
console.log("Scanning directory [%s]", inputDir)

async function getMediaInfo(f) {
    //console.log("Processing file [%s]", f)

    const stdall = await exec(mediainfo + "\"" + f + "\"")
    // fs.writeFileSync(f + "_INFO.json", JSON.stringify(stdall, undefined, 4))
    const jsonMI = JSON.parse(stdall.stdout)
    const hasSRTSubExtFile = fs.existsSync(f.replace(".mkv", ".srt"))

    let hasSRTSub = false
    let srtTitle = "-"
    let srtLanguage = "-"

    jsonMI.media.track.forEach(function (trk) {
        if ("Text" == trk["@type"] && "en" == trk["Language"] && trk["CodecID"].indexOf("S_TEXT/" == 0)) {
            hasSRTSub = true

            srtTitle = trk["Title"]
            srtLanguage = trk["Language"]

            //console.log("File [%s], track [%s]", f, trk)

            return
        }
    })

    console.log("emb%s ext%s any%s bot%s [%s] [%s] [%s]",
        hasSRTSub ? "1" : "0",
        hasSRTSubExtFile ? "1" : "0",
        (hasSRTSub || hasSRTSubExtFile) ? "1" : "0",
        (hasSRTSub && hasSRTSubExtFile) ? "1" : "0",
        f, srtTitle, srtLanguage)
}

glob(inputDir + "/**/*.mkv", {}, async function (er, files) {
    // console.log(files)

    for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const r0 = await getMediaInfo(f)
    }

    // files.forEach(async function (f) {
    //     await getMediaInfo(f)
    // });

})


return

fs.readdirSync(inputDir).forEach(file => {
    console.log(file);
});
