/* 荣誉殿堂 · 历届内测冠军数据
 * 新增一届：在数组顶部追加一条即可。
 * games：本届实际举办的玩法（顺序即展示顺序）。
 * champions：各玩法冠军姓名。
 * runners：各玩法第二名/守擂方姓名（可选）；runnerLabel 控制其显示名称。
 */
const GAME_TYPES = {
  hockey:  { icon: '🏒', name: '疾速冰球', accent: '#00e0ff', accentBg: 'rgba(0, 224, 255, 0.10)' },
  boxing:  { icon: '🥊', name: '烈焰拳王', accent: '#ff7a3d', accentBg: 'rgba(255, 122, 61, 0.10)' },
  fencing: { icon: '🤺', name: '雷霆击剑', accent: '#9a7dff', accentBg: 'rgba(154, 125, 255, 0.10)' },
};

const EDITIONS = [
  {
    edition: 3,
    title: 'LUMI杯 XR BBQ 小联欢',
    date: '2026-06-26',
    format: '冠军挑战赛',
    runnerLabel: '守擂方',
    games: ['hockey', 'boxing', 'fencing'],
    champions: { hockey: '曾宗柱', boxing: '潘总', fencing: '吴暑生' },
    runners:   { hockey: '陈俊豪', boxing: '管艳萍', fencing: '黄志炜' },
  },
  {
    edition: 2,
    title: 'LUMI杯 XR BBQ 竞技之夜',
    date: '2026-06-18',
    format: '八强争霸赛',
    runnerLabel: '亚军',
    games: ['hockey', 'boxing', 'fencing'],
    champions: { hockey: '陈俊豪', boxing: '张智涵', fencing: '黄志炜' },
    runners:   { hockey: '钟泽宇', boxing: '管艳萍', fencing: '童林婧' },
  },
  {
    edition: 1,
    title: 'LUMI杯 XR 竞技 PK 赛',
    date: '2025-09-26',
    format: '十六强争霸赛',
    runnerLabel: '亚军',
    games: ['hockey'],
    champions: { hockey: '冯启文' },
    runners:   { hockey: '李登耀' },
  },
];
