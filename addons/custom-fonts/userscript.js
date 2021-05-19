export default async function ({ addon, console }) {
  await addon.tab.loadScript(`${addon.self.lib}/thirdparty/cs/webfont.js`);

  const options = [
    ["navfnt", "nav"],
    ["blockfnt", "blocks"],
    ["headfnt", "header"],
    ["mainfnt", "main"],
    ["editfnt", "editor"],
  ]

  let enabled = true;

  let styles = [];

  function disable() {
    enabled = false;
    styles = styles.map(function (style) {
      let temp = style.cloneNode(true);
      style.remove();
      return temp;
    });
  }

  function enable() {
    enabled = true;
    styles = styles.map(function (style) {
      return document.head.appendChild(style);
    })
  }

  addon.self.addEventListener("disabled", disable);

  addon.self.addEventListener("reenabled", enable);

  let templates = {
    nav: '#navigation, [class*="menu-bar_menu-bar"], #topnav { %1 }',
    blocks: '.blocklyText, .blocklyHtmlInput, .scratchCommentBody, .scratchCommentText, .scratchblocks text  { %1 }',
    header: '.box-header { %1 }',
    main: '.box-content, .project-title, .comment, .button, .preview-row { %1 }',
    editor: '.scratchCategoryMenu, [role="tablist"], [class*="loader"], [class*="sprite-selector_sprite-selector"] *, [class*="target-pane_stage-selector-wrapper"] *, .pos-container > span, [class*="asset-panel_wrapper"] *:not(svg *) { %1 }'
  };

  let defSpacing =  getWidth();

   load(true);

  addon.settings.addEventListener("change", () => load());

  async function load(init = false) {

    let fonts = options.map(([id, nme]) => addon.settings.get(id).trim());

    let needsLoad = fonts.filter((fnt) => !document.fonts.check(`12px ${fnt}`) && fnt.toLowerCase() !== "helvetica");

    if (needsLoad.length >0) {
      await new Promise(function (resolve) {
        WebFont.load({
          google: {
            families: needsLoad
          },
          active: resolve,
          fontinactive: resolve //Font failed, but we don't want to throw an error.
        });
      });
    }

    for (let [id, nme] of options) {
      let s = nme === "blocks" ? await calcSpacing(addon.settings.get(id).trim()) : 0;
      if (init) {
        addStyle(createStyle(styleFromTemplate(templates[nme],`font-family: ${addon.settings.get(id)}; letter-spacing: ${s}px;`), { id: `sa-custom-${nme}-font` }));
      } else {
        updateStyle(`sa-custom-${nme}-font`, styleFromTemplate(templates[nme],`font-family: ${addon.settings.get(id)}; letter-spacing: ${s}px;`))
      }
    }
  };

  function styleFromTemplate(template, ...args) {
    let matches = template.match(/\%([0-9]+)/g);
    matches.forEach((m) => {
      template = template.replace(m, args[m.replace("%", "") - 1]);
    });
    return template;
  }

  function createStyle(text, o) {
    let s = document.createElement("style");
    for (let option in o) {
      s[option] = o[option];
    }
    s.innerHTML = text;
    return s;
  }

  function addStyle(s) {
    document.head.appendChild(s);
    styles.push(s);
    return s;
  }

  function updateStyle(id, text) {
    return styles.filter(style => style.id === id)[0].innerHTML = text;
  }

  function getWidth() {
    let chars = "mmmmmmmmmmlli";
    let p = document.createElement("p");
    p.classList.add("blocklyText");
    p.style.opacity = "0"
    p.innerHTML = chars;
    p.style.letterSpacing = 0;
    p.style.position = "absolute";
    document.body.appendChild(p);
    let w = p.clientWidth;
    p.remove();
    return w / chars.length;
  }

  async function calcSpacing(font) {
    let styl = createStyle(styleFromTemplate(templates.blocks, `font-family: ${font} !important`), {
      id: "sa-custom-font-test"
    });
    document.head.appendChild(styl);
    await new Promise(resolve => {
      styl.addEventListener("load", resolve);
    })
    let spacing = getWidth();
    let diff = spacing - defSpacing;
    console.log(document.fonts.check(`12px ${font}`))
    //styl.remove();
    if (diff > 0) {
      return -diff * 1.25;
    }
    return -diff * 1;
  }
}