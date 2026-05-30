/**
 * Realistic sample trading history for the Aiensie demo.
 *
 * Sizing convention: all positions are scaled so that the notional value
 * (positionSize × entryPrice) falls in a consistent $8k–$16k band.
 * A few intentional outliers (marked "oversize") simulate the behavioral
 * patterns the engine is designed to detect.
 *
 * Asset-class targets (base notional ≈ $10 000):
 *   BTC  @ $42 000–68 000  → base ≈ 0.22 BTC
 *   ETH  @ $2 200–3 600    → base ≈ 4.0 ETH
 *   SOL  @ $98–153         → base ≈ 80 SOL
 *   AAPL @ $183–189        → base ≈ 54 shares
 *   TSLA @ $172–248        → base ≈ 42 shares
 */

import type { Trade, TradeSide, AssetClass } from "./types.js";

function d(iso: string): Date {
  return new Date(iso);
}

/** Build a trade and auto-compute pnl from price delta × size, minus fees. */
function t(
  id: string,
  symbol: string,
  side: TradeSide,
  entry: string,
  exit: string,
  entryPrice: number,
  exitPrice: number,
  size: number,
  fees: number,
  platform: string,
  assetClass: AssetClass,
): Trade {
  const delta =
    side === "long" || side === "buy"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;
  return {
    id,
    symbol,
    side,
    entryTime: d(entry),
    exitTime: d(exit),
    entryPrice,
    exitPrice,
    positionSize: size,
    pnl: delta * size - fees,
    fees,
    platform,
    assetClass,
  };
}

