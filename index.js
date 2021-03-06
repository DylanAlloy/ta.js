async function rsi(data, len) {
  var length = (!len) ? 13 : len - 1;
  var pl = [], arrsi = [];
  for(var i = 1; i < data.length; i++) {
    var diff = (data[i] - data[i - 1]) / data[i] * 100;
    pl.push(diff);
    if(pl.length >= length) {
      var gain = 0, loss = 0;
      for(q in pl) {
        if(pl[q] < 0) loss += pl[q];
        if(pl[q] >= 0) gain += pl[q];
      }
      gain /= length; loss = (Math.abs(loss)) / length;
      rsi = Number(100 - 100 / (1 + (gain / loss)));
      arrsi.push(rsi);
      var diff = (data[i] - data[i - 1]) / data[i] * 100;
      pl.push(diff);
      pl.splice(0, 1);
    }
  }
  return arrsi;
}
async function tsi(data, llen, slen, sig) {
  var long = (!llen) ? 25 : llen, short = (!slen) ? 13 : slen,
  signal = (!sig) ? 13 : sig, mom = [], abs = [], ts = [], tsi = [];
  for(var i = 1; i < data.length; i++) {
    mom.push(data[i] - data[i - 1]);
    abs.push(Math.abs(data[i] - data[i - 1]));
  }
  var sma1 = await module.exports.ema(mom ,long);
  var sma2 = await module.exports.ema(abs ,long);
  var ema1 = await module.exports.ema(sma1, short);
  var ema2 = await module.exports.ema(sma2, short);
  for(var i = 0; i < ema1.length; i++) {
    ts.push(ema1[i] / ema2[i]);
  }
  var tma = await module.exports.ema(ts, signal);
  ts.splice(0, ts.length - tma.length)
  for(var i = 0; i < tma.length; i++) {
    tsi.push([tma[i], ts[i]]);
  }
  return tsi;
}
async function pr(data, len) {
  var length = (!len) ? 14 : len;
  var n = [], pl = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length - 1) {
      var highd = await Math.max.apply(null, pl), lowd = await Math.min.apply(null, pl);
      n.push((highd - data[i]) / (highd - lowd) * -100);
      pl.splice(0, 1);
    }
  }
  return n;
}
async function stoch(data, len, sd, sk) {
  var length = (!len) ? 14 : len;
  var smoothd = (!sd) ? 3 : sd;
  var smoothk = (!sk) ? 3 : sk;
  if(length < smoothd) [length, smoothd] = [smoothd, length];
  if(smoothk > smoothd) [smoothk, smoothd] = [smoothd, smoothk];
  var stoch = [], high = [], low = [], ka = [];
  for(var i = 0; i < data.length; i++) {
    high.push(data[i][0]), low.push(data[i][2]);
    if(high.length >= length) {
      var highd = await Math.max.apply(null, high), lowd = await Math.min.apply(null, low),
      k = 100 * (data[i][1] - lowd) / (highd - lowd);
      ka.push(k)
    }
    if(smoothk > 0 && ka.length > smoothk) {
      var smoothedk = await module.exports.sma(ka, smoothk);
      ka.push(smoothedk[smoothedk.length - 1]);
    }
    if(ka.length - smoothk >= smoothd) {
      var d = await module.exports.sma(ka.slice(smoothk), smoothd);
      stoch.push([k, d[d.length - 1]]);
      high.splice(0, 1);
      low.splice(0, 1);
      ka.splice(0, 1);
    }
  }
  return stoch;
}
async function atr(data, len) {
  var length = (!len) ? 14 : len;
  var atr = [];
  for(var i = 0; i < data.length; i++) {
    if(atr.length < 1) {
      atr.push(data[i][0] - data[i][2]);
    } else {
      var t0 = await Math.max((data[i][0] - data[i - 1][1]), (data[i][2] - data[i - 1][1]), (data[i][0] - data[i][2]));
      var at =(atr[atr.length - 1] * (length - 1) + t0) / length;
      atr.push(at);
    }
  }
  return atr;
}
async function sma(data, len) {
  var length = (!len) ? 14 : len;
  var pl = [], sma = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var average = 0;
      for(q in pl) average += pl[q];
      sma.push(average / length);
      pl.splice(0, 1);
    }
  }
  return sma;
}
async function smma(data, len) {
  var length = (!len) ? 14 : len;
  var pl = [], smma = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var average = 0;
      for(q in pl) average += pl[q];
      if(smma) {
        smma.push(average / length);
      } else {
        smma.push((average - sma1 + data[i]) / length);
      }
      pl.splice(0, 1);
    }
  }
  smma.splice(0, 1);
  return smma;
}
async function wma(data, len) {
  var length = (!len) ? 14 : len;
  var weight = 0;
  for(var i = 1; i <= length; i++) weight += i;
  var pl = [], wma = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var average = 0, index = 1;
      for(q in pl) {
        average += pl[q] * index / weight;
        index++;
      }
      wma.push(average);
      pl.splice(0, 1);
    }
  }
  return wma;
}
async function vwma(data, len) {
    var length = (!len) ? 20 : len, pl = [], vwma = [];
    for(var i = 0; i < data.length; i++) {
      pl.push([(data[i][0] * data[i][1]), data[i][1]]);
      if(pl.length >= length) {
        var totalv = 0, totalp = 0;
        for(var o = 0; o < pl.length; o++) {
          totalv += pl[o][1];
          totalp += pl[o][0];
        }
        vwma.push(totalp / totalv);
        pl.splice(0, 1);
      }
    }
    return vwma;
}
async function ema(data, len) {
  var length = (!len) ? 12 : len;
  var pl = [], ema = [], prevema = 0,
  weight = 2 / (length + 1);
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    var average = 0;
    if(prevema == 0 && pl.length >= length) {
      for(q in pl) average += pl[q];
      average /= length;
      ema.push(average);
      prevema = average;
    } else if(prevema != 0 && pl.length >= length) {
      average = (data[i] - prevema) * weight + prevema;
      ema.push(average);
      prevema = average;
    }
  }
  return ema;
}
async function macd(data, len1, len2) {
  var length1 = (!len1) ? 12 : len1;
  var length2 = (!len2) ? 26 : len2;
  if(length1 > length2) [length1, length2] = [length2, length1];
  var ema = await module.exports.ema(data, length1);
  var emb = await module.exports.ema(data, length2);
  ema.splice(0, length2 - length1);
  var macd = [];
  for(var i = 0; i < emb.length; i++) {
    macd.push([ema[i] - emb[i]]);
  }
  return macd;
}
async function bands(data, len, dev) {
  var length = (!len) ? 14 : len;
  var deviations = (!dev) ? 1 : dev;
  var pl = [], deviation = [], boll = [];
  var sma = await module.exports.sma(data, length);
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var devi = await module.exports.std(pl, length);
      deviation.push(devi);
      pl.splice(0, 1);
    }
  }
  for(var i = 0; i < sma.length; i++) {
    boll.push([sma[i] + deviation[i] * deviations, sma[i], sma[i] - deviation[i] * deviations]);
  }
  return boll;
}
async function bandwidth(data, len, dev) {
  var length = (!len) ? 14 : len;
  var deviations = (!dev) ? 1 : dev;
  var pl = [], deviation = [], boll = [];
  var sma = await module.exports.sma(data, length);
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var devi = await module.exports.std(pl);
      deviation.push(devi);
      pl.push(data[i]);
      pl.splice(0, 1);
    }
  }
  for(var i = 0; i < deviation.length; i++) {
    var bandwidth = (((sma[i] + deviation[i] * deviations) - (sma[i] - deviation[i] * deviations)) / sma[i]);
    boll.push(bandwidth);
  }
  return boll;
}
async function keltner(data, len, dev) {
  var length = (!len) ? 14 : len;
  var devi = (!dev) ? 1 : dev;
  var closing = [], atr = await module.exports.atr(data, length), kma, kelt = [];
  for(var i in data) closing.push((data[i][0] + data[i][1] + data[i][2]) / 3);
  kma = await module.exports.sma(closing, length);
  atr.splice(0, length - 1);
  for(var i = 0; i < kma.length; i++) {
    kelt.push([kma[i] + atr[i] * devi, kma[i], kma[i] - atr[i] * devi]);
  }
  return kelt
}
async function std(data, len) {
  var length = (!len) ? data.length : len;
  var mean = data.reduce((a, b) => {
    return Number(a) + Number(b);
  }) / length;
  var std = Math.sqrt(data.reduce((sq, n) => {
    return sq + Math.pow(n - mean, 2);
  }, 0) / (length));
  return std;
}
async function dif(n, o) {
  return (n - o) / o;
}
async function aroon_up(data, len) {
  var length = (!len) ? 10 : len;
  var pl = [], aroon = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var hl = pl.slice(0);
      hl.sort((a, b) => {
        return a - b;
      });
      var h = hl[length - 1];
      aroon.push((100 * (length - (pl.findIndex(x => x == h) + 1)) / length));
      pl.splice(0, 1);
    }
  }
  return aroon;
}
async function aroon_down(data, len) {
  var length = (!len) ? 10 : len;
  var pl = [], aroon = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      var hl = pl.slice(0);
      hl.sort((a, b) => {
        return a - b;
      });
      var l = hl[0];
      aroon.push((100 * (length - (pl.findIndex(x => x == l) + 1)) / length));
      pl.splice(0, 1);
    }
  }
  return aroon;
}
async function aroon_osc(data, len) {
  var length = (!len) ? 25 : len;
  var aroon = [];
  var u = await module.exports.aroon.up(data, length);
  var d = await module.exports.aroon.down(data, length);
  for(var i = 0; i < u.length; i++) {
    aroon.push(u[i] - d[i]);
  }
  return aroon;
}
async function mfi(data, len) {
  var length = (!len) ? 14 : len;
  var mfi = [], n = [], p = [];
  for(var i = 0; i < data.length; i++) {
    p.push(data[i][0]);
    n.push(data[i][1]);
    if(p.length >= length) {
      var positive = 0, negative = 0;
      for(q in p) positive += p[q];
      for(q in n) negative += n[q];
      mfi.push((100 - 100 / (1 + positive / negative)));
      p.splice(0, 1);
      n.splice(0, 1);
    }
  }
  return mfi;
}
async function roc(data, len) {
  var length = (!len) ? 14 : len;
  var pl = [], roc = [];
  for(var i = 0; i < data.length; i++) {
    pl.push(data[i]);
    if(pl.length >= length) {
      roc.push((pl[length - 1] - pl[0]) / pl[0]);
      pl.splice(0, 1);
    }
  }
  return roc;
}
async function obv(data) {
  var obv = [0];
  for(var i = 1; i < data.length; i++) {
    if(data[i][1] > data[i - 1][1]) obv.push(obv[obv.length - 1] + data[i][0])
    if(data[i][1] < data[i - 1][1]) obv.push(obv[obv.length - 1] - data[i][0])
    if(data[i][1] == data[i - 1][1]) obv.push(obv[obv.length - 1])
  }
  return obv;
}
async function vwap(data, len) {
  var length = (!len || len > data.length) ? data.length : len, pl = [], vwap = [];
  for(var i = 0; i < data.length; i++) {
    pl.push([(data[i][0] * data[i][1]), data[i][1]]);
    if(pl.length >= length) {
      var totalv = 0, totalp = 0;
      for(var o = 0; o < pl.length; o++) {
        totalv += pl[o][1];
        totalp += pl[o][0];
      }
      vwap.push(totalp / totalv);
      pl.splice(0, 1);
    }
  }
  return vwap;
}
async function mom(data, len, p) {
  var length = (!len) ? 10 : len, mom = [];
  for(var i = length - 1; i < data.length; i++) {
    (p) ? mom.push(data[i] / data[i - (length - 1)] * 100) : mom.push(data[i] - data[i - (length - 1)])
  }
  return mom;
}
module.exports = {
  rsi: rsi,
  tsi: tsi,
  pr: pr,
  stoch: stoch,
  atr: atr,
  sma: sma,
  smma: smma,
  wma: wma,
  vwma: vwma,
  ema: ema,
  macd: macd,
  bands: bands,
  bandwidth: bandwidth,
  keltner: keltner,
  std: std,
  dif: dif,
  aroon: {
    up: aroon_up,
    down: aroon_down,
    osc: aroon_osc,
  },
  mfi: mfi,
  roc: roc,
  obv: obv,
  vwap: vwap,
  mom: mom
}
