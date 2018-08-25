const regrest = require("regrest");
const fs = require("fs");
const cheerio = require("cheerio");
const url = {
  moves: "https://bulbapedia.bulbagarden.net/wiki/List_of_moves"
};

function outputToJSON(json, path) {
  const data = JSON.stringify(json);
  fs.writeFile(path, data, "utf8", err => {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

(async () => {
  const movesSite = await regrest.get(url.moves).then(res => res.text);
  const $ = cheerio.load(movesSite);
  const result = {};
  const rows = $("table.sortable > tbody > tr > td > table > tbody > tr");
  rows.each((i, row) => {
    let tempName;
    const attr = {};
    $(row)
      .find("td")
      .each((index, value) => {
        const textValue = $(value)
          .text()
          .trim()
          .toLowerCase()
          .replace("*", "")
          .replace(/\s+/g, "-");
        switch (index) {
          case 1:
            tempName = textValue;
            break;
          case 2:
            attr.type = textValue;
            break;
          case 3:
            attr.category = textValue;
            break;
          case 4:
            attr.contest = textValue;
            break;
          case 5:
            attr.pp = textValue;
            break;
          case 6:
            attr.power = textValue;
            break;
          case 7:
            attr.accuracy = textValue;
            break;
          case 8:
            attr.gen = textValue;
            break;
        }
      });
    result[tempName] = attr;
  });
  outputToJSON(result, "moves.json");
})();
