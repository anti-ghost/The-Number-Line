/*
  The Number Line v1.0.0
  Copyright © 2022 resu deteleD
  Licensed under the MIT License
*/

(function(global) {
  "use strict";
  
  if (btoa(location.origin) != "aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pbw==") {
    document.getElementById("fake").style.display = "";
    return;
  }
  
  const DEBUG = location.href != "aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pby9UaGUtTnVtYmVyLUxpbmUv";
  
  const VERSION = "1.0.0";
  
  const Vue = global.Vue;
  
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
    exponentUnlocked: false
  };
  
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
    return D.pow(2, game.compressors.reduce((x, y) => D.add(x, y))).mul(t);
  }
  
  function getCompressCost(x) {
    let e = game.compressors[x - 1].add(1).mul(x);
    if (e.gt(12)) e = D.pow10(e.div(12).sub(1)).mul(12).div(D.ln(10)).add(12).sub(D.div(12, D.ln(10)));
    return D.pow10(e);
  }
  
  function getExponentGain(x = game.number) {
    return x.div(1e12).root(12).floor();
  }
  
  function format(number, f = 0) {
    number = D(number);
    if (number.isNaN()) {
      NaNalert();
      return "NaN";
    }
    if (number.sign == -1) return "-" + format(-number);
    if (!number.isFinite()) return "Infinity";
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
      return format(mantissa) + "e" + format(exponent, true);
    }
    if (number.lt(D.tetrate(10, 6))) {
      return "e" + format(number.log10());
    }
    return "10^^" + format(number.slog(), true);
  }
  
  function formatTime(time, f = 0) {
    time = D(time);
    if (D.isNaN(time)) {
      NaNalert();
      return "NaN seconds";
    }
    if (!D.isFinite(time)) return "forever";
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
  
  function loop(time) {
    if (!NaNerror && checkNaNs()) NaNalert();
    if (NaNerror) return;
    game.number = game.number.add(getNumberRate(time));
    if (game.number.gt(game.highestNumber)) game.highestNumber = game.number;
    if (!game.exponentUnlocked && game.number.gte(1e12)) game.exponentUnlocked = true;
  }
  
  function simulateTime(ms) {
    if (NaNerror) return;
    game.lastTick = Date.now();
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
      alert("Import failed, attempted to load development save into the main game.");
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
  
  function save() {
    if (NaNerror) return;
    localStorage.setItem(
      DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave",
      btoa(JSON.stringify(game))
    );
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
    if (DEBUG) {
      alert("Warning! This is a development save. You will not be able to import this save into the main game.");
    }
  }
  
  function hardReset() {
    if (prompt('Are you sure you want to reset your game? This cannot be undone! Type "reset" without quotation marks to reset your game.') === "reset") {
      localStorage.removeItem(DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave");
      location.reload();
    }
  }
  
  load();
  
  const app = Vue.createApp({
    data() {
      return {
        D,
        game,
        tab: 0,
        save,
        importSave,
        exportSave,
        hardReset,
        compress,
        timePlayed,
        getNumberRate,
        getCompressCost,
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
      game,
      newGame,
      NaNerror,
      NaNalert,
      checkNaNs,
      timePlayed,
      getNumberRate,
      getCompressCost,
      getExponentGain,
      format,
      formatTime,
      compress,
      exponentiate,
      reset,
      loop,
      simulateTime,
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
})(this);
