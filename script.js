/*
  The Number Line v1.1.0
  Copyright © 2022 resu deteleD
  Licensed under the MIT License
*/

(function(global) {
  "use strict";
  
  if (
    btoa(location.origin) != "aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pbw==" &&
    btoa(location.origin) != "aHR0cHM6Ly9yYXcuZ2l0aGFjay5jb20=" &&
    btoa(location.origin) != "aHR0cHM6Ly9yYXdjZG4uZ2l0aGFjay5jb20="
  ) {
    document.getElementById("fake").style.display = "";
    return;
  }
  
  const DEBUG = btoa(location.href) != "aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pby9UaGUtTnVtYmVyLUxpbmUv";
  
  const VERSION = "1.1.0";
  
  const Vue = global.Vue;
  
  const $ = global.$;
  
  const D = global.Decimal;
  
  const game = Vue.reactive({});  
  
  const newGame = {
    debug: DEBUG,
    version: VERSION,
    timeStarted: Date.now(),
    lastTick: Date.now(),
    offlineProg: true,
    number: D(0),
    highestNumber: D(0),
    compressors: [
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0)
    ],
    expUnlocked: false,
    exponents: D(0),
    upgrades: [],
    autobuyers: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true
    ],
    challenge: 0,
    chalComp: [],
    chalConf: true,
    expOnChal: true
  };
  
  const UPGRADE_COSTS = [D(1), D(2), D(3), D(10)];
  
  const CHALLENGE_GOALS = [D(1e12)];
  
  const tabs = Vue.reactive({
    tab: 0,
    expSubtab: 0
  });
  
  let NaNerror = false;
  
  function NaNalert() {
    NaNerror = true;
    copyStringToClipboard(btoa(JSON.stringify(game)));
    alert(
      "We have detected a NaN in your save! We have exported it to your clipboard (although it might be broken). " +
      "Please report this save to the developers of The Number Line, so they can look into it."
    );
  }
  
  function checkNaNs(obj = game) {
    for (const i in obj) {
      if (typeof obj[i] == "object" && obj[i] !== obj && checkNaNs(obj[i])) return true;
      if (Number.isNaN(obj[i])) return true;
    }
    return false;
  }
  
  function timePlayed() {
    return Date.now() - game.timeStarted;
  }
  
  function getNumberRate(t = 1) {
    let rate = D.pow(2, game.compressors.reduce((x, y) => x.add(y)));
    if (game.upgrades.includes(1)) rate = rate.mul(game.compressors.reduce((x, y) => x.add(y)).add(1));
    if (game.upgrades.includes(3)) rate = rate.mul(game.exponents.add(1).sqrt());
    return rate.mul(t);
  }
  
  function getCompressCost(x) {
    let e = game.compressors[x - 1].add(1).mul(x);
    if (game.chalComp.includes(1)) e = e.div(2);
    if (inChal(1)) e = e.add(12);
    if (e.gt(12)) e = D.pow10(e.div(12).sub(1)).mul(12).div(D.ln(10)).add(12).sub(D.div(12, D.ln(10)));
    if (inChal(1)) e = e.sub(12);
    return D.pow10(e);
  }
  
  function canCompress(x) {
    return game.number.gte(getCompressCost(x));
  }
  
  function getExponentGain(x = game.number) {
    return x.div(1e12).root(12).floor();
  }
  
  function getNextExponent(x = game.number) {
    return getExponentGain(x).add(1).mul(10).pow(12);
  }
  
  function canUpgrade(x) {
    return (x == 1 || game.upgrades.includes(x - 2)) && game.exponents.gte(UPGRADE_COSTS[x - 1]);
  }
  
  function inChal(x) {
    return game.challenge == x;
  }
  
  function format(number, f = 0) {
    number = D(number);
    if (number.isNaN()) {
      NaNalert();
      return "NaN";
    }
    if (number.sign == -1) return "-" + format(number.neg());
    if (number.eq(Infinity)) return "Infinity";
    if (number.sign == 0) return "0";
    if (number.lt(1000)) return number.toNumber().toFixed(f);
    if (number.lt(1e6)) return number.toNumber().toFixed(0);
    if (number.lt("e1e6")) {
      let exponent = number.e;
      let mantissa = number.m;
      if (format(mantissa, 3) === "10.000") {
        mantissa = 1;
        exponent++;
      }
      return format(mantissa, 3) + "e" + format(exponent);
    }
    if (number.lt(D.tetrate(10, 6))) {
      return "e" + format(number.log10());
    }
    return "10^^" + format(number.slog());
  }
  
  function formatTime(time, f = 0) {
    time = D(time);
    if (time.isNaN()) {
      NaNalert();
      return "NaN seconds";
    }
    if (time.eq(Infinity)) return "forever";
    if (time.lt(60)) return format(time, f) + " seconds";
    if (time.lt(3600)) return format(time.div(60).floor()) + " minutes " +
      format(time.sub(time.div(60).floor().mul(60)), f) + " seconds";
    if (time.lt(86400)) return format(time.div(3600).floor()) + " hours " +
      format(time.div(60).floor().sub(time.div(3600).floor().mul(60))) + " minutes " +
      format(time.sub(time.div(60).floor().mul(60)), f) + " seconds";
    if (time.lt(31536000)) return format(time.div(86400).floor()) + " days " +
      format(time.div(3600).floor().sub(time.div(86400).floor().mul(24))) + " hours " +
      format(time.div(60).floor().sub(time.div(3600).floor().mul(60))) + " minutes";
    if (time.lt(31536000000)) return format(time.div(31536000).floor()) + " years " +
      format(time.div(86400).floor().sub(time.div(31536000).floor().mul(365))) + " days";
    return format(time.div(31536000)) + " years";
  }
  
  function onOff(x) {
    return x ? "ON" : "OFF";
  }
  
  function enableDisable(x) {
    return x ? "Disable" : "Enable";
  }
  
  function buyMax(x) {
    if (!inChal(1) && game.number.lt(1e12 ** (1 + game.chalComp.includes(1)))) {
      const c = D.affordGeometricSeries(
        game.number,
        10 ** (x / (1 + game.chalComp.includes(1))),
        10 ** (x / (1 + game.chalComp.includes(1))),
        game.compressors[x - 1]
      ),
        n = D.sumGeometricSeries(
          c,
          10 ** (x / (1 + game.chalComp.includes(1))),
          10 ** (x / (1 + game.chalComp.includes(1))),
          game.compressors[x - 1]
        );
      game.compressors[x - 1] = game.compressors[x - 1].add(c);
      game.number = game.number.sub(n);
    } else while (canCompress(x)) compress(x);
  }
  
  function resetCompressors() {
    game.number = D(0);
    game.compressors = [
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0),
      D(0)
    ];
  }
  
  function compress(x) {
    if (canCompress(x)) {
      game.number = game.number.sub(getCompressCost(x));
      game.compressors[x - 1] = game.compressors[x - 1].add(1);
    }
  }
  
  function exponentiate() {
    if (game.challenge > 0) {
      if (!game.chalComp.includes(game.challenge) && game.number.gte(CHALLENGE_GOALS[game.challenge - 1])) game.chalComp.push(game.challenge);
      game.challenge = 0;
      resetCompressors();
    } else if (game.number.gte(1e12)) {
      game.expUnlocked = true;
      game.exponents = game.exponents.add(getExponentGain());
      resetCompressors();
    }
  }
  
  function upgrade(x) {
    if (canUpgrade(x)) {
      if (x % 4 > 0) game.exponents = game.exponents.sub(UPGRADE_COSTS[x - 1]);
      game.upgrades.push(x);
    }
  }
  
  function enableAutobuyers() {
    for (let i = 0; i < 10; i++) game.autobuyers[i] = true;
  }
  
  function disableAutobuyers() {
    for (let i = 0; i < 10; i++) game.autobuyers[i] = false;
  }
  
  function enterChal(x) {
    if (
      !game.chalConf ||
      confirm("Entering a challenge will perform an Exponent reset. You will need to reach a certain number inside the challenge to complete the challenge.")
    ) {
      if (game.expOnChal) game.exponents = game.exponents.add(getExponentGain());
      resetCompressors();
      game.challenge = x;
    }
  }
  
  function buyMax(x) {
    if (game.number.lt(1e12)) {
      const c = D.affordGeometricSeries(game.number, 10 ** x, 10 ** x, game.compressors[x - 1]),
      n = D.sumGeometricSeries(c, 10 ** x, 10 ** x, game.compressors[x - 1]);
      game.compressors[x - 1] = game.compressors[x - 1].add(c);
      game.number = game.number.sub(n);
    } else while (canCompress(x)) compress(x);
  }
  
  function loop(time) {
    if (!NaNerror && checkNaNs()) NaNalert();
    if (NaNerror) return;
    game.number = game.number.add(getNumberRate(time));
    if (game.number.gt(game.highestNumber)) game.highestNumber = game.number;
    if (game.upgrades.includes(2)) {
      for (let i = 0; i < 10; i++) {
        if (game.autobuyers[i]) buyMax(i + 1);
      }
    }
  }
  
  function simulateTime(ms) {
    if (NaNerror) return;
    game.lastTick = Date.now();
    if (DEBUG) ms *= dev.speed;
    for (let i = 0; i < 10; i++) {
      loop(ms / 10000);
    }
  }
  
  function transformSaveToDecimal() {
    game.number = D(game.number);
    game.highestNumber = D(game.highestNumber);
    for (let i = 0; i < 10; i++) game.compressors[i] = D(game.compressors[i]);
    game.exponents = D(game.exponents);
  }
  
  function reset(obj = newGame) {
    for (const i in obj) {
      game[i] = obj[i];
    }
  }
  
  function loadGame(loadgame) {
    if (loadgame.debug && !DEBUG) {
      $.notify("Import failed, attempted to load development save into the main game.", "error");
      return;
    }
    reset();
    for (const i in loadgame) {
      game[i] = loadgame[i];
    }
    game.debug = DEBUG;
    game.version = VERSION;
    transformSaveToDecimal();
    const diff = Date.now() - game.lastTick;
    console.log(diff);
    if (game.offlineProg) {
      simulateTime(diff, true);
    }
  }
  
  function save(auto = false) {
    if (NaNerror) {
      if (auto) $.notify("Save failed, attempted to save a broken game", "error");
      return;
    }
    localStorage.setItem(
      DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave",
      btoa(JSON.stringify(game))
    );
    if (auto) $.notify("Game saved", "success");
  }
  
  function load() {
    reset();
    if (localStorage.getItem(DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave") !== null) {
      loadGame(JSON.parse(atob(localStorage.getItem(DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave"))));
    }
    setInterval(() => simulateTime(Date.now() - game.lastTick), 0);
    setInterval(() => save(), 5000);
  }
  
  function copyStringToClipboard(str) {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
  
  function importSave() {
    try {
      const txt = prompt("Copy-paste your save. WARNING: WILL OVERWRITE YOUR SAVE");
      loadGame(JSON.parse(atob(txt)));
      save();
    } catch (e) {
      if (DEBUG) console.log(e);
    }
  }
  
  function exportSave() {
    copyStringToClipboard(btoa(JSON.stringify(game)));
    $.notify("Copied to clipboard", "success");
    if (DEBUG) {
      $.notify("Warning! This is a development save. You will not be able to import this save into the main game.", "warn");
    }
  }
  
  function hardReset() {
    if (prompt('Are you sure you want to reset your game? This cannot be undone! Type "reset" without quotation marks to reset your game.') === "reset") {
      localStorage.removeItem(DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave");
      location.reload();
    }
  }
  
  const app = Vue.createApp({
    data() {
      return dev;
    }
  });
  
  const dev = {
    $,
    D,
    VERSION,
    DEBUG,
    speed: 1,
    game,
    newGame,
    UPGRADE_COSTS,
    CHALLENGE_GOALS,
    tabs,
    NaNerror,
    NaNalert,
    checkNaNs,
    timePlayed,
    getNumberRate,
    getCompressCost,
    canCompress,
    getExponentGain,
    getNextExponent,
    canUpgrade,
    inChal,
    format,
    formatTime,
    onOff,
    enableDisable,
    buyMax,
    resetCompressors,
    compress,
    exponentiate,
    upgrade,
    enableAutobuyers,
    disableAutobuyers,
    enterChal,
    loop,
    simulateTime,
    reset,
    loadGame,
    save,
    load,
    copyStringToClipboard,
    importSave,
    exportSave,
    hardReset,
    app
  };
  
  if (DEBUG) {
    global.dev = dev;
    global.app = app;
  }
  
  load();
  
  Object.defineProperty(global, "DEBUG", { value: DEBUG });
  Object.defineProperty(global, "VERSION", { value: VERSION });
  
  app.mount("#app");
  
  document.getElementById("app").style.display = "";
})(this);
