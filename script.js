!function(e){"use strict";if("aHR0cHM6Ly9hbnRpLWdob3N0LmdpdGh1Yi5pbw=="!=btoa(location.origin)&&"aHR0cHM6Ly9yYXcuZ2l0aGFjay5jb20="!=btoa(location.origin)&&"aHR0cHM6Ly9yYXdjZG4uZ2l0aGFjay5jb20="!=btoa(location.origin))return void(document.getElementById("fake").style.display="");const t=!1,o="1.3.0",n=e.Vue,r=e.$,a=e.Decimal,u=n.reactive({}),l={debug:t,version:o,timeStarted:Date.now(),lastTick:Date.now(),offlineProg:!0,number:a(0),highestNumber:a(0),compressors:[a(0),a(0),a(0),a(0),a(0),a(0),a(0),a(0),a(0),a(0)],expUnlocked:!1,exponents:a(0),upgrades:[],autobuyers:[!0,!0,!0,!0,!0,!0,!0,!0,!0,!0],challenge:0,chalComp:[],chalConf:!0,expOnChal:!0,matter:a(0),matterEnabled:!1,matterUpgrades:[a(0),a(0),a(0)],blackHole:a(0),darkEnergy:a(0)},s=[a(1),a(2),a(3),a(10),a(20),a(50),a(500),a(1e4),a(1e6),a(1e7),a(1e8),a(1e9),a(1e10),a(1e12),a(1e20),a(1/0)],i=[a(1e12),a(1e20),a(1e16),a(1e18),a(1e52),a(1e100)],d=[a(1e5),a(1e3),a(1e9)],c=n.reactive({tab:0,expSubtab:0});let m=!1,p=!1;function g(){m||(m=!0,F(btoa(JSON.stringify(u))),alert("We have detected a NaN in your save! We have exported it to your clipboard (although it might be broken). Please report this save to the developers of The Number Line, so they can look into it."))}function f(e=u){for(const t in e){if("object"==typeof e[t]&&e[t]!==e&&f(e[t]))return!0;if(Number.isNaN(e[t]))return!0}return!1}function b(){return Date.now()-u.timeStarted}function v(e=1){let t=a.pow(h(),S().add(10*(!x(2)&&u.upgrades.includes(9)))).pow(u.upgrades.includes(14)?1.05:1);return x(5)||(!x(2)&&u.upgrades.includes(1)&&(t=t.mul(S().add(1))),u.upgrades.includes(3)&&(t=t.mul(u.exponents.add(1).sqrt())),u.upgrades.includes(6)&&(t=t.mul(u.number.add(10).log10())),u.upgrades.includes(7)&&(t=t.mul(a.pow(b()/1e3,.2))),t=t.mul(T())),(t=t.div(u.darkEnergy.pow10())).mul(e)}function h(){let e=a(2);return x(1)&&(e=e.mul(2)),x(4)&&(e=e.div(2)),!x(2)&&u.upgrades.includes(5)&&(e=e.mul(1.1)),u.upgrades.includes(10)&&(e=e.mul(S().add(1).log10().add(10).log10())),u.upgrades.includes(11)&&(e=e.mul(T().log10().add(1).root(10))),u.chalComp.includes(6)&&(e=e.mul(u.number.add(1e10).log10().log10().root(3))),e}function y(){let e=a(1);return u.chalComp.includes(1)&&(e=e.div(.9)),u.chalComp.includes(4)&&(e=e.mul(u.exponents.add(1).log10().add(10).log10())),u.upgrades.includes(12)&&(e=e.mul(O())),!x(2)&&u.upgrades.includes(13)&&(e=e.mul(S().add(1).log10().add(1).root(10))),e}function N(e){let t=u.compressors[e-1].add(1).mul(e).div(y());return x(1)&&(t=t.add(12)),t.gt(12)&&(t=a.pow10(t.div(12).sub(1)).mul(12).div(a.ln(10)).add(12).sub(a.div(12,a.ln(10)))),x(1)&&(t=t.sub(12)),x(3)&&(t=t.mul(a.pow(2,S().sub(u.compressors[e-1])))),u.chalComp.includes(3)&&(t=t.sub(u.matter.add(1).log10().div(5))),a.pow10(t)}function C(e){return u.number.gte(N(e))}function S(){return u.compressors.reduce((e,t)=>e.add(t))}function E(e=u.number){return e.root(12-2*u.chalComp.includes(2)).div(10).floor()}function k(e){return(1==e||u.upgrades.includes(e-1))&&u.exponents.gte(s[e-1])}function x(e){return u.challenge==e}function w(e=1){let t=v(e);return u.chalComp.includes(5)||(t=t.div(T())),t=t.mul(a.pow(2,u.matterUpgrades[1]))}function T(e=u.matter){return e.add(10).log10().pow(u.matterUpgrades[0].add(10).log10()).mul(a.pow(1.2,u.matterUpgrades[2]))}function D(e){return d[e].pow(u.matterUpgrades[e]).mul(1e30)}function L(e=u.blackHole){return e.gte(10)?a.pow(2,e.sub(9)).mul(4e3):a.mul(400,e.add(1))}function O(e=u.blackHole){return e.add(10).log10().mul(u.upgrades.includes(15)?1.3:1)}function U(e=1){return u.number.log10().div(10).mul(e)}function G(e,t=0){if((e=a(e)).isNaN())return g(),"NaN";if(-1==e.sign)return"-"+G(e.neg());if(e.eq(1/0))return"Infinity";if(0==e.sign)return"0";if(e.lt(1e3))return e.toNumber().toFixed(t);if(e.lt(1e6))return e.toNumber().toFixed(0);if(e.lt("e1e6")){let t=e.e,o=e.m;return"10.000"===G(o,3)&&(o=1,t++),G(o,3)+"e"+G(t)}return e.lt(a.tetrate(10,6))?"e"+G(e.log10()):"10^^"+G(e.slog())}function H(e){for(;C(e);)R(e)}function I(){u.number=a(0),u.compressors=[a(0),a(0),a(0),a(0),a(0),a(0),a(0),a(0),a(0),a(0)],u.darkEnergy=a(0)}function R(e){C(e)&&(u.number=u.number.sub(N(e)),u.compressors[e-1]=u.compressors[e-1].add(1))}function A(e){if(!m)if(f())g();else if(u.matterEnabled?u.matter=u.matter.add(w(e)):u.number=u.number.add(v(e)),u.number.gt(u.highestNumber)&&(u.highestNumber=u.number),x(6)&&(u.darkEnergy=u.darkEnergy.add(U(e))),u.upgrades.includes(2))for(let e=0;e<10;e++)u.autobuyers[e]&&H(e+1)}function j(e){if(!m&&!p){p=!0,u.debug=t,u.version=o,u.lastTick=Date.now(),t&&(e*=Y.speed);for(let t=0;t<10;t++)if(A(e/1e4),m)return;p=!1}}function B(e=l){for(const t in e)u[t]=e[t]}function M(e){if(e.debug&&!t)return void r.notify("Import failed, attempted to load development save into the main game.","error");B();for(const t in e)u[t]=e[t];u.debug=t,u.version=o,function(){let e;for(u.number=a(u.number),u.highestNumber=a(u.highestNumber),e=0;e<10;e++)u.compressors[e]=a(u.compressors[e]);for(u.exponents=a(u.exponents),u.matter=a(u.matter),e=0;e<3;e++)u.matterUpgrades[e]=a(u.matterUpgrades[e]);u.blackHole=a(u.blackHole),u.darkEnergy=a(u.darkEnergy)}();const n=Date.now()-u.lastTick;t&&console.log(n),u.offlineProg&&j(n)}function P(e=!1){m?e&&r.notify("Save failed, attempted to save a broken game","error"):(localStorage.setItem(t?"TheNumberLineDevSave-v"+o:"TheNumberLineSave",btoa(JSON.stringify(u))),e&&r.notify("Game saved","success"))}function W(){B(),null!==localStorage.getItem(t?"TheNumberLineDevSave-v"+o:"TheNumberLineSave")&&M(JSON.parse(atob(localStorage.getItem(t?"TheNumberLineDevSave-v"+o:"TheNumberLineSave")))),setInterval(()=>j(Date.now()-u.lastTick)),setInterval(()=>P(),5e3)}function F(e){const t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="absolute",t.style.left="-9999px",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}const V=n.createApp({data:()=>Y}),Y={Vue:n,$:r,D:a,VERSION:o,DEBUG:t,speed:1,game:u,newGame:l,UPGRADE_COSTS:s,CHALLENGE_GOALS:i,MATTER_UPGRADE_COSTS:d,tabs:c,NaNerror:m,looping:p,NaNalert:g,checkNaNs:f,timePlayed:b,getNumberRate:v,getCompressorBase:h,getCompressorScaling:y,getCompressCost:N,canCompress:C,getTotalCompressors:S,getExponentGain:E,getNextExponent:function(e=u.number){return E(e).add(1).mul(10).pow(12-2*u.chalComp.includes(2))},canUpgrade:k,inChal:x,getMatterGain:w,getMatterEffect:T,getMatterUpgradeCost:D,getBlackHoleCost:L,getBlackHoleEffect:O,getDarkEnergyGain:U,format:G,formatTime:function(e,t=0){return(e=a(e)).isNaN()?(g(),"NaN seconds"):e.eq(1/0)?"forever":e.lt(60)?G(e,t)+" seconds":e.lt(3600)?G(e.div(60).floor())+" minutes "+G(e.sub(e.div(60).floor().mul(60)),t)+" seconds":e.lt(86400)?G(e.div(3600).floor())+" hours "+G(e.div(60).floor().sub(e.div(3600).floor().mul(60)))+" minutes "+G(e.sub(e.div(60).floor().mul(60)),t)+" seconds":e.lt(31536e3)?G(e.div(86400).floor())+" days "+G(e.div(3600).floor().sub(e.div(86400).floor().mul(24)))+" hours "+G(e.div(60).floor().sub(e.div(3600).floor().mul(60)))+" minutes":e.lt(31536e6)?G(e.div(31536e3).floor())+" years "+G(e.div(86400).floor().sub(e.div(31536e3).floor().mul(365)))+" days":G(e.div(31536e3))+" years"},onOff:function(e){return e?"ON":"OFF"},enableDisable:function(e){return e?"Disable":"Enable"},buyMax:H,resetCompressors:I,compress:R,exponentiate:function(){u.challenge>0?(!u.chalComp.includes(u.challenge)&&u.number.gte(i[u.challenge-1])&&u.chalComp.push(u.challenge),u.challenge=0,I()):u.number.gte(1e12)&&(u.expUnlocked=!0,u.exponents=u.exponents.add(E()),I())},upgrade:function(e){k(e)&&(e%4>0&&(u.exponents=u.exponents.sub(s[e-1])),u.upgrades.push(e))},enableAutobuyers:function(){for(let e=0;e<10;e++)u.autobuyers[e]=!0},disableAutobuyers:function(){for(let e=0;e<10;e++)u.autobuyers[e]=!1},enterChal:function(e){!u.upgrades.includes(4)||0!=u.challenge||u.chalConf&&!confirm("Entering a challenge will perform an Exponent reset. You will need to reach the required number under certain restrictions to complete the challenge.")||(u.expOnChal&&(u.exponents=u.exponents.add(E())),I(),u.challenge=e)},matterUpgrade:function(e){u.matter.gte(D(e))&&(u.matter=u.matter.sub(D(e)),u.matterUpgrades[e]=u.matterUpgrades[e].add(1))},upgradeBlackHole:function(){T().gte(L())&&(u.matter=a(0),u.blackHole=u.blackHole.add(1))},loop:A,simulateTime:j,reset:B,loadGame:M,save:P,load:W,copyStringToClipboard:F,importSave:function(){try{const e=prompt("Copy-paste your save. WARNING: WILL OVERWRITE YOUR SAVE");M(JSON.parse(atob(e))),P()}catch(e){t&&console.log(e)}},exportSave:function(){F(btoa(JSON.stringify(u))),r.notify("Copied to clipboard","success"),t&&r.notify("Warning! This is a development save. You will not be able to import this save into the main game.","warn")},hardReset:function(){"reset"===prompt("Are you sure you want to reset your game? This cannot be undone! Type “reset” without quotation marks to reset your game.")&&(localStorage.removeItem(t?"TheNumberLineDevSave-v"+o:"TheNumberLineSave"),location.reload())},app:V};Y.dev=Y,t&&(e.dev=Y,e.app=V),W(),Object.defineProperty(e,"DEBUG",{value:t}),Object.defineProperty(e,"VERSION",{value:o}),V.mount("#app"),document.getElementById("app").style.display=""}(this);
