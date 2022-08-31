# How to Play
The Number Line is an idle incremental game with multiple layers of prestige, unlocks, and features.
The basic goal is to reach as large of a number as you can, which can be spent on upgrades to boost your overall production.
## Number
When you start the game, your number starts at 0 and increases by 1 per second.
When your number reaches 10, you can spend it to buy a compressor.
### Compressors
Compressors multiply the rate your number increases. Each compressor you buy doubles the rate.
There exist 10 compressors with varying costs.
The cost to buy the <var>x</var><sup>th</sup> compressor is 10<sup><var>x</var> * (<var>y</var>+1)</sup>,
where <var>y</var> is the current number of <var>x</var><sup>th</sup> compressors you have.
## Exponents
When your number reaches 1 trillion, you unlock exponentiation. When you exponentiate, you reset all previous progress,
but you gain exponents based on your number. The exponent gain is <var>x</var><sup>1/12</sup>/10,
where <var>x</var> is the number you had before exponentiating.
### Upgrades
Exponents can be spent on upgrades to boost your production. The first upgrade costs 1 exponent,
and multiplies your number gain by the total number of compressors you bought.
### Autobuyers
When you buy the 2<sup>nd</sup> exponent upgrade, you unlock autobuyers. Autobuyers automate buying compressors.
You may enable or disable each autobuyer individually.
