class Lexer {
  constructor() {
    this.tokens = [];
    this.idx = -1;
    this.input = null;
  }

  load(text) {
    this.input = text;

    const next = function () {
      return this.input[++this.idx];
    }.bind(this);
    const back = function () {
      return this.input[--this.idx];
    }.bind(this);
    const peek = function () {
      return this.input[this.idx + 1];
    }.bind(this);
    const last = function () {
      return this.input[this.idx - 1];
    }.bind(this);
    const current = function () {
      return this.input[this.idx];
    }.bind(this);

    function token(type, empty = false) {
      return {
        type,
        value: empty ? "" : current(),
      };
    }

    let temp;
    while (true) {
      next();
      if (/\s/.test(current())) {
        temp = token("whitespace");

        while (/\s/.test(next()) && current() !== "\n") {
          temp.value += current();
        }

        this.tokens.push(temp);
        temp = undefined;
      }

      if (current() === "[") {
        this.tokens.push(token("bracket_left"));
        temp = token("string", true);

        while (current() !== "\n") {
          next();

          if (current() === "\\") {
            if (peek() !== "\n") {
              temp.value += next();
              continue;
            }
          }

          if (current() === "]") {
            this.tokens.push(temp, token("bracket_right"));
            temp = undefined;
            break;
          }

          if (current() === " ") {
            next();
            if (current() === "v" && peek() === "]") {
              this.tokens.push(temp, token("bracket_right_closemenu"));
              temp = undefined;
              next();
              break;
            } else {
              back();
            }
          }

          temp.value += current();
        }
      }

      if (current() === "(") {
        this.tokens.push(token("parenthese_left"));
        temp = token("string", true);

        while (current() !== "\n") {
          next();

          if (current() === "\\") {
            if (peek() !== "\n") {
              temp.value += next();
              continue;
            }
          }

          if (current() === ")") {
            this.tokens.push(temp, token("parenthese_right"));
            temp = undefined;
            break;
          }

          if (current() === " ") {
            next();
            if (current() === "v" && peek() === ")") {
              this.tokens.push(temp, token("parenthese_right_closemenu"));
              temp = undefined;
              next();
              break;
            } else {
              back();
            }
          }

          temp.value += current();
        }
      }

      if (current() === "\n") {
        this.tokens.push(token("newline"));
      }

      if (current() === "@") {
        temp = token("label", true);
        while (current() !== "\n") {
          if (/\s/.test(peek())) {
            break;
          }

          next();

          temp.value += current();
        }

        this.tokens.push(temp);
        temp = undefined;
      }
    }
  }

  next() {
    return this.tokens[++this.idx];
  }

  peek() {
    return this.tokens[this.idx + 1];
  }

  get eoi() {
    return (
      this.line === this.lines.length - 1 &&
      this.lines[this.lines.length - 1][this.letter] ===
        this.lines[this.lines.length - 1][this.lines[this.lines.length - 1].length - 1]
    );
  }
}

export default Lexer;
