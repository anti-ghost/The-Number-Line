/*
  The Number Line v1.0.0
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
  
  const DEBUG = location.href != "aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pby9UaGUtTnVtYmVyLUxpbmUv";
  
  const VERSION = "1.0.0";
  
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
    ]
  };
  
  const UPGRADE_COSTS = [D(1), D(2), D(3), D(Infinity)];
  
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
    if (e.gt(12)) e = D.pow10(e.div(12).sub(1)).mul(12).div(D.ln(10)).add(12).sub(D.div(12, D.ln(10)));
    return D.pow10(e);
  }
  
  function canCompress(x) {
    return game.number.gte(getCompressCost(x));
  }
  
  function getExponentGain(x = game.number) {
    return x.div(1e12).root(12).floor();
  }
  
  function canUpgrade(x) {
    return game.exponents.gte(UPGRADE_COSTS[x - 1]);
  }
  
  function format(number, f = 0) {
    number = D(number);
    if (number.isNaN()) {
      NaNalert();
      return "NaN";
    }
    if (number.sign == -1) return "-" + format(-number);
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
      return format(mantissa) + "e" + format(exponent);
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
    if (time.lt(3600)) return format(time.div(60).floor(), true) + " minutes " +
      format(time.sub(time.div(60).floor().mul(60)), f) + " seconds";
    if (time.lt(86400)) return format(time.div(3600).floor(), true) + " hours " +
      format(time.div(60).floor().sub(time.div(3600).floor().mul(60)), true) + " minutes " +
      format(time.sub(time.div(60).floor().mul(60)), f) + " seconds";
    if (time.lt(31536000)) return format(time.div(86400).floor(), true) + " days " +
      format(time.div(3600).floor().sub(time.div(86400).floor().mul(24)), true) + " hours " +
      format(time.div(60).floor().sub(time.div(3600).floor().mul(60)), true) + " minutes";
    if (time.lt(31536000000)) return format(time.div(31536000).floor(), true) + " years " +
      format(time.div(86400).floor().sub(time.div(31536000).floor().mul(365)), true) + " days";
    return format(time.div(31536000)) + " years";
  }
  
  function compress(x) {
    if (game.number.gte(getCompressCost(x))) {
      game.number = game.number.sub(getCompressCost(x));
      game.compressors[x - 1] = game.compressors[x - 1].add(1);
    }
  }
  
  function exponentiate() {
    if (game.number.gte(1e12)) {
      game.expUnlocked = true;
      game.exponents = game.exponents.add(getExponentGain());
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
  }
  
  function upgrade(x) {
    if (canUpgrade(x)) {
      game.exponents = game.exponents.sub(UPGRADE_COSTS[x - 1]);
      game.upgrades.push(x);
    }
  }
  
  function onOff(x) {
    return x ? "ON" : "OFF";
  }
  
  function enableDisable(x) {
    return x ? "Disable" : "Enable";
  }
  
  function enableAutobuyers() {
    for (let i = 0; i < 10; i++) game.autobuyers[i] = true;
  }
  
  function disableAutobuyers() {
    for (let i = 0; i < 10; i++) game.autobuyers[i] = false;
  }
  
  function buyMax(x) {
    const c = game.compressors[x - 1]
      .add(D.affordGeometricSeries(game.number, 10 ** x, 10 ** x, game.compressors[x - 1]))
      .min(12 / x)
      .floor(),
      n = D.sumGeometricSeries(c.sub(game.compressors[x - 1]), 10 ** x, 10 ** x, game.compressors[x - 1]);
    game.compressors[x - 1] = c;
    game.number = game.number.sub(n);
    while (canCompress(x)) compress(x);
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
      location.reload();
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
      return {
        $,
        D,
        game,
        tabs,
        save,
        importSave,
        exportSave,
        hardReset,
        compress,
        exponentiate,
        upgrade,
        onOff,
        enableDisable,
        enableAutobuyers,
        disableAutobuyers,
        timePlayed,
        getNumberRate,
        getCompressCost,
        canCompress,
        canUpgrade,
        format,
        formatTime
      };
    }
  });
  
  app.mount("#app");
  
  document.getElementById("app").style.display = "";
  
  Object.defineProperty(global, "DEBUG", { value: DEBUG });
  Object.defineProperty(global, "VERSION", { value: VERSION });
  
  if (DEBUG) {
    global.dev = {
      speed: 1,
      game,
      newGame,
      UPGRADE_COSTS,
      tabs,
      NaNerror,
      NaNalert,
      checkNaNs,
      timePlayed,
      getNumberRate,
      getCompressCost,
      canCompress,
      getExponentGain,
      canUpgrade,
      format,
      formatTime,
      compress,
      exponentiate,
      upgrade,
      onOff,
      enableDisable,
      enableAutobuyers,
      disableAutobuyers,
      buyMax,
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
  }  
  
  load();
})(this);
