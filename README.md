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
You must buy the previous upgrade before buying an upgrade.
### Autobuyers
When you buy the 2<sup>nd</sup> exponent upgrade, you unlock autobuyers. Autobuyers automate buying compressors.
You may enable or disable each autobuyer individually.
### Challenges
When you enter a challenge, you must reach the required number under certain restrictions to complete it.
Completing challenges will give boosts to your production.
You can exit a challenge if you don’t think you are able to complete the challenge.
### Matter
When you enable Matter production, your number does not increase, but you gain matter based on your number rate.
Matter gives a boost to Number gain based on its amount. The boost is log<sub>10</sub>(matter+10).
Matter can be spent on Matter Upgrades which give matter-related effects.
# Changelog
This is a list of changes for The Number Line.
## v0.0.0 – Initial Development
### v0.1.0 (August 27, 2022)
* First public release, added compressors
## v1.0.0 – The Exponent Update (September 1, 2022)
* Added Exponents
* Added support for Decimal
* Major styling changes
* Added How to Play page
* Added changelog
### v1.1.0 – The Challenge Update (September 3, 2022)
* Added Challenges
* Added 4 more exponent upgrades
* Some styling changes
* Multiple bug fixes
#### v1.1.1 (September 13, 2022)
* Fixed a bug when buying exponent upgrades
* Fixed spacing in the How to Play and Changelog pages
### v1.2.0 – The Matter Update (September 30, 2022)
* Added Matter
* Added 2 more challenges
