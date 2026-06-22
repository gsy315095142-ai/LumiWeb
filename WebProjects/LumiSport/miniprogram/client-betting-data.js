/**
 * LumiSport 客户端 - 竞猜/报名 演示数据与状态
 */

// 比赛数据（竞猜用）
var matchData = [
  { id:'m1', game:'⚔️ 雷霆击剑', time:'21:45', zone:'雷霆击剑厅', phase:'betting', red:'战神阿飞', blue:'疾风小刀', redOdds:1.80, blueOdds:2.00 },
  { id:'m2', game:'🔥 烈焰拳王', time:'22:15', zone:'烈焰拳王厅', phase:'betting', red:'北地枪王', blue:'深海巨鲨', redOdds:1.50, blueOdds:2.00 },
  { id:'m3', game:'🏒 疾速冰球', time:'21:30', zone:'疾速冰球厅', phase:'playing',  red:'荒野狼王', blue:'雷霆少年', redOdds:1.65, blueOdds:2.10 },
  { id:'m4', game:'⚔️ 雷霆击剑', time:'21:00', zone:'雷霆击剑厅', phase:'settled', red:'龙之影',   blue:'鹰眼猎手', redOdds:1.70, blueOdds:1.95, winner:'red' }
];

// 选手统计数据
var playerStats = {
  '战神阿飞':   { points:1250, wins:34, losses:16, recent:['win','win','lose','win','win'],   zone:'雷霆击剑厅', side:'red'  },
  '疾风小刀':   { points:980,  wins:28, losses:20, recent:['win','lose','win','lose','win'], zone:'雷霆击剑厅', side:'blue' },
  '北地枪王':   { points:1520, wins:42, losses:12, recent:['win','win','win','lose','win'],  zone:'烈焰拳王厅', side:'red'  },
  '深海巨鲨':   { points:1100, wins:30, losses:22, recent:['lose','win','win','win','lose'], zone:'烈焰拳王厅', side:'blue' },
  '荒野狼王':   { points:860,  wins:22, losses:18, recent:['win','lose','lose','win','win'], zone:'疾速冰球厅', side:'red'  },
  '雷霆少年':   { points:720,  wins:18, losses:14, recent:['lose','win','win','lose','win'], zone:'疾速冰球厅', side:'blue' },
  '龙之影':     { points:1350, wins:38, losses:10, recent:['win','win','win','win','lose'],  zone:'雷霆击剑厅', side:'red'  },
  '鹰眼猎手':   { points:1050, wins:26, losses:24, recent:['lose','win','lose','win','win'], zone:'雷霆击剑厅', side:'blue' }
};

// 每厅报名基础信息（项目、报名费）。报名费 200 💰，报名扣费，取消退还
var signupInfo = {
  '疾速冰球厅': { game:'🏒 疾速冰球', fee:200 },
  '雷霆击剑厅': { game:'⚔️ 雷霆击剑', fee:200 },
  '烈焰拳王厅': { game:'🔥 烈焰拳王', fee:200 }
};

// 各厅报名队列（命名选手，赛场 tab 与管理端区域管理共享同一数据源）
var signupQueues = {
  '疾速冰球厅': [
    { name:'荒野狼王', time:'21:10:00', side:'red'  },
    { name:'雷霆少年', time:'21:11:05', side:'blue' },
    { name:'冰刃飞将', time:'21:12:30', side:null   },
    { name:'极地风暴', time:'21:14:10', side:null   },
    { name:'寒霜之刃', time:'21:15:48', side:null   },
    { name:'银甲游侠', time:'21:17:22', side:null   },
    { name:'疾风骑士', time:'21:19:05', side:null   },
    { name:'雪原猎手', time:'21:20:41', side:null   }
  ],
  '雷霆击剑厅': [
    { name:'战神阿飞', time:'21:25:00', side:'red'  },
    { name:'疾风小刀', time:'21:26:05', side:'blue' },
    { name:'小明',     time:'21:15:32', side:null   },
    { name:'阿强',     time:'21:16:05', side:null   },
    { name:'大飞',     time:'21:17:41', side:null   },
    { name:'剑影无双', time:'21:18:50', side:null   }
  ],
  '烈焰拳王厅': [
    { name:'北地枪王', time:'21:30:00', side:null   },
    { name:'深海巨鲨', time:'21:31:00', side:null   },
    { name:'烈焰拳神', time:'21:32:15', side:null   },
    { name:'铁拳豪杰', time:'21:33:40', side:null   },
    { name:'狂暴战熊', time:'21:35:02', side:null   },
    { name:'赤焰武僧', time:'21:36:28', side:null   },
    { name:'霹雳火',   time:'21:38:00', side:null   }
  ]
};

// 当前报名状态（切厅不丢失）
var mySignup = null; // { game, zone, fee }

// 当前用户游戏币余额（演示用，报名扣费/取消退还）
var myGameCoin = 1250;

// 当前用户兑换值余额（演示用，兑换商品扣减）
var myExchangeCoin = 340;

// 我已下注记录（按场次累计，红/蓝分别累计），下注确认后持久显示
var myBets = {}; // { mid: { red:金额, blue:金额 } }

