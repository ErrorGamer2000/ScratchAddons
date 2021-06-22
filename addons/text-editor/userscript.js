import Parser from "./parser/index.js";

const code = `
when flag clicked
move (15) steps
say [hel\]o]
`;

const parser = new Parser();

const parsed = parser.parse(code);

console.log(parsed);
