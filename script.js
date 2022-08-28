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
  
  const DEBUG = true;
  
  const VERSION = "1.0.0";
  
  const Vue = global.Vue;
  
  const D = Decimal;
  
  const game = Vue.reactive({});  
  
  const newGame = {
    version: VERSION,
    timeStarted: Date.now(),
    lastTick: Date.now(),
    offlineProg: true,
    highestNumber: 0,
    number: 0,
    compressors: [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  };
  
  let NaNerror = false;
  
  function NaNalert() {
    NaNerror = true;
    exportSave();
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
    return 2 ** game.compressors.reduce((x, y) => x + y) * t;
  }
  
  function getCompressCost(x) {
    return 10 ** (x * (game.compressors[x - 1] + 1));
  }
  
  function format(number, int = false) {
    if (isNaN(number)) {
      NaNalert();
      return "NaN";
    }
    if (number < 0) return "-" + format(-number);
    if (number == Infinity) return "Infinity";
    if (int && number < 999999.5) return number.toFixed(0);
    if (number <= 9.9995) number.toFixed(3);
    if (number < 1000) return number.toPrecision(4);
    if (number < 999999.5) return number.toFixed(0);
    let exponent = Math.floor(Math.log10(number));
    let mantissa = number / 10 ** exponent;
    if (format(mantissa) === "10.00") {
      mantissa = 1;
      exponent++;
    }
    return format(mantissa) + "e" + exponent.toFixed(0);
  }
  
  function formatTime(time, int = false) {
    if (time == Infinity) return "forever";
    if (time < 60) return format(time, int) + " seconds";
    if (time < 3600) return format(Math.floor(time / 60), true) + " minutes " +
      format(time % 60, int) + " seconds";
    if (time < 86400) return format(Math.floor(time / 3600), true) + " hours " +
      format(Math.floor(time / 60) % 60, true) + " minutes " +
      format(time % 60, int) + " seconds";
    if (time < 31536000) return format(Math.floor(time / 86400), true) + " days " +
      format(Math.floor(time / 3600) % 24, true) + " hours " +
      format(Math.floor(time / 60) % 60, true) + " minutes";
    if (time < 31536000000) return format(Math.floor(time / 31536000), true) + " years " +
      format(Math.floor(time / 86400) % 365, true) + " days";
    return format(time / 31536000) + " years";
  }
  
  function compress(x) {
    if (game.number >= getCompressCost(x)) {
      game.number -= getCompressCost(x);
      game.compressors[x - 1]++;
    }
  }
  
  function reset(obj = newGame) {
    for (const i in obj) {
      game[i] = obj[i];
    }
  }
  
  function loop(time) {
    if (!NaNerror && checkNaNs()) NaNalert();
    if (NaNerror) return;
    game.number += getNumberRate(time);
    game.highestNumber = Math.max(game.number, game.highestNumber);
  }
  
  function simulateTime(ms) {
    if (NaNerror) return;
    game.lastTick = Date.now();
    for (let i = 0; i < 10; i++) {
      loop(ms / 10000);
    }
  }
  
  function save() {
    if (NaNerror) return;
    localStorage.setItem("TheNumberLineSave", btoa(JSON.stringify(game)));
  }
  
  function loadGame(loadgame) {
    for (const i in loadgame) {
      game[i] = loadgame[i];
    }
    game.version = VERSION;
    const diff = Date.now() - game.lastTick;
    console.log(diff);
    if (game.offlineProg) {
      simulateTime(diff, true);
    }
  }
  
  function load() {
    reset();
    if (localStorage.getItem("TheNumberLineSave") !== null) {
      loadGame(JSON.parse(atob(localStorage.getItem("TheNumberLineSave"))));
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
  }
  
  function hardReset() {
    if (prompt('Are you sure you want to reset your game? This cannot be undone! Type "reset" without quotation marks to reset your game.') === "reset") {
      localStorage.removeItem("TheNumberLineSave");
      location.reload();
    }
  }
  
  load();
  
  const app = Vue.createApp({
    data() {
      return {
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
      format,
      formatTime,
      compress,
      reset,
      loop,
      simulateTime,
      save,
      loadGame,
      load,
      copyStringToClipboard,
      importSave,
      exportSave,
      hardReset,
      app
    };
  }
})(this);
