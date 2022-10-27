(function(global) {
  "use strict";
  
  // Check if the URL is trusted by The Number Line
  if (
    btoa(location.origin) != "aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pbw==" &&
    btoa(location.origin) != "aHR0cHM6Ly9yYXcuZ2l0aGFjay5jb20=" &&
    btoa(location.origin) != "aHR0cHM6Ly9yYXdjZG4uZ2l0aGFjay5jb20="
  ) {
    document.getElementById("fake").style.display = "";
    return;
  }
  
  // DEBUG is true in development environments, false otherwise
  // Change this to false when deploying for production
  const DEBUG = true;
  
  const VERSION = "1.3.0";
  
  // Import global variables into function scope
  const Vue = global.Vue,
    $ = global.$,
    D = global.Decimal;
  
  // Variables
  
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
    expOnChal: true,
    matter: D(0),
    matterEnabled: false,
    matterUpgrades: [D(0), D(0), D(0)],
    blackHole: D(0),
    darkEnergy: D(0)
  };
  
  const UPGRADE_COSTS = [
    D(1),
    D(2),
    D(3),
    D(10),
    D(20),
    D(50),
    D(500),
    D(10000),
    D(1e6),
    D(1e7),
    D(1e8),
    D(1e9),
    D(1e10),
    D(1e12),
    D(1e20),
    D(Infinity)
  ];
  
  const CHALLENGE_GOALS = [D(1e12), D(1e20), D(1e16), D(1e18), D(1e52), D(1e100)];
  
  const MATTER_UPGRADE_COSTS = [D(1e5), D(1e3), D(1e9)];
  
  const tabs = Vue.reactive({
    tab: 0,
    expSubtab: 0
  });
  
  let NaNerror = false;
  
  let looping = false;
  
  // NaN-checking functions
  
  function NaNalert() {
    if (NaNerror) return;
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
  
  // Functions that do not change the game save
  
  function timePlayed() {
    return Date.now() - game.timeStarted;
  }
  
  function getNumberRate(t = 1) {
    let rate = D.pow(getCompressorBase(), getTotalCompressors().add(10 * (!inChal(2) && game.upgrades.includes(9)))).pow(game.upgrades.includes(14) ? 1.05 : 1);
    if (!inChal(5)) {
      if (!inChal(2) && game.upgrades.includes(1)) rate = rate.mul(getTotalCompressors().add(1));
      if (game.upgrades.includes(3)) rate = rate.mul(game.exponents.add(1).sqrt());
      if (game.upgrades.includes(6)) rate = rate.mul(game.number.add(10).log10());
      if (game.upgrades.includes(7)) rate = rate.mul(D.pow(timePlayed() / 1000, 0.2));
      rate = rate.mul(getMatterEffect());
    }
    rate = rate.div(game.darkEnergy.pow10());
    return rate.mul(t);
  }
  
  function getCompressorBase() {
    let b = D(2);
    if (inChal(1)) b = b.mul(2);
    if (inChal(4)) b = b.div(2);
    if (!inChal(2) && game.upgrades.includes(5)) b = b.mul(1.1);
    if (game.upgrades.includes(10)) b = b.mul(getTotalCompressors().add(1).log10().add(10).log10());
    if (game.upgrades.includes(11)) b = b.mul(getMatterEffect().log10().add(1).root(10));
    if (game.chalComp.includes(6)) b = b.mul(game.number.add(1e10).log10().log10().root(3));
    return b;
  }
  
  function getCompressorScaling() {
    let s = D(1);
    if (game.chalComp.includes(1)) s = s.div(0.9);
    if (game.chalComp.includes(4)) s = s.mul(game.exponents.add(1).log10().add(10).log10());
    if (game.upgrades.includes(12)) s = s.mul(getBlackHoleEffect());
    if (!inChal(2) && game.upgrades.includes(13)) s = s.mul(getTotalCompressors().add(1).log10().add(1).root(10));
    return s;
  }
  
  function getCompressCost(x) {
    let e = game.compressors[x - 1].add(1).mul(x).div(getCompressorScaling());
    if (inChal(1)) e = e.add(12);
    if (e.gt(12)) e = D.pow10(e.div(12).sub(1)).mul(12).div(D.ln(10)).add(12).sub(D.div(12, D.ln(10)));
    if (inChal(1)) e = e.sub(12);
    if (inChal(3)) e = e.mul(D.pow(2, getTotalCompressors().sub(game.compressors[x - 1])));
    if (game.chalComp.includes(3)) e = e.sub(game.matter.add(1).log10().div(5));
    return D.pow10(e);
  }
  
  function canCompress(x) {
    return game.number.gte(getCompressCost(x));
  }
  
  function getTotalCompressors() {
    return game.compressors.reduce((x, y) => x.add(y));
  }
  
  function getExponentGain(x = game.number) {
    return x.root(12 - 2 * game.chalComp.includes(2)).div(10).floor();
  }
  
  function getNextExponent(x = game.number) {
    return getExponentGain(x).add(1).mul(10).pow(12 - 2 * game.chalComp.includes(2));
  }
  
  function canUpgrade(x) {
    return (x == 1 || game.upgrades.includes(x - 1)) && game.exponents.gte(UPGRADE_COSTS[x - 1]);
  }
  
  function inChal(x) {
    return game.challenge == x;
  }
  
  function getMatterGain(t = 1) {
    let rate = getNumberRate(t);
    if (!game.chalComp.includes(5)) rate = rate.div(getMatterEffect());
    rate = rate.mul(D.pow(2, game.matterUpgrades[1]));
    return rate;
  }
  
  function getMatterEffect(x = game.matter) {
    return x.add(10).log10().pow(game.matterUpgrades[0].add(10).log10()).mul(D.pow(1.2, game.matterUpgrades[2]));
  }
  
  function getMatterUpgradeCost(x) {
    return MATTER_UPGRADE_COSTS[x].pow(game.matterUpgrades[x]).mul(1e30);
  }
  
  function getBlackHoleCost(x = game.blackHole) {
    let cost = x.gte(10) ? D.pow(2, x.sub(9)).mul(4000) : D.mul(400, x.add(1));
    return cost;
  }
  
  function getBlackHoleEffect(x = game.blackHole) {
    return x.add(10).log10().mul(game.upgrades.includes(15) ? 1.3 : 1);
  }
  
  function getDarkEnergyGain(t = 1) {
    return game.number.log10().div(10).mul(t);
  }
  
  // Rendering functions
  
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
  
  // Buy-max functions
  
  function buyMax(x) {
    /* if (!inChal(1) && !inChal(3) && game.number.lte(D.pow(1e12, getCompressorScaling()))) {
      const c = D.affordGeometricSeries(
        game.number,
        D.pow10(D.div(x, getCompressorScaling())).div(game.chalComp.includes(3) ? game.matter.add(1).root(5) : 1),
        D.pow10(D.div(x, getCompressorScaling())),
        game.compressors[x - 1]
      ),
        n = D.sumGeometricSeries(
          c,
          D.pow10(D.div(x, getCompressorScaling())).div(game.chalComp.includes(3) ? game.matter.add(1).root(5) : 1),
          D.pow10(D.div(x, getCompressorScaling())),
          game.compressors[x - 1]
        );
      game.compressors[x - 1] = game.compressors[x - 1].add(c);
      game.number = game.number.sub(n);
    } else */ while (canCompress(x)) compress(x);
  }
  
  // Soft reset functions
  
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
    game.darkEnergy = D(0);
  }
  
  // Functions executed manually
  
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
      game.upgrades.includes(4) &&
      game.challenge == 0 && (
        !game.chalConf ||
        confirm(
          "Entering a challenge will perform an Exponent reset. You will need to reach the required number under certain restrictions to complete the challenge."
        )
      )
    ) {
      if (game.expOnChal) game.exponents = game.exponents.add(getExponentGain());
      resetCompressors();
      game.challenge = x;
    }
  }
  
  function matterUpgrade(x) {
    if (game.matter.gte(getMatterUpgradeCost(x))) {
      game.matter = game.matter.sub(getMatterUpgradeCost(x));
      game.matterUpgrades[x] = game.matterUpgrades[x].add(1);
    }
  }
  
  function upgradeBlackHole() {
    if (getMatterEffect().gte(getBlackHoleCost())) {
      game.matter = D(0);
      game.blackHole = game.blackHole.add(1);
    }
  }
  
  // Game loop functions
  
  function loop(time) {
    if (NaNerror) return;
    if (checkNaNs()) {
      NaNalert();
      return;
    }
    if (game.matterEnabled) game.matter = game.matter.add(getMatterGain(time));
    else game.number = game.number.add(getNumberRate(time));
    if (game.number.gt(game.highestNumber)) game.highestNumber = game.number;
    if (inChal(6)) game.darkEnergy = game.darkEnergy.add(getDarkEnergyGain(time));
    if (game.upgrades.includes(2)) {
      for (let i = 0; i < 10; i++) {
        if (game.autobuyers[i]) buyMax(i + 1);
      }
    }
  }
  
  function simulateTime(ms) {
    if (NaNerror) return;
    if (looping) return;
    looping = true;
    game.debug = DEBUG;
    game.version = VERSION;
    game.lastTick = Date.now();
    if (DEBUG) ms *= dev.speed;
    for (let i = 0; i < 10; i++) {
      loop(ms / 10000);
      if (NaNerror) return;
    }
    looping = false;
  }
  
  // Save-load functions
  
  // Transform the game save to Decimal
  function transformSaveToDecimal() {
    let i;
    game.number = D(game.number);
    game.highestNumber = D(game.highestNumber);
    for (i = 0; i < 10; i++) game.compressors[i] = D(game.compressors[i]);
    game.exponents = D(game.exponents);
    game.matter = D(game.matter);
    for (i = 0; i < 3; i++) game.matterUpgrades[i] = D(game.matterUpgrades[i]);
    game.blackHole = D(game.blackHole);
    game.darkEnergy = D(game.darkEnergy);
  }
  
  function reset(obj = newGame) {
    for (const i in obj) {
      game[i] = obj[i];
    }
  }
  
  function loadGame(loadgame) {
    // Prevent loading a development save into the main game
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
    if (DEBUG) console.log(diff);
    if (game.offlineProg) {
      simulateTime(diff, true);
    }
  }
  
  function save(auto = false) {
    // Prevent saving of games that contain NaNs
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
    setInterval(() => simulateTime(Date.now() - game.lastTick));
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
    if (prompt("Are you sure you want to reset your game? This cannot be undone! Type “reset” without quotation marks to reset your game.") === "reset") {
      localStorage.removeItem(DEBUG ? "TheNumberLineDevSave-v" + VERSION : "TheNumberLineSave");
      location.reload();
    }
  }
  
  // Define a Vue instance
  const app = Vue.createApp({
    data() {
      return dev;
    }
  });
  
  // Define the object containing all local variables
  const dev = {
    Vue,
    $,
    D,
    VERSION,
    DEBUG,
    speed: 1,
    game,
    newGame,
    UPGRADE_COSTS,
    CHALLENGE_GOALS,
    MATTER_UPGRADE_COSTS,
    tabs,
    NaNerror,
    looping,
    NaNalert,
    checkNaNs,
    timePlayed,
    getNumberRate,
    getCompressorBase,
    getCompressorScaling,
    getCompressCost,
    canCompress,
    getTotalCompressors,
    getExponentGain,
    getNextExponent,
    canUpgrade,
    inChal,
    getMatterGain,
    getMatterEffect,
    getMatterUpgradeCost,
    getBlackHoleCost,
    getBlackHoleEffect,
    getDarkEnergyGain,
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
    matterUpgrade,
    upgradeBlackHole,
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
  
  dev.dev = dev;
  
  // Export dev and app when in a development environment
  if (DEBUG) {
    global.dev = dev;
    global.app = app;
  }
  
  load();
  
  // Export DEBUG and VERSION as read-only variables
  Object.defineProperty(global, "DEBUG", { value: DEBUG });
  Object.defineProperty(global, "VERSION", { value: VERSION });
  
  // Mount the Vue instance to the #app container
  app.mount("#app");
  
  // Display the #app container
  document.getElementById("app").style.display = "";
})(this);
