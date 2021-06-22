import Lexer from "./lexer/index";

let lexer = new Lexer();

const code = `
when flag clicked
move (15) steps
say [hel\]o]
`;

lexer.load(code);