// 竞猜记录（真实数据来源，预言家段位与胜率均由此计算）
// coin：未猜中时消耗的游戏币（负数）；猜中时仅展示 ex（兑换值奖励，不返还游戏币）
var betRecords = [
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-12', time:'20:32', red:'龙之影',   blue:'鹰眼猎手', result:'win',  coin:-100, ex:170 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-12', time:'20:08', red:'战神阿飞', blue:'疾风小刀', result:'lose', coin:-100, ex:0 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-12', time:'19:45', red:'北地枪王', blue:'深海巨鲨', result:'win',  coin:-100, ex:150 },
  { game:'🏒 疾速冰球', zone:'疾速冰球厅', date:'2026-06-12', time:'19:20', red:'荒野狼王', blue:'雷霆少年', result:'win',  coin:-100, ex:130 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-11', time:'21:50', red:'鹰眼猎手', blue:'龙之影',   result:'lose', coin:-80, ex:0 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-11', time:'21:10', red:'深海巨鲨', blue:'北地枪王', result:'win',  coin:-100, ex:160 },
  { game:'🏒 疾速冰球', zone:'疾速冰球厅', date:'2026-06-11', time:'20:30', red:'雷霆少年', blue:'荒野狼王', result:'win',  coin:-100, ex:120 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-11', time:'19:55', red:'战神阿飞', blue:'疾风小刀', result:'win',  coin:-100, ex:140 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-10', time:'21:30', red:'北地枪王', blue:'深海巨鲨', result:'lose', coin:-100, ex:0 },
  { game:'🏒 疾速冰球', zone:'疾速冰球厅', date:'2026-06-10', time:'20:45', red:'荒野狼王', blue:'雷霆少年', result:'win',  coin:-100, ex:110 },
  { game:'⚔️ 雷霆击剑', zone:'雷霆击剑厅', date:'2026-06-10', time:'20:00', red:'龙之影',   blue:'鹰眼猎手', result:'win',  coin:-100, ex:180 },
  { game:'🔥 烈焰拳王', zone:'烈焰拳王厅', date:'2026-06-09', time:'21:15', red:'深海巨鲨', blue:'北地枪王', result:'lose', coin:-90, ex:0 }
];

// 预言家段位（按累计竞猜场次划分，min 为进入该段位所需场次）
var prophetTiers = [
  { name:'青铜预言家', icon:'🥉', min:0 },
  { name:'白银预言家', icon:'🥈', min:5 },
  { name:'黄金预言家', icon:'🥇', min:15 },
  { name:'铂金预言家', icon:'💠', min:30 },
  { name:'钻石预言家', icon:'💎', min:60 }
];

// 兑换记录
var exchangeRecords = [
  { time:'2025-01-15 21:30', item:'🍸 特调鸡尾酒', store:'兰陵酒吧', cost:80 },
  { time:'2025-01-14 19:00', item:'🥃 威士忌 Shot', store:'兰陵酒吧', cost:50 },
  { time:'2025-01-13 22:15', item:'🍷 红酒一杯', store:'啤酒公社', cost:60 }
];

// 门店切换（客户端首页 Banner）
var clientStore = '🏡 兰陵酒吧';
var clientStores = ['🏡 兰陵酒吧', '🍺 啤酒公社', '✨ 星光酒廊'];

// Banner 广告：按 门店 + 大厅 组合匹配，缺失大厅时用门店级兜底
var storeAds = {
  '🏡 兰陵酒吧': {
    hotel: { badge:'🏨 兰陵大酒店', title:'住客专享 · 入住即送1000游戏币', desc:'前台领取实体筹码，扫码兑换即时到账' },
    tag: '今夜精彩赛事 · 参与竞猜赢好礼',
    zones: {
      '疾速冰球厅': '🏒 疾速冰球 · 今晚 21:30 开赛',
      '雷霆击剑厅': '⚔️ 雷霆击剑 · 新手报名立减 50',
      '烈焰拳王厅': '🔥 烈焰拳王 · 冠军竞猜赢双倍'
    }
  },
  '🍺 啤酒公社': {
    hotel: { badge:'🏨 公社精酿酒店', title:'住客专享 · 畅饮套餐送500游戏币', desc:'凭房卡到吧台领取，竞猜赢取兑换值' },
    tag: '畅饮 + 竞猜 · 嗨爆今夜',
    zones: {
      '疾速冰球厅': '🍺 啤酒公社 · 冰球之夜精酿特惠',
      '雷霆击剑厅': '🍺 啤酒公社 · 击剑对决配冰啤',
      '烈焰拳王厅': '🍺 啤酒公社 · 拳王之夜买一送一'
    }
  },
  '✨ 星光酒廊': {
    hotel: { badge:'🏨 星光国际酒店', title:'住客专享 · 入住即享888游戏币', desc:'扫码即时到账，赛事竞猜赢豪礼' },
    tag: '星光璀璨 · 竞猜赢大奖',
    zones: {
      '疾速冰球厅': '✨ 星光酒廊 · 冰球星光夜',
      '雷霆击剑厅': '✨ 星光酒廊 · 剑指巅峰盛典',
      '烈焰拳王厅': '✨ 星光酒廊 · 烈焰拳王之夜'
    }
  }
};
