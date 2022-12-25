# 網頁版隨機值計算機

- Probabilistic computing with p-bits: Applied Physics Letters: Vol 119, No 15 https://aip.scitation.org/doi/full/10.1063/5.0067927
- p-bits - Google Scholar https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=p-bits&btnG=
- Monte Carlo Simulations https://marblescience.com/blog/monte-carlo-simulations/
  - 豆子算圓面積影片 Monte Carlo Simulation - YouTube https://www.youtube.com/watch?v=7ESK5SaP-bc

# coin, dice, pi and integration



```js
const diceRolls = [];

function generateDiceRolls(numRolls) {
  const generatedRolls = [];

  function rollDie(priorRoll) {
    if (!priorRoll) priorRoll = { meanRoll: 0, numRolls: 0 };
    const priorSum = priorRoll.meanRoll * priorRoll.numRolls;

    const minRoll = 1;
    const maxRoll = 6;
    const newRoll = Math.floor(
      Math.random() * (maxRoll - minRoll + 1) + minRoll
    );

    return {
      meanRoll: (priorSum + newRoll) / (priorRoll.numRolls + 1),
      numRolls: priorRoll.numRolls + 1
    };
  }

  for (let i = 0; i < numRolls; i++) {
    let priorRoll;
    if (i === 0) priorRoll = diceRolls[diceRolls.length - 1];
    else priorRoll = generatedRolls[generatedRolls.length - 1];
    generatedRolls.push(rollDie(priorRoll));
  }
  return diceRolls.concat(generatedRolls);
}

generateDiceRolls(1000);
```

- Estimate Pi with Monte Carlo Simulation in Javascript https://questsincode.com/posts/monte-carlo-simulation-javascript
- Monte-Carlo Simulation | Brilliant Math & Science Wiki https://brilliant.org/wiki/monte-carlo/
- Project Nash
  - https://github.com/shehio/Project-Nash/blob/6cf93e0c4eff1fa81f72f68468e837006456dcd6/montecarlo/examples/coin.js#L15
  - https://github.com/shehio/Project-Nash/blob/6cf93e0c4eff1fa81f72f68468e837006456dcd6/montecarlo/examples/pi.js#L27
  - https://github.com/shehio/Project-Nash/blob/6cf93e0c4eff1fa81f72f68468e837006456dcd6/montecarlo/examples/integration.js#L38

# TODO

- 日本等國際團隊開發出實現量子級運算新技術 日經中文網 https://zh.cn.nikkei.com/industry/scienceatechnology/50814-2022-12-13-10-52-41.html
- Simple Calculator using Keypad, OLED & Raspberry Pi Pico https://how2electronics.com/simple-calculator-using-keypad-oled-raspberry-pi-pico/