export const SAMPLE_TRADES: Trade[] = [
  // ── January 2024 ──────────────────────────────────────────────────────────
  // T001  BTC long WIN: (43600-42800)*0.22 = +176, -14 fees = +162
  t("T001","BTCUSDT","long","2024-01-02T09:15Z","2024-01-02T11:42Z",42800,43600,0.22,14,"Binance","crypto"),
  // T002  ETH long LOSS: (2195-2280)*4 = -340, -12 fees = -352
  t("T002","ETHUSDT","long","2024-01-02T14:00Z","2024-01-02T16:30Z",2280,2195,4.0,12,"Binance","crypto"),
  // T003  SOL long WIN: (104.2-98.4)*80 = +464, -8 fees = +456
  t("T003","SOLUSDT","long","2024-01-03T08:45Z","2024-01-03T10:20Z",98.4,104.2,80,8,"Bybit","crypto"),
  // T004  BTC short WIN: (43900-43200)*0.22 = +154, -14 fees = +140
  t("T004","BTCUSDT","short","2024-01-03T13:00Z","2024-01-03T15:45Z",43900,43200,0.22,14,"Binance","crypto"),
  // T005  AAPL buy LOSS: (183.8-185.2)*54 = -75.6, -4 fees = -80
  t("T005","AAPL","buy","2024-01-04T14:30Z","2024-01-04T15:55Z",185.2,183.8,54,4,"TD Ameritrade","equities"),
  // Revenge trade 8m after T005 loss — slightly larger (oversize signal)
  // T006  AAPL buy LOSS: (182.1-183.9)*80 = -144, -6 fees = -150
  t("T006","AAPL","buy","2024-01-04T16:03Z","2024-01-04T16:55Z",183.9,182.1,80,6,"TD Ameritrade","equities"),
  // T007  ETH short WIN: (2210-2180)*4 = +120, -10 fees = +110
  t("T007","ETHUSDT","short","2024-01-04T17:00Z","2024-01-04T18:20Z",2210,2180,4.0,10,"Binance","crypto"),
  // T008  BTC long WIN: (44100-43300)*0.22 = +176, -14 fees = +162
  t("T008","BTCUSDT","long","2024-01-05T09:00Z","2024-01-05T14:30Z",43300,44100,0.22,14,"Binance","crypto"),
  // T009  SOL short WIN: (105.6-103.2)*80 = +192, -8 fees = +184
  t("T009","SOLUSDT","short","2024-01-05T15:00Z","2024-01-05T16:10Z",105.6,103.2,80,8,"Bybit","crypto"),
  // T010  TSLA buy WIN: (241.8-235.4)*42 = +268.8, -5 fees = +264
  t("T010","TSLA","buy","2024-01-08T14:30Z","2024-01-08T15:50Z",235.4,241.8,42,5,"TD Ameritrade","equities"),
  // T011  BTC long LOSS: (44200-44500)*0.22 = -66, -14 fees = -80
  t("T011","BTCUSDT","long","2024-01-09T08:30Z","2024-01-09T11:00Z",44500,44200,0.22,14,"Binance","crypto"),
  // T012  ETH long WIN: (2395-2320)*4 = +300, -12 fees = +288
  t("T012","ETHUSDT","long","2024-01-09T11:30Z","2024-01-09T14:00Z",2320,2395,4.0,12,"Binance","crypto"),
  // T013  SOL long WIN: (111.4-106.8)*80 = +368, -8 fees = +360
  t("T013","SOLUSDT","long","2024-01-10T09:00Z","2024-01-10T13:20Z",106.8,111.4,80,8,"Bybit","crypto"),
  // T014  BTC short LOSS: (43900-44500)*0.22 = -132, -14 fees = -146
  t("T014","BTCUSDT","short","2024-01-10T15:00Z","2024-01-10T17:30Z",44900,45400,0.22,14,"Binance","crypto"),
  // T015  ETH short WIN: (2410-2360)*4 = +200, -12 fees = +188
  t("T015","ETHUSDT","short","2024-01-11T09:15Z","2024-01-11T11:45Z",2410,2360,4.0,12,"Binance","crypto"),
  // T016  BTC long WIN: (45800-45100)*0.22 = +154, -14 fees = +140
  t("T016","BTCUSDT","long","2024-01-11T14:00Z","2024-01-11T16:30Z",45100,45800,0.22,14,"Binance","crypto"),
  // T017  BTC long LOSS — oversize after win streak (T012-T013-T015-T016), 2× base
  // 0.45 BTC * $45,900 ≈ $20,655 notional
  t("T017","BTCUSDT","long","2024-01-12T09:00Z","2024-01-12T10:15Z",45900,45200,0.45,28,"Binance","crypto"),
  // T018  SOL long WIN: (118.5-114.0)*80 = +360, -8 fees = +352
  t("T018","SOLUSDT","long","2024-01-12T11:00Z","2024-01-12T14:45Z",114.0,118.5,80,8,"Bybit","crypto"),
  // T019  AAPL buy WIN: (188.2-186.4)*54 = +97.2, -4 fees = +93
  t("T019","AAPL","buy","2024-01-12T15:00Z","2024-01-12T15:50Z",186.4,188.2,54,4,"TD Ameritrade","equities"),
  // T020  ETH long LOSS: (2420-2440)*4 = -80, -12 fees = -92
  t("T020","ETHUSDT","long","2024-01-15T09:30Z","2024-01-15T13:00Z",2440,2420,4.0,12,"Binance","crypto"),
  // T021  BTC short WIN: (46200-45600)*0.22 = +132, -14 fees = +118
  t("T021","BTCUSDT","short","2024-01-15T14:00Z","2024-01-15T16:45Z",46200,45600,0.22,14,"Binance","crypto"),
  // T022  SOL short WIN: (118.0-116.2)*80 = +144, -8 fees = +136
  t("T022","SOLUSDT","short","2024-01-16T09:00Z","2024-01-16T10:30Z",118.0,116.2,80,8,"Bybit","crypto"),
  // T023  TSLA buy WIN: (248.9-244.6)*42 = +180.6, -5 fees = +176
  t("T023","TSLA","buy","2024-01-16T15:00Z","2024-01-16T15:55Z",244.6,248.9,42,5,"TD Ameritrade","equities"),
  // T024  BTC long WIN: (46400-45700)*0.22 = +154, -14 fees = +140
  t("T024","BTCUSDT","long","2024-01-17T08:45Z","2024-01-17T12:30Z",45700,46400,0.22,14,"Binance","crypto"),
  // T025  ETH short LOSS: (2460-2510)*4 = -200, -12 fees = -212
  t("T025","ETHUSDT","short","2024-01-17T13:00Z","2024-01-17T15:30Z",2460,2510,4.0,12,"Binance","crypto"),
  // T026  SOL long WIN: (123.8-120.4)*80 = +272, -8 fees = +264
  t("T026","SOLUSDT","long","2024-01-18T09:15Z","2024-01-18T14:00Z",120.4,123.8,80,8,"Bybit","crypto"),
  // T027  BTC short WIN: (46600-45900)*0.22 = +154, -14 fees = +140
  t("T027","BTCUSDT","short","2024-01-19T09:00Z","2024-01-19T11:30Z",46600,45900,0.22,14,"Binance","crypto"),

  // ── February 2024 ─────────────────────────────────────────────────────────
  // T028  BTC long WIN: (43200-42500)*0.22 = +154, -14 = +140
  t("T028","BTCUSDT","long","2024-02-01T09:00Z","2024-02-01T13:30Z",42500,43200,0.22,14,"Binance","crypto"),
  // T029  ETH long LOSS: (2260-2290)*4 = -120, -12 = -132
  t("T029","ETHUSDT","long","2024-02-01T14:00Z","2024-02-01T16:00Z",2290,2260,4.0,12,"Binance","crypto"),
  // Revenge trade 15m after T029 close — oversize (80→120 SOL)
  // T030  SOL long LOSS: (99.2-102.6)*120 = -408, -10 = -418
  t("T030","SOLUSDT","long","2024-02-01T16:15Z","2024-02-01T17:30Z",102.6,99.2,120,10,"Bybit","crypto"),
  // T031  SOL short WIN: (102.6-100.1)*80 = +200, -8 = +192
  t("T031","SOLUSDT","short","2024-02-02T09:30Z","2024-02-02T11:00Z",102.6,100.1,80,8,"Bybit","crypto"),
  // T032  BTC long WIN: (43800-43100)*0.22 = +154, -14 = +140
  t("T032","BTCUSDT","long","2024-02-02T12:00Z","2024-02-02T15:45Z",43100,43800,0.22,14,"Binance","crypto"),
  // T033  AAPL buy WIN: (184.9-183.0)*54 = +102.6, -4 = +99
  t("T033","AAPL","buy","2024-02-02T15:30Z","2024-02-02T15:58Z",183.0,184.9,54,4,"TD Ameritrade","equities"),
  // T034  TSLA buy LOSS: (188.6-192.4)*42 = -159.6, -5 = -165
  t("T034","TSLA","buy","2024-02-05T14:30Z","2024-02-05T15:45Z",192.4,188.6,42,5,"TD Ameritrade","equities"),
  // T035  BTC short LOSS: (43900-44300)*0.22 = -88, -14 = -102
  t("T035","BTCUSDT","short","2024-02-05T16:00Z","2024-02-05T17:15Z",43900,44300,0.22,14,"Binance","crypto"),
  // T036  ETH short WIN: (2240-2210)*4 = +120, -12 = +108
  t("T036","ETHUSDT","short","2024-02-06T09:00Z","2024-02-06T10:45Z",2240,2210,4.0,12,"Binance","crypto"),
  // T037  SOL long WIN: (103.2-99.8)*80 = +272, -8 = +264
  t("T037","SOLUSDT","long","2024-02-06T11:30Z","2024-02-06T14:30Z",99.8,103.2,80,8,"Bybit","crypto"),
  // T038  BTC long WIN: (44600-43800)*0.22 = +176, -14 = +162
  t("T038","BTCUSDT","long","2024-02-07T09:00Z","2024-02-07T14:00Z",43800,44600,0.22,14,"Binance","crypto"),
  // T039  ETH long LOSS: (2220-2230)*4 = -40, -12 = -52
  t("T039","ETHUSDT","long","2024-02-07T15:00Z","2024-02-07T17:00Z",2230,2220,4.0,12,"Binance","crypto"),
  // T040  SOL short WIN: (103.5-101.2)*80 = +184, -8 = +176
  t("T040","SOLUSDT","short","2024-02-08T09:15Z","2024-02-08T11:00Z",103.5,101.2,80,8,"Bybit","crypto"),
  // T041  BTC long WIN: (45100-44400)*0.22 = +154, -14 = +140
  t("T041","BTCUSDT","long","2024-02-08T12:00Z","2024-02-08T16:30Z",44400,45100,0.22,14,"Binance","crypto"),
  // T042  AAPL buy WIN: (186.8-184.5)*54 = +124.2, -4 = +120
  t("T042","AAPL","buy","2024-02-09T14:30Z","2024-02-09T15:45Z",184.5,186.8,54,4,"TD Ameritrade","equities"),
  // T043  BTC short WIN: (45300-44700)*0.22 = +132, -14 = +118
  t("T043","BTCUSDT","short","2024-02-12T09:00Z","2024-02-12T12:00Z",45300,44700,0.22,14,"Binance","crypto"),
  // T044  ETH long WIN: (2310-2260)*4 = +200, -12 = +188
  t("T044","ETHUSDT","long","2024-02-12T13:00Z","2024-02-12T16:00Z",2260,2310,4.0,12,"Binance","crypto"),
  // T045  SOL long WIN: (109.4-105.0)*80 = +352, -8 = +344
  t("T045","SOLUSDT","long","2024-02-13T09:30Z","2024-02-13T14:00Z",105.0,109.4,80,8,"Bybit","crypto"),
  // T046  TSLA buy WIN: (202.1-198.5)*42 = +151.2, -5 = +146
  t("T046","TSLA","buy","2024-02-13T15:00Z","2024-02-13T15:52Z",198.5,202.1,42,5,"TD Ameritrade","equities"),
  // T047  BTC long WIN: (45700-44900)*0.22 = +176, -14 = +162
  t("T047","BTCUSDT","long","2024-02-14T09:00Z","2024-02-14T13:00Z",44900,45700,0.22,14,"Binance","crypto"),
  // T048  BTC long LOSS — oversize after 5-win streak (T043-T047), 2× base
  // 0.45 BTC * $45,800 = $20,610 notional
  t("T048","BTCUSDT","long","2024-02-14T14:00Z","2024-02-14T16:30Z",45800,45100,0.45,28,"Binance","crypto"),
  // T049  ETH short WIN: (2330-2290)*4 = +160, -12 = +148
  t("T049","ETHUSDT","short","2024-02-15T09:00Z","2024-02-15T11:30Z",2330,2290,4.0,12,"Binance","crypto"),
  // T050  SOL short WIN: (108.2-106.0)*80 = +176, -8 = +168
  t("T050","SOLUSDT","short","2024-02-15T12:00Z","2024-02-15T14:00Z",108.2,106.0,80,8,"Bybit","crypto"),
  // T051  BTC long WIN: (46100-45100)*0.22 = +220, -14 = +206
  t("T051","BTCUSDT","long","2024-02-16T09:00Z","2024-02-16T15:00Z",45100,46100,0.22,14,"Binance","crypto"),
  // T052  ETH long WIN: (2390-2340)*4 = +200, -12 = +188
  t("T052","ETHUSDT","long","2024-02-19T09:30Z","2024-02-19T12:30Z",2340,2390,4.0,12,"Binance","crypto"),
  // T053  AAPL buy LOSS: (184.2-186.0)*54 = -97.2, -4 = -101
  t("T053","AAPL","buy","2024-02-20T14:30Z","2024-02-20T15:48Z",186.0,184.2,54,4,"TD Ameritrade","equities"),
  // T054  BTC short WIN: (46200-45800)*0.22 = +88, -14 = +74
  t("T054","BTCUSDT","short","2024-02-20T16:00Z","2024-02-20T17:15Z",46200,45800,0.22,14,"Binance","crypto"),
  // T055  SOL long WIN: (112.8-107.5)*80 = +424, -8 = +416
  t("T055","SOLUSDT","long","2024-02-21T09:00Z","2024-02-21T13:30Z",107.5,112.8,80,8,"Bybit","crypto"),

  // ── March 2024 ────────────────────────────────────────────────────────────
  // T056  BTC long WIN: (62400-61000)*0.22 = +308, -14 = +294 (BTC pumped)
  t("T056","BTCUSDT","long","2024-03-01T09:00Z","2024-03-01T14:00Z",61000,62400,0.22,14,"Binance","crypto"),
  // T057  ETH long LOSS: (3390-3420)*4 = -120, -12 = -132
  t("T057","ETHUSDT","long","2024-03-01T15:00Z","2024-03-01T17:00Z",3420,3390,4.0,12,"Binance","crypto"),
  // T058  SOL long WIN: (131.5-126.0)*80 = +440, -8 = +432
  t("T058","SOLUSDT","long","2024-03-04T09:00Z","2024-03-04T12:30Z",126.0,131.5,80,8,"Bybit","crypto"),
  // T059  BTC short LOSS: (62500-63100)*0.22 = -132, -14 = -146
  t("T059","BTCUSDT","short","2024-03-04T13:00Z","2024-03-04T15:30Z",62500,63100,0.22,14,"Binance","crypto"),
  // T060  ETH short WIN: (3450-3380)*4 = +280, -12 = +268
  t("T060","ETHUSDT","short","2024-03-05T09:15Z","2024-03-05T11:45Z",3450,3380,4.0,12,"Binance","crypto"),
  // T061  BTC long WIN: (64200-63000)*0.22 = +264, -14 = +250
  t("T061","BTCUSDT","long","2024-03-05T12:00Z","2024-03-05T16:00Z",63000,64200,0.22,14,"Binance","crypto"),
  // T062  TSLA buy WIN: (178.6-175.2)*42 = +142.8, -5 = +138
  t("T062","TSLA","buy","2024-03-05T15:30Z","2024-03-05T15:58Z",175.2,178.6,42,5,"TD Ameritrade","equities"),
  // T063  SOL short WIN: (134.0-131.2)*80 = +224, -8 = +216
  t("T063","SOLUSDT","short","2024-03-06T09:00Z","2024-03-06T11:00Z",134.0,131.2,80,8,"Bybit","crypto"),
  // T064  BTC long WIN: (64800-64000)*0.22 = +176, -14 = +162
  t("T064","BTCUSDT","long","2024-03-06T12:30Z","2024-03-06T16:00Z",64000,64800,0.22,14,"Binance","crypto"),
  // T065  ETH long WIN: (3560-3490)*4 = +280, -12 = +268
  t("T065","ETHUSDT","long","2024-03-07T09:00Z","2024-03-07T14:00Z",3490,3560,4.0,12,"Binance","crypto"),
  // T066  BTC short LOSS: (64800-65400)*0.22 = -132, -14 = -146
  t("T066","BTCUSDT","short","2024-03-07T15:00Z","2024-03-07T17:00Z",65200,65800,0.22,14,"Binance","crypto"),
  // T067  SOL long WIN: (136.8-132.5)*80 = +344, -8 = +336
  t("T067","SOLUSDT","long","2024-03-08T09:00Z","2024-03-08T13:00Z",132.5,136.8,80,8,"Bybit","crypto"),
  // T068  AAPL buy WIN: (171.4-169.8)*54 = +86.4, -4 = +82
  t("T068","AAPL","buy","2024-03-08T15:00Z","2024-03-08T15:50Z",169.8,171.4,54,4,"TD Ameritrade","equities"),
  // T069  BTC long WIN: (67800-66400)*0.22 = +308, -14 = +294
  t("T069","BTCUSDT","long","2024-03-11T09:00Z","2024-03-11T15:00Z",66400,67800,0.22,14,"Binance","crypto"),
  // T070  BTC long WIN — oversize after 5-win run (T060-T069), 2× base
  // 0.45 BTC * $67,900 = $30,555 notional
  t("T070","BTCUSDT","long","2024-03-11T16:00Z","2024-03-11T17:30Z",67900,68900,0.45,28,"Binance","crypto"),
  // T071  ETH short WIN: (3620-3580)*4 = +160, -12 = +148
  t("T071","ETHUSDT","short","2024-03-12T09:00Z","2024-03-12T11:30Z",3620,3580,4.0,12,"Binance","crypto"),
  // T072  SOL long WIN: (153.5-148.0)*80 = +440, -8 = +432
  t("T072","SOLUSDT","long","2024-03-12T12:00Z","2024-03-12T15:30Z",148.0,153.5,80,8,"Bybit","crypto"),
  // T073  BTC short WIN: (68500-67900)*0.22 = +132, -14 = +118
  t("T073","BTCUSDT","short","2024-03-13T09:00Z","2024-03-13T12:00Z",68500,67900,0.22,14,"Binance","crypto"),
  // T074  ETH long LOSS: (3560-3590)*4 = -120, -12 = -132
  t("T074","ETHUSDT","long","2024-03-13T13:00Z","2024-03-13T16:00Z",3590,3560,4.0,12,"Binance","crypto"),
  // T075  SOL short WIN: (152.0-149.5)*80 = +200, -8 = +192
  t("T075","SOLUSDT","short","2024-03-14T09:00Z","2024-03-14T11:00Z",152.0,149.5,80,8,"Bybit","crypto"),
  // T076  BTC long WIN: (68400-67600)*0.22 = +176, -14 = +162
  t("T076","BTCUSDT","long","2024-03-14T12:00Z","2024-03-14T16:30Z",67600,68400,0.22,14,"Binance","crypto"),
  // T077  TSLA buy WIN: (176.8-172.5)*42 = +180.6, -5 = +176
  t("T077","TSLA","buy","2024-03-15T14:30Z","2024-03-15T15:55Z",172.5,176.8,42,5,"TD Ameritrade","equities"),
  // T078  BTC long WIN: (69100-68200)*0.22 = +198, -14 = +184
  t("T078","BTCUSDT","long","2024-03-18T09:00Z","2024-03-18T14:00Z",68200,69100,0.22,14,"Binance","crypto"),
  // T079  ETH short LOSS: (3580-3610)*4 = -120, -12 = -132
  t("T079","ETHUSDT","short","2024-03-19T09:30Z","2024-03-19T12:00Z",3580,3610,4.0,12,"Binance","crypto"),
  // T080  BTC long WIN: (70800-69500)*0.22 = +286, -14 = +272
  t("T080","BTCUSDT","long","2024-03-20T09:00Z","2024-03-20T15:00Z",69500,70800,0.22,14,"Binance","crypto"),
];
