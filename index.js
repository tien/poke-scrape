const regrest = require("regrest").default;
const fs = require("fs");
const cheerio = require("cheerio");
const url = {
  moves: "https://bulbapedia.bulbagarden.net/wiki/List_of_moves",
  baseImageUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/",
};

function outputToJSON(json, path) {
  const data = JSON.stringify(json);
  fs.writeFile(path, data, "utf8", (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

(async () => {
  regrest
    .get("https://pokeapi.co/api/v2/pokemon/")
    .then(({ json: { count } }) =>
      regrest
        .get(`https://pokeapi.co/api/v2/pokemon/?limit=${count}&offset=0`)
        .then(({ json: { results: pokemons } }) =>
          outputToJSON(
            {
              count,
              pokemons: pokemons.map((pokemon, index) => {
                const id = parseInt(pokemon.url.split("/").slice(-2)[0]);
                return {
                  ...pokemon,
                  id,
                  imageUrl: `${url.baseImageUrl}${id}.png`,
                };
              }),
            },
            "pokemons.json"
          )
        )
    );

  const movesSite = await regrest.get(url.moves).then((res) => res.text);
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
