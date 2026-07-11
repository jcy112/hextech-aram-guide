const fs = require('fs');
const path = require('path');

// ===== CHAMPION MECHANIC PROFILES =====
// Each champion has specific mechanical traits beyond just their role
// These determine which augments are suitable

const championMechanics = {
  // === MARKSMEN ===
  graves: { // Slow AS, burst-based shotgun, crit-reliant reload
    traits: ['burst_crit', 'burst_ad', 'spell_weaving', 'close_range', 'aoe'],
    anti: ['attack_speed', 'onhit'], // Anti-synergy: AS doesn't benefit much
    builds: [
      { type: 'ad', name: '暴击秒杀流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '无尽之刃'], full: ['幽梦之灵', '明朗之靴', '收集者', '无尽之刃', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  vayne: {
    traits: ['attack_speed', 'onhit', 'maxhp_damage', 'short_range', 'mobility', 'tank_killer'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速特效流', skillOrder: '主W副Q', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '智慧末刃', '守护天使'] },
    ]
  },
  jinx: {
    traits: ['attack_speed', 'crit', 'aoe', 'reset_on_kill', 'long_range_rockets'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击火炮流', skillOrder: '主Q副W', core: ['无尽之刃', '卢安娜的飓风', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '卢安娜的飓风', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  caitlyn: {
    traits: ['crit', 'long_range', 'burst_ad', 'headshot', 'traps'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '暴击爆头流', skillOrder: '主Q副W', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  jhin: {
    traits: ['burst_crit', 'fixed_attack_speed', 'long_range', 'execute', 'spell_weaving'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ad', name: '暴击一枪流', skillOrder: '主Q副W', core: ['无尽之刃', '收集者', '疾射火炮'], full: ['无尽之刃', '疾射火炮', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  draven: {
    traits: ['burst_crit', 'ad_caster', 'reset_mobility', 'catch_axe'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '暴击飞斧流', skillOrder: '主Q副W', core: ['无尽之刃', '收集者', '饮血剑'], full: ['无尽之刃', '狂战士胫甲', '收集者', '饮血剑', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  ashe: {
    traits: ['attack_speed', 'crit', 'onhit_slow', 'utility', 'long_range'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击攻速流', skillOrder: '主W副Q', core: ['无尽之刃', '卢安娜的飓风', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '卢安娜的飓风', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  missfortune: {
    traits: ['burst_crit', 'ad_caster', 'aoe', 'channel_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '穿甲大招流', skillOrder: '主Q副W', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  ezreal: {
    traits: ['ad_caster', 'spell_weaving', 'onhit_spells', 'mobility', 'long_range_skillshot'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '技能射手流', skillOrder: '主Q副E', core: ['魔宗', '三相之力', '赛瑞尔达的怨恨'], full: ['魔宗', '明朗之靴', '三相之力', '赛瑞尔达的怨恨', '贪欲九头蛇', '守护天使'] },
    ]
  },
  lucian: {
    traits: ['ad_caster', 'spell_weaving', 'mobility', 'short_range', 'burst_crit'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击连射流', skillOrder: '主Q副E', core: ['无尽之刃', '纳沃利迅刃', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '纳沃利迅刃', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  kaisa: {
    traits: ['attack_speed', 'onhit', 'hybrid_damage', 'mobility', 'evolve'],
    anti: [],
    builds: [
      { type: 'hybrid', name: '混伤进化流', skillOrder: '主Q副E', core: ['鬼索的狂暴之刃', '纳什之牙', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '纳什之牙', '界弓', '中娅沙漏', '守护天使'] },
    ]
  },
  varus: {
    traits: ['attack_speed', 'onhit', 'maxhp_damage', 'ad_caster', 'ap_scaling', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速特效流', skillOrder: '主W副Q', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '智慧末刃', '守护天使'] },
      { type: 'ap', name: 'AP枯萎箭', skillOrder: '主W副Q', core: ['纳什之牙', '灭世者的死亡之帽', '虚空之杖'], full: ['纳什之牙', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  xayah: {
    traits: ['crit', 'aoe', 'attack_speed', 'cc_ult', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击羽毛流', skillOrder: '主E副W', core: ['无尽之刃', '纳沃利迅刃', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '纳沃利迅刃', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  sivir: {
    traits: ['crit', 'aoe', 'attack_speed', 'spell_weaving', 'ricochet'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击弹射流', skillOrder: '主Q副W', core: ['无尽之刃', '纳沃利迅刃', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '纳沃利迅刃', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  twitch: {
    traits: ['attack_speed', 'onhit', 'crit', 'aoe', 'stealth', 'long_range_ult'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击毒液流', skillOrder: '主E副Q', core: ['无尽之刃', '卢安娜的飓风', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '卢安娜的飓风', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  tristana: {
    traits: ['attack_speed', 'crit', 'burst_crit', 'reset_mobility', 'long_range'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击拆塔流', skillOrder: '主E副Q', core: ['无尽之刃', '纳沃利迅刃', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '纳沃利迅刃', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  kalista: {
    traits: ['attack_speed', 'onhit', 'mobility', 'execute', 'maxhp_damage'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速跳跃流', skillOrder: '主E副Q', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '智慧末刃', '守护天使'] },
    ]
  },
  kogmaw: {
    traits: ['attack_speed', 'onhit', 'maxhp_damage', 'long_range', 'hybrid_damage', 'ap_scaling'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速融化流', skillOrder: '主W副Q', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '卢安娜的飓风', '守护天使'] },
      { type: 'ap', name: 'AP口水炮', skillOrder: '主E副Q', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  aphelios: {
    traits: ['crit', 'attack_speed', 'spell_weaving', 'lifesteal', 'aoe'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击武器流', skillOrder: '主攻击力副攻速', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  smolder: {
    traits: ['ad_caster', 'spell_weaving', 'stacking', 'execute', 'mobility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '技能叠层流', skillOrder: '主Q副W', core: ['魔宗', '三相之力', '赛瑞尔达的怨恨'], full: ['魔宗', '明朗之靴', '三相之力', '赛瑞尔达的怨恨', '贪欲九头蛇', '守护天使'] },
    ]
  },
  zeri: {
    traits: ['attack_speed', 'crit', 'mobility', 'spell_weaving', 'onhit_spells'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击滑步流', skillOrder: '主Q副E', core: ['无尽之刃', '卢安娜的飓风', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '卢安娜的飓风', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  samira: {
    traits: ['burst_crit', 'ad_caster', 'reset_mobility', 'aoe', 'close_range', 'lifesteal'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '暴击收割流', skillOrder: '主Q副E', core: ['无尽之刃', '收集者', '饮血剑'], full: ['无尽之刃', '狂战士胫甲', '收集者', '饮血剑', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  quinn: {
    traits: ['burst_crit', 'ad_caster', 'mobility', 'attack_speed'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击游走流', skillOrder: '主Q副W', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  akshan: {
    traits: ['crit', 'attack_speed', 'onhit', 'mobility', 'revive_passive', 'burst_ad'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击钩索流', skillOrder: '主Q副E', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  kindred: {
    traits: ['attack_speed', 'crit', 'onhit', 'mobility', 'stacking', 'healing_ult'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击印记流', skillOrder: '主Q副W', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  corki: {
    traits: ['burst_crit', 'hybrid_damage', 'ad_caster', 'mobility', 'long_range_skillshot'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '暴击导弹流', skillOrder: '主Q副E', core: ['无尽之刃', '魔宗', '多米尼克领主的致意'], full: ['无尽之刃', '法师之靴', '魔宗', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  teemo: {
    traits: ['attack_speed', 'onhit', 'ap_scaling', 'traps', 'dot'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速毒箭流', skillOrder: '主E副Q', core: ['纳什之牙', '鬼索的狂暴之刃', '界弓'], full: ['纳什之牙', '狂战士胫甲', '鬼索的狂暴之刃', '界弓', '灭世者的死亡之帽', '中娅沙漏'] },
      { type: 'ap', name: 'AP蘑菇流', skillOrder: '主Q副E', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  senna: {
    traits: ['burst_crit', 'long_range', 'healing', 'stacking', 'utility', 'ad_caster'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '暴击穿甲流', skillOrder: '主Q副W', core: ['无尽之刃', '疾射火炮', '多米尼克领主的致意'], full: ['无尽之刃', '疾射火炮', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },

  // === MAGES ===
  lux: {
    traits: ['ap_caster', 'burst_ap', 'long_range_skillshot', 'cc', 'shield'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP爆发流', skillOrder: '主E副Q', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  veigar: {
    traits: ['ap_caster', 'burst_ap', 'stacking', 'cc_cage', 'execute'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP无限成长流', skillOrder: '主Q副W', core: ['灭世者的死亡之帽', '虚空之杖', '中娅沙漏'], full: ['灭世者的死亡之帽', '法师之靴', '虚空之杖', '中娅沙漏', '莫雷洛秘典', '女妖面纱'] },
    ]
  },
  syndra: {
    traits: ['ap_caster', 'burst_ap', 'stacking', 'cc', 'execute_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP球女爆发流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  viktor: {
    traits: ['ap_caster', 'burst_ap', 'aoe', 'dot', 'zone_control', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP进化流', skillOrder: '主E副Q', core: ['卢登的伙伴', '巫妖之祸', '灭世者的死亡之帽'], full: ['卢登的伙伴', '法师之靴', '巫妖之祸', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏'] },
    ]
  },
  xerath: {
    traits: ['ap_caster', 'burst_ap', 'long_range_skillshot', 'spell_weaving'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP远程炮台流', skillOrder: '主Q副W', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '视界专注'] },
    ]
  },
  velkoz: {
    traits: ['ap_caster', 'burst_ap', 'true_damage', 'spell_weaving', 'channel_ult', 'long_range_skillshot'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP真伤激光流', skillOrder: '主Q副W', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '视界专注'] },
    ]
  },
  ziggs: {
    traits: ['ap_caster', 'burst_ap', 'aoe', 'long_range_skillshot', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP炸弹流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '视界专注'] },
    ]
  },
  brand: {
    traits: ['ap_caster', 'dot', 'maxhp_damage', 'aoe', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP灼烧流', skillOrder: '主W副Q', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  zyra: {
    traits: ['ap_caster', 'dot', 'cc', 'zone_control', 'summons'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP植物控场流', skillOrder: '主E副Q', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  karma: {
    traits: ['ap_caster', 'spell_weaving', 'shield', 'cc', 'mobility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP强化Q流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  annie: {
    traits: ['ap_caster', 'burst_ap', 'cc', 'shield', 'summons_tibbers'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP熊爆发流', skillOrder: '主Q副W', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  fiddlesticks: {
    traits: ['ap_caster', 'burst_ap', 'aoe', 'channel_ult', 'healing', 'cc_fear'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP跳大恐惧流', skillOrder: '主W副Q', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  karthus: {
    traits: ['ap_caster', 'burst_ap', 'aoe', 'global_ult', 'dot'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP全图大招流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  kassadin: {
    traits: ['ap_assassin', 'burst_ap', 'mobility', 'spell_weaving', 'scaling'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP跳杀流', skillOrder: '主Q副E', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  leblanc: {
    traits: ['ap_assassin', 'burst_ap', 'mobility', 'spell_weaving'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP秒杀流', skillOrder: '主W副Q', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  akali: {
    traits: ['ap_assassin', 'burst_ap', 'mobility', 'spell_weaving', 'energy'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP忍者流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  ekko: {
    traits: ['ap_assassin', 'burst_ap', 'mobility', 'spell_weaving', 'healing_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP时空流', skillOrder: '主Q副E', core: ['巫妖之祸', '灭世者的死亡之帽', '虚空之杖'], full: ['巫妖之祸', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '纳什之牙'] },
    ]
  },
  katarina: {
    traits: ['ap_assassin', 'burst_ap', 'reset_on_kill', 'mobility', 'aoe', 'channel_ult', 'onhit_spells'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP收割流', skillOrder: '主Q副E', core: ['纳什之牙', '灭世者的死亡之帽', '虚空之杖'], full: ['纳什之牙', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  fizz: {
    traits: ['ap_assassin', 'burst_ap', 'mobility', 'spell_weaving', 'onhit_spells'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP鲨鱼流', skillOrder: '主E副W', core: ['巫妖之祸', '灭世者的死亡之帽', '虚空之杖'], full: ['巫妖之祸', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  diana: {
    traits: ['ap_fighter', 'burst_ap', 'mobility', 'aoe', 'attack_speed', 'onhit'],
    anti: [],
    builds: [
      { type: 'ap', name: 'AP月女流', skillOrder: '主Q副W', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '纳什之牙'] },
    ]
  },
  sylas: {
    traits: ['ap_fighter', 'burst_ap', 'mobility', 'healing', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP偷大流', skillOrder: '主W副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  ahri: {
    traits: ['ap_caster', 'burst_ap', 'mobility', 'spell_weaving', 'healing_passive'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP魅惑流', skillOrder: '主Q副W', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  anivia: {
    traits: ['ap_caster', 'zone_control', 'aoe', 'cc', 'channel_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP暴风雪流', skillOrder: '主E副Q', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  aurelionsol: {
    traits: ['ap_caster', 'stacking', 'aoe', 'dot', 'spell_weaving'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP星尘流', skillOrder: '主Q副W', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  azir: {
    traits: ['ap_caster', 'attack_speed', 'onhit_spells', 'zone_control', 'mobility', 'summons'],
    anti: [],
    builds: [
      { type: 'ap', name: 'AP沙兵流', skillOrder: '主Q副W', core: ['纳什之牙', '灭世者的死亡之帽', '虚空之杖'], full: ['纳什之牙', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  cassiopeia: {
    traits: ['ap_caster', 'dot', 'spell_weaving', 'healing', 'cc_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP毒蛇流', skillOrder: '主E副Q', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  hwei: {
    traits: ['ap_caster', 'spell_weaving', 'aoe', 'cc', 'utility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP画师流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '视界专注'] },
    ]
  },
  lissandra: {
    traits: ['ap_caster', 'burst_ap', 'cc', 'aoe', 'mobility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP冰女流', skillOrder: '主Q副W', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  malzahar: {
    traits: ['ap_caster', 'dot', 'cc_suppress', 'spell_weaving', 'summons'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP压制流', skillOrder: '主E副Q', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  neeko: {
    traits: ['ap_caster', 'burst_ap', 'cc', 'aoe', 'trickster'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP开花流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  orianna: {
    traits: ['ap_caster', 'spell_weaving', 'aoe', 'shield', 'cc_ult', 'zone_control'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP球女流', skillOrder: '主Q副W', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  rumble: {
    traits: ['ap_fighter', 'ap_caster', 'dot', 'aoe', 'zone_control', 'spell_weaving'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP火焰流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  ryze: {
    traits: ['ap_caster', 'spell_weaving', 'burst_ap', 'scaling_mana', 'mobility_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP法术机关枪', skillOrder: '主Q副E', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  swain: {
    traits: ['ap_fighter', 'ap_caster', 'healing', 'aoe', 'cc', 'dot'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP吸血乌鸦', skillOrder: '主Q副W', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  taliyah: {
    traits: ['ap_caster', 'spell_weaving', 'cc', 'zone_control', 'mobility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP岩石流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  twistedfate: {
    traits: ['ap_caster', 'burst_ap', 'attack_speed', 'cc', 'global_ult', 'onhit'],
    anti: [],
    builds: [
      { type: 'ap', name: 'AP黄牌流', skillOrder: '主Q副W', core: ['巫妖之祸', '灭世者的死亡之帽', '虚空之杖'], full: ['巫妖之祸', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '疾射火炮'] },
      { type: 'ad', name: 'AD攻速流', skillOrder: '主W副E', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '智慧末刃', '守护天使'] },
    ]
  },
  veigar: {
    traits: ['ap_caster', 'burst_ap', 'stacking', 'cc_cage', 'execute'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP无限成长流', skillOrder: '主Q副W', core: ['灭世者的死亡之帽', '虚空之杖', '中娅沙漏'], full: ['灭世者的死亡之帽', '法师之靴', '虚空之杖', '中娅沙漏', '莫雷洛秘典', '女妖面纱'] },
    ]
  },
  vex: {
    traits: ['ap_caster', 'burst_ap', 'cc', 'reset_mobility', 'anti_dash'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP恐惧流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '视界专注'] },
    ]
  },
  vladimir: {
    traits: ['ap_fighter', 'burst_ap', 'healing', 'aoe', 'spell_weaving', 'untargetable'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP吸血鬼流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  zoe: {
    traits: ['ap_caster', 'burst_ap', 'long_range_skillshot', 'spell_weaving', 'mobility'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP飞星流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '视界专注'] },
    ]
  },
  seraphine: {
    traits: ['ap_caster', 'aoe', 'cc', 'healing', 'shield', 'utility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP歌姬流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '炽热香炉'] },
    ]
  },
  morgana: {
    traits: ['ap_caster', 'cc', 'aoe', 'shield', 'dot', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP禁锢流', skillOrder: '主Q副W', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  heimerdinger: {
    traits: ['ap_caster', 'zone_control', 'summons', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP炮台流', skillOrder: '主Q副W', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  kayle: {
    traits: ['attack_speed', 'onhit', 'ap_scaling', 'hybrid_damage', 'healing', 'invulnerable_ult', 'scaling'],
    anti: [],
    builds: [
      { type: 'ap', name: 'AP天使流', skillOrder: '主Q副E', core: ['纳什之牙', '灭世者的死亡之帽', '虚空之杖'], full: ['纳什之牙', '狂战士胫甲', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  kennen: {
    traits: ['ap_caster', 'burst_ap', 'aoe', 'cc', 'energy'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP万雷天牢', skillOrder: '主Q副W', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '莫雷洛秘典'] },
    ]
  },
  mel: {
    traits: ['ap_caster', 'burst_ap', 'spell_weaving', 'reflect', 'execute'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP反弹流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  aurora: {
    traits: ['ap_caster', 'burst_ap', 'mobility', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP兔子流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  elise: {
    traits: ['ap_assassin', 'burst_ap', 'mobility', 'spell_weaving', 'onhit_spells', 'spider_form'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP蜘蛛流', skillOrder: '主Q副W', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  evelynn: {
    traits: ['ap_assassin', 'burst_ap', 'stealth', 'execute_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP隐身流', skillOrder: '主Q副E', core: ['巫妖之祸', '灭世者的死亡之帽', '虚空之杖'], full: ['巫妖之祸', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  nidalee: {
    traits: ['ap_assassin', 'burst_ap', 'long_range_skillshot', 'mobility', 'healing', 'spell_weaving'],
    anti: ['attack_speed', 'onhit'],
    builds: [
      { type: 'ap', name: 'AP标枪流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  qiyana: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'cc', 'aoe_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD刺客流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  talon: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'spell_weaving', 'stealth_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD刀锋流', skillOrder: '主W副Q', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  zed: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'spell_weaving', 'energy'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD影杀流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  khazix: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'stealth', 'isolation_damage'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD螳螂流', skillOrder: '主Q副W', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  rengar: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'stealth', 'attack_speed'],
    anti: [],
    builds: [
      { type: 'assassin', name: 'AD狮子流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '多米尼克领主的致意'], full: ['幽梦之灵', '明朗之靴', '收集者', '多米尼克领主的致意', '夜之锋刃', '守护天使'] },
    ]
  },
  shaco: {
    traits: ['ad_assassin', 'burst_ad', 'stealth', 'cc', 'onhit', 'backstab'],
    anti: [],
    builds: [
      { type: 'assassin', name: 'AD小丑流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '无尽之刃'], full: ['幽梦之灵', '狂战士胫甲', '收集者', '无尽之刃', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  naafiri: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'spell_weaving', 'summons'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD狗群流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },

  // === SUPPORTS ===
  lulu: {
    traits: ['support', 'shield', 'healing', 'cc', 'attack_speed_buff', 'utility'],
    anti: [],
    builds: [
      { type: 'support', name: '辅助保护流', skillOrder: '主E副W', core: ['炽热香炉', '月石再生器', '救赎'], full: ['炽热香炉', '明朗之靴', '月石再生器', '救赎', '米凯尔的祝福', '警觉眼石'] },
    ]
  },
  nami: {
    traits: ['support', 'healing', 'cc', 'damage_buff', 'utility'],
    anti: [],
    builds: [
      { type: 'support', name: '辅助奶妈流', skillOrder: '主W副E', core: ['月石再生器', '炽热香炉', '救赎'], full: ['月石再生器', '明朗之靴', '炽热香炉', '救赎', '米凯尔的祝福', '警觉眼石'] },
    ]
  },
  soraka: {
    traits: ['support', 'healing', 'global_heal', 'cc_silence', 'utility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助奶流', skillOrder: '主W副Q', core: ['月石再生器', '救赎', '炽热香炉'], full: ['月石再生器', '明朗之靴', '救赎', '炽热香炉', '米凯尔的祝福', '警觉眼石'] },
    ]
  },
  sona: {
    traits: ['support', 'healing', 'shield', 'damage_buff', 'cc_ult', 'aura'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助琴女流', skillOrder: '主W副Q', core: ['月石再生器', '炽热香炉', '流水法杖'], full: ['月石再生器', '明朗之靴', '炽热香炉', '流水法杖', '救赎', '警觉眼石'] },
    ]
  },
  janna: {
    traits: ['support', 'shield', 'healing', 'cc', 'mobility', 'utility'],
    anti: [],
    builds: [
      { type: 'support', name: '辅助风女流', skillOrder: '主E副W', core: ['月石再生器', '炽热香炉', '救赎'], full: ['月石再生器', '明朗之靴', '炽热香炉', '救赎', '米凯尔的祝福', '警觉眼石'] },
    ]
  },
  yuumi: {
    traits: ['support', 'healing', 'shield', 'untargetable', 'damage_buff', 'utility'],
    anti: ['attack_speed', 'mobility'],
    builds: [
      { type: 'support', name: '辅助猫猫流', skillOrder: '主E副W', core: ['月石再生器', '炽热香炉', '流水法杖'], full: ['月石再生器', '明朗之靴', '炽热香炉', '流水法杖', '救赎', '警觉眼石'] },
    ]
  },
  milio: {
    traits: ['support', 'healing', 'shield', 'damage_buff', 'cc', 'utility'],
    anti: [],
    builds: [
      { type: 'support', name: '辅助火苗流', skillOrder: '主E副W', core: ['月石再生器', '炽热香炉', '救赎'], full: ['月石再生器', '明朗之靴', '炽热香炉', '救赎', '米凯尔的祝福', '警觉眼石'] },
    ]
  },
  renata: {
    traits: ['support', 'shield', 'cc', 'damage_buff', 'revive', 'utility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助炼金流', skillOrder: '主E副W', core: ['月石再生器', '炽热香炉', '救赎'], full: ['月石再生器', '明朗之靴', '炽热香炉', '救赎', '米凯尔的祝福', '警觉眼石'] },
    ]
  },
  zilean: {
    traits: ['support', 'cc_slow', 'mobility', 'revive_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助时光流', skillOrder: '主Q副E', core: ['帝国指令', '炽热香炉', '流水法杖'], full: ['帝国指令', '明朗之靴', '炽热香炉', '流水法杖', '救赎', '警觉眼石'] },
    ]
  },
  rakan: {
    traits: ['support', 'mobility', 'cc', 'shield', 'healing', 'engage'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助洛流', skillOrder: '主W副E', core: ['帝国指令', '流水法杖', '警觉眼石'], full: ['帝国指令', '明朗之靴', '流水法杖', '炽热香炉', '救赎', '警觉眼石'] },
    ]
  },
  pyke: {
    traits: ['support_assassin', 'ad_assassin', 'burst_ad', 'mobility', 'execute', 'cc', 'stealth'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD斩杀流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '夜之锋刃'], full: ['幽梦之灵', '明朗之靴', '收集者', '夜之锋刃', '赛瑞尔达的怨恨', '守护天使'] },
    ]
  },
  thresh: {
    traits: ['support_tank', 'cc', 'engage', 'shield', 'utility', 'stacking_armor'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '坦克辅助流', skillOrder: '主Q副W', core: ['钢铁烈阳之匣', '骑士之誓', '警觉眼石'], full: ['钢铁烈阳之匣', '明朗之靴', '骑士之誓', '警觉眼石', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  bard: {
    traits: ['support', 'healing', 'cc', 'mobility', 'utility', 'stacking'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助游走流', skillOrder: '主Q副W', core: ['帝国指令', '流水法杖', '炽热香炉'], full: ['帝国指令', '明朗之靴', '流水法杖', '炽热香炉', '救赎', '警觉眼石'] },
    ]
  },
  taric: {
    traits: ['support_tank', 'healing', 'shield', 'invulnerable_ult', 'cc', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '坦克辅助流', skillOrder: '主Q副E', core: ['钢铁烈阳之匣', '骑士之誓', '警觉眼石'], full: ['钢铁烈阳之匣', '明朗之靴', '骑士之誓', '警觉眼石', '振奋盔甲', '荆棘之甲'] },
    ]
  },
  ivern: {
    traits: ['support', 'shield', 'cc', 'summons_daisy', 'utility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'support', name: '辅助翠神流', skillOrder: '主E副Q', core: ['月石再生器', '炽热香炉', '流水法杖'], full: ['月石再生器', '明朗之靴', '炽热香炉', '流水法杖', '救赎', '警觉眼石'] },
    ]
  },

  // === TANKS ===
  ornn: {
    traits: ['tank', 'cc', 'engage', 'aoe_ult', 'spell_weaving', 'upgrade_items'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主W副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  sion: {
    traits: ['tank', 'cc', 'engage', 'aoe', 'stacking_hp', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  malphite: {
    traits: ['tank', 'cc_ult', 'engage', 'aoe', 'ap_scaling'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主E副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
      { type: 'ap', name: 'AP核弹流', skillOrder: '主Q副E', core: ['卢登的伙伴', '灭世者的死亡之帽', '虚空之杖'], full: ['卢登的伙伴', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '影焰'] },
    ]
  },
  chogath: {
    traits: ['tank', 'cc', 'aoe', 'execute_ult', 'stacking_hp', 'ap_scaling'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
      { type: 'ap', name: 'AP一口流', skillOrder: '主Q副W', core: ['时光之杖', '灭世者的死亡之帽', '虚空之杖'], full: ['时光之杖', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '女妖面纱'] },
    ]
  },
  maokai: {
    traits: ['tank', 'cc', 'engage', 'healing', 'aoe_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  nautilus: {
    traits: ['tank', 'cc', 'engage', 'aoe', 'shield'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主E副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  leona: {
    traits: ['tank', 'cc', 'engage', 'aoe_ult', 'shield'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主W副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  amumu: {
    traits: ['tank', 'cc', 'aoe_ult', 'engage', 'dot', 'ap_scaling'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主E副Q', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  zac: {
    traits: ['tank', 'cc', 'engage', 'healing', 'aoe', 'resurrection'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主E副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  sejuani: {
    traits: ['tank', 'cc', 'engage', 'aoe_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主W副Q', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  rammus: {
    traits: ['tank', 'cc_taunt', 'engage', 'reflect_damage', 'mobility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副E', core: ['心之钢', '荆棘之甲', '千变者贾修'], full: ['心之钢', '水银之靴', '荆棘之甲', '千变者贾修', '璀璨回响', '振奋盔甲'] },
    ]
  },
  galio: {
    traits: ['tank', 'cc', 'engage', 'aoe_ult', 'ap_scaling', 'shield'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
      { type: 'ap', name: 'AP一拳流', skillOrder: '主Q副W', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '影焰'] },
    ]
  },
  shen: {
    traits: ['tank', 'cc_taunt', 'shield', 'global_ult', 'spell_weaving', 'energy'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  alistar: {
    traits: ['tank', 'cc', 'engage', 'healing', 'damage_reduction_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  braum: {
    traits: ['tank', 'cc', 'shield_block', 'engage_ult', 'utility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  blitzcrank: {
    traits: ['tank', 'cc_hook', 'engage', 'aoe_ult', 'burst_ad', 'shield'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  skarner: {
    traits: ['tank', 'cc', 'engage', 'aoe', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  tahmkench: {
    traits: ['tank', 'cc', 'engage', 'shield', 'spell_weaving', 'devour'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  ksante: {
    traits: ['tank', 'cc', 'engage', 'mobility', 'spell_weaving', 'all_out_form'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  poppy: {
    traits: ['tank', 'cc', 'engage', 'shield', 'anti_dash'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副W', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  rell: {
    traits: ['tank', 'cc', 'engage', 'aoe_ult', 'shield'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主W副Q', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  nunu: {
    traits: ['tank', 'cc', 'engage', 'healing', 'aoe_ult', 'spell_weaving', 'ap_scaling'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉坦克流', skillOrder: '主Q副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
      { type: 'ap', name: 'AP雪球流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '影焰'] },
    ]
  },
  singed: {
    traits: ['tank', 'ap_dot', 'cc', 'mobility', 'spell_weaving', 'proxy'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉毒跑流', skillOrder: '主Q副E', core: ['心之钢', '瑞莱的冰晶节杖', '千变者贾修'], full: ['心之钢', '水银之靴', '瑞莱的冰晶节杖', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },

  // === FIGHTERS / BRUISERS ===
  darius: {
    traits: ['bruiser', 'burst_ad', 'healing', 'execute_ult', 'stacking_bleed', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  garen: {
    traits: ['bruiser', 'burst_ad', 'execute_ult', 'healing', 'spell_weaving', 'silence'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主E副Q', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  riven: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'shield', 'spell_weaving', 'cc', 'execute_ult'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  aatrox: {
    traits: ['bruiser', 'burst_ad', 'healing', 'cc', 'spell_weaving', 'aoe'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  renekton: {
    traits: ['bruiser', 'burst_ad', 'healing', 'mobility', 'cc', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  nasus: {
    traits: ['bruiser', 'stacking', 'burst_ad', 'healing', 'cc_slow', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉狗头流', skillOrder: '主Q副W', core: ['三相之力', '心之钢', '振奋盔甲'], full: ['三相之力', '水银之靴', '心之钢', '振奋盔甲', '荆棘之甲', '斯特拉克的挑战护手'] },
    ]
  },
  camille: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'cc', 'true_damage', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['三相之力', '死亡之舞', '斯特拉克的挑战护手'], full: ['三相之力', '水银之靴', '死亡之舞', '斯特拉克的挑战护手', '黑色切割者', '振奋盔甲'] },
    ]
  },
  fiora: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'true_damage', 'healing', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉剑姬流', skillOrder: '主Q副E', core: ['三相之力', '死亡之舞', '斯特拉克的挑战护手'], full: ['三相之力', '水银之靴', '死亡之舞', '斯特拉克的挑战护手', '黑色切割者', '振奋盔甲'] },
    ]
  },
  jax: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'mobility', 'cc', 'dodge', 'hybrid_damage'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉武器流', skillOrder: '主W副Q', core: ['三相之力', '破败王者之刃', '死亡之舞'], full: ['三相之力', '水银之靴', '破败王者之刃', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  irelia: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'mobility', 'cc', 'healing', 'reset'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉刀妹流', skillOrder: '主Q副E', core: ['破败王者之刃', '三相之力', '死亡之舞'], full: ['破败王者之刃', '水银之靴', '三相之力', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  sett: {
    traits: ['bruiser', 'burst_ad', 'cc', 'shield', 'true_damage_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉腕豪流', skillOrder: '主Q副W', core: ['渴血战斧', '斯特拉克的挑战护手', '死亡之舞'], full: ['渴血战斧', '水银之靴', '斯特拉克的挑战护手', '死亡之舞', '黑色切割者', '振奋盔甲'] },
    ]
  },
  mordekaiser: {
    traits: ['ap_fighter', 'ap_caster', 'aoe', 'shield', 'cc', 'isolate_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP铁男流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '瑞莱的冰晶节杖', '灭世者的死亡之帽'], full: ['海克斯科技火箭腰带', '法师之靴', '瑞莱的冰晶节杖', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏'] },
    ]
  },
  gwen: {
    traits: ['ap_fighter', 'attack_speed', 'onhit', 'maxhp_damage', 'healing', 'mobility', 'immune_ult'],
    anti: [],
    builds: [
      { type: 'ap', name: 'AP剪刀流', skillOrder: '主Q副E', core: ['纳什之牙', '灭世者的死亡之帽', '虚空之杖'], full: ['纳什之牙', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  lillia: {
    traits: ['ap_fighter', 'ap_caster', 'dot', 'true_damage', 'mobility', 'cc_ult', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP小鹿流', skillOrder: '主Q副W', core: ['兰德里的苦楚', '灭世者的死亡之帽', '虚空之杖'], full: ['兰德里的苦楚', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '瑞莱的冰晶节杖'] },
    ]
  },
  yasuo: {
    traits: ['bruiser', 'crit', 'attack_speed', 'mobility', 'shield', 'cc_ult', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击剑豪流', skillOrder: '主Q副E', core: ['无尽之刃', '不朽盾弓', '死亡之舞'], full: ['无尽之刃', '狂战士胫甲', '不朽盾弓', '死亡之舞', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  yone: {
    traits: ['bruiser', 'crit', 'attack_speed', 'mobility', 'burst_ad', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击剑魂流', skillOrder: '主Q副E', core: ['无尽之刃', '不朽盾弓', '死亡之舞'], full: ['无尽之刃', '狂战士胫甲', '不朽盾弓', '死亡之舞', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  viego: {
    traits: ['bruiser', 'crit', 'attack_speed', 'onhit', 'mobility', 'reset', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击破败王流', skillOrder: '主Q副E', core: ['破败王者之刃', '无尽之刃', '死亡之舞'], full: ['破败王者之刃', '狂战士胫甲', '无尽之刃', '死亡之舞', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  masteryi: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'true_damage', 'mobility', 'untargetable', 'reset'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速剑圣流', skillOrder: '主Q副E', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '智慧末刃', '守护天使'] },
    ]
  },
  tryndamere: {
    traits: ['bruiser', 'crit', 'attack_speed', 'mobility', 'healing', 'invulnerable_ult'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击蛮王流', skillOrder: '主Q副E', core: ['无尽之刃', '纳沃利迅刃', '破败王者之刃'], full: ['无尽之刃', '狂战士胫甲', '纳沃利迅刃', '破败王者之刃', '多米尼克领主的致意', '守护天使'] },
    ]
  },
  olaf: {
    traits: ['bruiser', 'attack_speed', 'healing', 'immune_cc_ult', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉狂战流', skillOrder: '主Q副E', core: ['渴血战斧', '死亡之舞', '斯特拉克的挑战护手'], full: ['渴血战斧', '水银之靴', '死亡之舞', '斯特拉克的挑战护手', '黑色切割者', '振奋盔甲'] },
    ]
  },
  warwick: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'healing', 'cc', 'mobility', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉狼人流', skillOrder: '主Q副W', core: ['破败王者之刃', '渴血战斧', '死亡之舞'], full: ['破败王者之刃', '水银之靴', '渴血战斧', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  volibear: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'healing', 'cc', 'shield', 'aoe_ult'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉狗熊流', skillOrder: '主W副Q', core: ['纳什之牙', '心之钢', '振奋盔甲'], full: ['纳什之牙', '水银之靴', '心之钢', '振奋盔甲', '死亡之舞', '斯特拉克的挑战护手'] },
    ]
  },
  trundle: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'healing', 'cc', 'steal_stats_ult'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉巨魔流', skillOrder: '主Q副W', core: ['三相之力', '破败王者之刃', '死亡之舞'], full: ['三相之力', '水银之靴', '破败王者之刃', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  udyr: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'mobility', 'shield', 'cc', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉乌迪尔流', skillOrder: '主Q副E', core: ['三相之力', '死亡之舞', '斯特拉克的挑战护手'], full: ['三相之力', '水银之靴', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲', '荆棘之甲'] },
    ]
  },
  shyvana: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'aoe', 'ap_scaling', 'hybrid_damage'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉龙女流', skillOrder: '主W副Q', core: ['三相之力', '破败王者之刃', '死亡之舞'], full: ['三相之力', '水银之靴', '破败王者之刃', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
      { type: 'ap', name: 'AP吐火流', skillOrder: '主E副W', core: ['纳什之牙', '灭世者的死亡之帽', '虚空之杖'], full: ['纳什之牙', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '影焰'] },
    ]
  },
  jarvaniv: {
    traits: ['bruiser_tank', 'engage', 'cc', 'aoe_ult', 'burst_ad', 'attack_speed_buff'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉皇子流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  leesin: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'cc_kick', 'spell_weaving', 'energy', 'shield'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉盲僧流', skillOrder: '主Q副W', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  pantheon: {
    traits: ['bruiser', 'burst_ad', 'cc', 'mobility_ult', 'spell_weaving', 'invulnerable'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉潘森流', skillOrder: '主Q副W', core: ['幽梦之灵', '黑色切割者', '死亡之舞'], full: ['幽梦之灵', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '守护天使'] },
    ]
  },
  xinzhao: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'mobility', 'cc', 'healing', 'immune_ult'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉赵信流', skillOrder: '主Q副E', core: ['三相之力', '破败王者之刃', '死亡之舞'], full: ['三相之力', '水银之靴', '破败王者之刃', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  vi: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'cc', 'spell_weaving', 'armor_shred'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉蔚流', skillOrder: '主Q副E', core: ['三相之力', '黑色切割者', '死亡之舞'], full: ['三相之力', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  nocturne: {
    traits: ['bruiser', 'attack_speed', 'burst_ad', 'mobility_ult', 'cc', 'spell_block'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉梦魇流', skillOrder: '主Q副E', core: ['渴血战斧', '破败王者之刃', '死亡之舞'], full: ['渴血战斧', '狂战士胫甲', '破败王者之刃', '死亡之舞', '斯特拉克的挑战护手', '守护天使'] },
    ]
  },
  hecarim: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'cc', 'aoe_ult', 'healing', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉人马流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  kayn: {
    traits: ['bruiser_assassin', 'burst_ad', 'mobility', 'spell_weaving', 'healing'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: '蓝凯刺客流', skillOrder: '主Q副W', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
      { type: 'bruiser', name: '红凯战士流', skillOrder: '主Q副W', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  illaoi: {
    traits: ['bruiser', 'burst_ad', 'healing', 'aoe', 'cc', 'spell_weaving', 'zone_control'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉触手流', skillOrder: '主E副Q', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  drmundo: {
    traits: ['tank', 'healing', 'cc_slow', 'spell_weaving', 'ad_scaling_hp'],
    anti: ['attack_speed'],
    builds: [
      { type: 'tank', name: '纯肉蒙多流', skillOrder: '主Q副E', core: ['心之钢', '璀璨回响', '千变者贾修'], full: ['心之钢', '水银之靴', '璀璨回响', '千变者贾修', '荆棘之甲', '振奋盔甲'] },
    ]
  },
  gnar: {
    traits: ['bruiser', 'attack_speed', 'cc', 'mobility', 'aoe_ult', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉纳尔流', skillOrder: '主Q副W', core: ['三相之力', '黑色切割者', '死亡之舞'], full: ['三相之力', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  gangplank: {
    traits: ['ad_caster', 'burst_crit', 'spell_weaving', 'aoe_ult', 'global_ult', 'healing'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: '暴击船长流', skillOrder: '主Q副E', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '明朗之靴', '收集者', '多米尼克领主的致意', '饮血剑', '纳沃利迅刃'] },
    ]
  },
  jayce: {
    traits: ['ad_caster', 'burst_ad', 'spell_weaving', 'long_range_skillshot', 'mobility'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: 'AD双形态流', skillOrder: '主Q副W', core: ['魔宗', '幽梦之灵', '赛瑞尔达的怨恨'], full: ['魔宗', '明朗之靴', '幽梦之灵', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  gragas: {
    traits: ['ap_fighter', 'burst_ap', 'cc', 'healing', 'mobility', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ap', name: 'AP酒桶流', skillOrder: '主Q副E', core: ['海克斯科技火箭腰带', '灭世者的死亡之帽', '虚空之杖'], full: ['海克斯科技火箭腰带', '法师之靴', '灭世者的死亡之帽', '虚空之杖', '中娅沙漏', '巫妖之祸'] },
    ]
  },
  urgot: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'aoe', 'execute_ult', 'cc'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉螃蟹流', skillOrder: '主W副E', core: ['黑色切割者', '渴血战斧', '死亡之舞'], full: ['黑色切割者', '水银之靴', '渴血战斧', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  yorick: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'summons', 'spell_weaving', 'zone_control'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉掘墓流', skillOrder: '主Q副E', core: ['三相之力', '破败王者之刃', '死亡之舞'], full: ['三相之力', '水银之靴', '破败王者之刃', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },

  // === SPECIAL / HYBRID ===
  belveth: {
    traits: ['bruiser', 'attack_speed', 'onhit', 'mobility', 'true_damage', 'reset', 'infinite_AS'],
    anti: [],
    builds: [
      { type: 'onhit', name: '攻速女皇流', skillOrder: '主Q副E', core: ['鬼索的狂暴之刃', '破败王者之刃', '界弓'], full: ['鬼索的狂暴之刃', '狂战士胫甲', '破败王者之刃', '界弓', '智慧末刃', '死亡之舞'] },
    ]
  },
  briar: {
    traits: ['bruiser', 'attack_speed', 'healing', 'burst_ad', 'cc', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉贝蕾亚流', skillOrder: '主Q副W', core: ['破败王者之刃', '渴血战斧', '死亡之舞'], full: ['破败王者之刃', '水银之靴', '渴血战斧', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  monkeyking: {
    traits: ['bruiser', 'attack_speed', 'mobility', 'cc_ult', 'aoe_ult', 'spell_weaving'],
    anti: [],
    builds: [
      { type: 'bruiser', name: '半肉猴子流', skillOrder: '主E副Q', core: ['三相之力', '黑色切割者', '死亡之舞'], full: ['三相之力', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  reksai: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'cc', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉挖掘机流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  nilah: {
    traits: ['bruiser', 'crit', 'attack_speed', 'mobility', 'aoe', 'healing', 'close_range'],
    anti: [],
    builds: [
      { type: 'ad', name: '暴击近战流', skillOrder: '主Q副E', core: ['无尽之刃', '纳沃利迅刃', '不朽盾弓'], full: ['无尽之刃', '狂战士胫甲', '纳沃利迅刃', '不朽盾弓', '多米尼克领主的致意', '死亡之舞'] },
    ]
  },
  ambessa: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'shield', 'spell_weaving', 'aoe'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  zaahen: {
    traits: ['bruiser', 'ad_caster', 'mobility', 'cc', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉战士流', skillOrder: '主Q副E', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
  yunara: {
    traits: ['ad_caster', 'burst_ad', 'mobility', 'spell_weaving', 'long_range'],
    anti: ['attack_speed'],
    builds: [
      { type: 'ad', name: 'AD射手流', skillOrder: '主Q副W', core: ['无尽之刃', '收集者', '多米尼克领主的致意'], full: ['无尽之刃', '狂战士胫甲', '收集者', '多米尼克领主的致意', '饮血剑', '守护天使'] },
    ]
  },
  locke: {
    traits: ['ad_assassin', 'burst_ad', 'mobility', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'assassin', name: 'AD刺客流', skillOrder: '主Q副E', core: ['幽梦之灵', '收集者', '赛瑞尔达的怨恨'], full: ['幽梦之灵', '明朗之靴', '收集者', '赛瑞尔达的怨恨', '夜之锋刃', '守护天使'] },
    ]
  },
  kled: {
    traits: ['bruiser', 'burst_ad', 'mobility', 'cc', 'spell_weaving'],
    anti: ['attack_speed'],
    builds: [
      { type: 'bruiser', name: '半肉克烈流', skillOrder: '主Q副W', core: ['渴血战斧', '黑色切割者', '死亡之舞'], full: ['渴血战斧', '水银之靴', '黑色切割者', '死亡之舞', '斯特拉克的挑战护手', '振奋盔甲'] },
    ]
  },
};

// ===== AUGMENT MECHANIC CLASSIFICATION =====
const augmentTraits = {
  '亮出你的剑': ['transform_ranged_to_melee', 'burst_ad', 'lifesteal', 'survivability'],
  '暴击飞弹': ['crit', 'burst_ad', 'burst_ap', 'aoe'],
  '钢化你心': ['tank', 'stacking', 'scaling'],
  '坦克引擎': ['tank', 'stacking_hp', 'scaling'],
  '高压锅': ['tank', 'dot', 'maxhp_damage', 'aoe'],
  '升级：无尽之刃': ['crit', 'burst_ad'],
  '双刀流': ['attack_speed', 'onhit', 'aoe'],
  '重量级打击手': ['tank', 'maxhp_damage', 'onhit'],
  '超凡邪恶': ['ap_caster', 'stacking', 'scaling'],
  '艾卡西亚的陷落': ['tank', 'dot', 'aoe'],
  '歌利亚巨人': ['tank', 'survivability', 'burst_ad', 'burst_ap'],
  '炼狱导管': ['ap_caster', 'dot', 'spell_weaving'],
  '双发快射': ['crit', 'onhit', 'burst_crit'],
  '术士果汁盒': ['lifesteal', 'omnivamp', 'survivability'],
  '无限循环往复': ['skill_haste', 'reset', 'spell_weaving'],
  '尤里卡': ['ap_caster', 'skill_haste', 'spell_weaving'],
  '巨人杀手': ['maxhp_damage', 'burst_ad', 'burst_ap'],
  '飞身踢': ['execute', 'healing', 'burst_ad', 'close_range'],
  '灵魂虹吸': ['crit', 'healing', 'lifesteal', 'survivability'],
  '回归基本功': ['ap_caster', 'ad_caster', 'skill_haste', 'healing', 'shield'],
  '升级：献祭': ['tank', 'economy'],
  '灵巧': ['attack_speed'],
  '魔法飞弹': ['ap_caster', 'maxhp_damage', 'spell_weaving'],
  '叠角龙': ['stacking', 'scaling'],
  '会心防御': ['crit', 'tank', 'defense'],
  '更万用的瞄准镜': ['long_range'],
  '风语者的祝福': ['support', 'healing', 'shield'],
  '喂呜喂呜': ['support', 'healing', 'shield'],
  '连拨击锤': ['attack_speed', 'aoe', 'onhit'],
  '咏叹奏鸣': ['support', 'healing', 'shield', 'aura'],
  '星界躯体': ['tank', 'survivability'],
  '虚幻武器': ['onhit', 'spell_weaving'],
  '大力': ['burst_ad'],
  '踢踏舞': ['attack_speed', 'mobility', 'onhit'],
  '质变：棱彩阶': ['utility'],
  '珠光护手': ['ap_caster', 'crit', 'burst_ap'],
  '沃格勒特的巫师帽': ['ap_caster', 'burst_ap'],
  '暴击律动': ['crit', 'attack_speed'],
  '急急小子': ['skill_haste', 'mobility'],
  '渴血': ['lifesteal', 'omnivamp'],
  '掷骰狂人': ['economy', 'scaling'],
  '冰寒': ['cc', 'slow'],
  '秘术冲拳': ['onhit', 'spell_weaving', 'cdr'],
  '点亮他们！': ['attack_speed', 'onhit', 'aoe'],
  '由心及物': ['tank', 'mana_scaling'],
  '双生火焰': ['ap_caster', 'spell_weaving', 'aoe'],
  '逃跑计划': ['survivability', 'defense'],
  '地形专家': ['spell_weaving', 'aoe'],
  '大师铸就': ['utility', 'burst_ad', 'burst_ap'],
  '巫师式思考': ['ap_caster', 'burst_ap'],
  '最万用的瞄准镜': ['long_range'],
  '超强大脑': ['ap_caster', 'shield', 'survivability'],
  '缩小引擎': ['skill_haste', 'mobility', 'reset'],
  '灵魄炸弹': ['support', 'healing', 'shield'],
  '牙仙子': ['burst_ad', 'burst_ap', 'penetration', 'scaling'],
  '扇巴掌': ['cc', 'scaling'],
  '科学狂人': ['utility', 'survivability'],
  '魔法转物理': ['hybrid_damage', 'burst_ad'],
  '升级：中娅': ['ap_caster', 'survivability', 'utility'],
  '家园卫士': ['mobility', 'utility'],
  '老练狙神': ['spell_weaving', 'cdr', 'long_range_skillshot'],
  '邦！': ['aoe', 'burst_ad', 'burst_ap', 'spell_weaving'],
  '狂徒豪气': ['mobility', 'defense', 'survivability'],
  '台风': ['attack_speed', 'onhit', 'aoe'],
  '万用瞄准镜': ['long_range'],
  '捐赠': ['economy'],
  '升级：收集者': ['execute', 'burst_ad', 'economy'],
  '神射法师': ['hybrid_damage', 'ap_scaling', 'onhit'],
  '纯粹主义者 - 术师': ['ap_caster', 'skill_haste'],
  '大法师': ['ap_caster', 'spell_weaving', 'cdr'],
  '易损': ['crit', 'dot'],
  '海洋龙魂': ['healing', 'survivability'],
  '狙神飞星': ['long_range_skillshot', 'burst_ap', 'burst_ad', 'aoe'],
  '质变：黄金阶': ['utility'],
  '有始有终': ['burst_ad', 'burst_ap'],
  '侵蚀': ['penetration', 'utility'],
  '最终形态': ['survivability', 'lifesteal', 'mobility'],
  '急救用具': ['support', 'healing', 'shield'],
  '溢流': ['ap_caster', 'spell_weaving', 'mana'],
  '小小的额外帮助': ['attack_speed', 'long_range'],
  '升级：耀光': ['spell_weaving', 'burst_ad', 'burst_ap', 'healing'],
  '狂热者': ['crit', 'attack_speed', 'ap_scaling'],
  '属性叠属性！': ['scaling', 'utility'],
  '循环往复': ['skill_haste', 'spell_weaving'],
  '练腿日': ['mobility'],
  '天音爆': ['support', 'healing', 'shield', 'aoe'],
  '关键暴击': ['crit', 'burst_crit'],
  '吞噬灵魂': ['cc', 'stacking_hp', 'tank'],
  '黎明使者的坚决': ['survivability', 'healing', 'defense'],
  '炽燃利息': ['dot', 'economy'],
  '旋转至胜': ['spell_weaving', 'burst_ad', 'burst_ap'],
  '全心为你': ['support', 'healing', 'shield'],
  '急速之追求': ['skill_haste', 'spell_weaving'],
  '罪恶快感': ['attack_speed', 'mobility', 'reset'],
  '全能龙魂': ['utility', 'survivability'],
  '残忍': ['cc', 'burst_ap', 'aoe'],
  '物理转魔法': ['hybrid_damage', 'burst_ap'],
  '尊我为王': ['economy', 'utility'],
  '物法皆修': ['hybrid_damage', 'attack_speed', 'ap_scaling', 'burst_ad'],
  '暗影疾奔': ['mobility', 'stealth'],
  '生机迸发': ['utility', 'healing'],
  '威能之追求': ['skill_haste', 'spell_weaving', 'scaling'],
  '质变：混沌': ['utility'],
  '男爵之手': ['burst_ad', 'burst_ap', 'utility'],
  '唯快不破': ['mobility'],
  '空投熊': ['summons', 'utility'],
  '不祥契约': ['ap_caster', 'lifesteal', 'burst_ap'],
  '吃过路兵': ['maxhp_damage', 'healing', 'true_damage', 'mobility'],
  '信念者的强化': ['support', 'healing', 'shield'],
  '保持坚定': ['defense', 'spell_weaving'],
  '火狐': ['mobility', 'dot'],
  '贪欲束缚': ['cc', 'healing', 'burst_ad', 'burst_ap'],
  '快中求稳': ['mobility', 'shield'],
  '终极唤醒': ['skill_haste'],
  '巨像的勇气': ['cc', 'shield', 'tank'],
  '尖端发明家': ['utility', 'cdr'],
  '全凭身法': ['mobility', 'skill_haste'],
  '海克斯科技龙魂': ['onhit', 'aoe', 'cc_slow'],
  '杀戮时间到了': ['burst_ad', 'burst_ap', 'execute'],
  '由暴生急': ['crit', 'skill_haste'],
  '无尽大杀四方': ['aoe', 'healing', 'close_range'],
  '闪现向前': ['mobility', 'utility'],
  '炼狱龙魂': ['onhit', 'burst_ad', 'burst_ap'],
  '哎哟，我的硬币！': ['economy'],
  '回力OK镖': ['spell_weaving'],
  '防护面纱': ['defense', 'spell_block'],
  '炽烈黎明': ['spell_weaving', 'burst_ap', 'utility'],
  '面包和奶酪': ['skill_haste', 'spell_weaving'],
  '属性！': ['utility', 'scaling'],
  '回响施放': ['spell_weaving', 'burst_ad', 'burst_ap'],
  '精怪魔法': ['cc', 'burst_ap'],
  '过量延伸者': ['utility', 'burst_ad'],
  '至高天诺言': ['support', 'healing', 'shield'],
  '别停止引导': ['channel_ult', 'shield', 'survivability'],
  '神圣干预': ['utility', 'invulnerable'],
  '战争交响乐': ['attack_speed', 'burst_ad', 'scaling'],
  '夺金': ['economy', 'mobility'],
  '面包和黄油': ['skill_haste', 'spell_weaving'],
  '穿针引线': ['penetration'],
  '终极刷新': ['reset'],
  '面包和果酱': ['skill_haste', 'spell_weaving'],
  '仁慈打击': ['attack_speed', 'maxhp_damage', 'long_range'],
  '火上浇油': ['onhit', 'dot', 'aoe'],
  '属性叠属性叠属性！': ['scaling', 'utility'],
  '海牛阿福的勇士': ['utility', 'economy'],
  '超负荷': ['spell_weaving', 'reset'],
  '史上最大雪球': ['cc', 'engage', 'aoe', 'utility'],
  '濒死悟道': ['survivability', 'scaling'],
  '注魔': ['onhit', 'spell_weaving'],
  '死亡之环': ['healing', 'dot', 'aoe'],
  '泰坦的坚决': ['tank', 'scaling', 'defense', 'burst_ad', 'burst_ap'],
  '终极不可阻挡': ['cc_immune', 'utility'],
  '咒语裂变': ['spell_weaving', 'aoe', 'burst_ap'],
  '心灵净化': ['aoe', 'cc_slow', 'reset'],
  '俯冲轰炸': ['utility', 'true_damage'],
  '不动如山': ['cc', 'defense', 'tank'],
  '升级：花晓之剑': ['attack_speed'],
  '轻拍背部': ['utility', 'shield', 'mobility'],
  '豪猪': ['tank', 'aoe', 'cc_slow'],
  '自然即是治愈': ['healing', 'survivability'],
  '可靠武器': ['utility', 'scaling'],
  '飞升仪式': ['reset', 'mobility', 'spell_weaving'],
  '多重射击': ['spell_weaving', 'aoe'],
  '仆从大师': ['summons'],
  '虹吸': ['healing', 'spell_weaving'],
  '我们的治疗': ['healing', 'survivability'],
  '利刃华尔兹': ['invulnerable', 'burst_ad', 'mobility'],
  '加固护盾': ['shield', 'survivability'],
  '山脉龙魂': ['shield', 'survivability'],
  '三重射击': ['spell_weaving', 'aoe', 'burst_ad', 'burst_ap'],
  '鲨鱼诱饵': ['utility', 'dot'],
  '蛋白粉奶昔': ['support', 'healing', 'shield'],
  '前进时间到': ['mobility'],
  '夜狩': ['stealth', 'reset'],
  '活力焕发': ['healing', 'spell_weaving'],
  '杀意翻涌': ['mobility', 'execute'],
  '你摸不到': ['invulnerable', 'utility'],
  '和我一起困在这里': ['cc_taunt', 'tank', 'engage'],
  '自适应防护': ['defense', 'spell_weaving'],
  '吵闹鬼': ['utility'],
  '扳机炼狱': ['burst_ad', 'aoe'],
  '缩小射线': ['onhit', 'utility'],
  '藏身草丛': ['burst_ad', 'burst_ap'],
  '鲨鱼暴风': ['cc_slow', 'aoe'],
  '下雪天': ['utility'],
  '潘朵拉的盒子': ['utility'],
  '电涌力场': ['skill_haste', 'mobility', 'aoe'],
  '大地苏醒': ['mobility', 'aoe'],
  '强力护盾': ['shield', 'burst_ad', 'burst_ap'],
  '弹球': ['utility', 'true_damage'],
  '惊惧': ['cc', 'utility'],
  '快步': ['mobility', 'utility'],
  '玻璃大炮': ['burst_ad', 'burst_ap', 'true_damage'],
  '针插垫': ['attack_speed', 'burst_crit'],
  '转得我眩晕了': ['utility'],
  '舞会女王': ['cc', 'utility'],
  '软弹啪叽抓': ['cc', 'engage'],
  '冰雪爆裂': ['cc', 'aoe'],
  '会心治疗': ['support', 'healing', 'shield', 'crit'],
  '神圣雪球': ['cc', 'utility'],
  '大招工具人': ['skill_haste'],
  '连锁反应': ['cc', 'burst_ad', 'burst_ap', 'aoe'],
  '闪光弹': ['utility', 'aoe'],
  '闪闪现现': ['mobility', 'utility'],
  '位面转移': ['utility'],
  '魄罗蛮冲': ['utility'],
  '复位': ['spell_weaving', 'mobility'],
  '双重打击': ['onhit', 'spell_weaving'],
  '王中王，靴中靴': ['mobility', 'utility'],
  '主玩辅助': ['support', 'healing'],
  '装填': ['spell_weaving', 'cdr'],
};

// ===== MATCHING LOGIC =====
// Match champion traits + build type to augment recommendations

function matchAugmentsToBuild(champTraits, antiTraits, buildType) {
  const recommendations = [];

  for (const [augName, augTags] of Object.entries(augmentTraits)) {
    // Check anti-synergy (skip if augment matches anti-traits)
    let antiMatch = false;
    for (const anti of (antiTraits || [])) {
      if (augTags.includes(anti)) { antiMatch = true; break; }
    }
    if (antiMatch) continue;

    // Check synergy based on build type + traits
    let score = 0;
    const reasons = [];

    // Build-type specific scoring
    if (buildType === 'ad' || buildType === 'assassin') {
      if (augTags.includes('burst_ad')) { score += 3; reasons.push('AD爆发'); }
      if (augTags.includes('crit')) { score += 2; reasons.push('暴击'); }
      if (augTags.includes('penetration')) { score += 2; reasons.push('穿甲'); }
      if (augTags.includes('execute')) { score += 2; reasons.push('斩杀'); }
      if (augTags.includes('attack_speed') && !antiTraits.includes('attack_speed')) { score += 1; reasons.push('攻速'); }
    }

    if (buildType === 'ap') {
      if (augTags.includes('burst_ap')) { score += 3; reasons.push('AP爆发'); }
      if (augTags.includes('ap_caster')) { score += 2; reasons.push('技能法师'); }
      if (augTags.includes('dot')) { score += 2; reasons.push('持续伤害'); }
      if (augTags.includes('penetration')) { score += 2; reasons.push('法穿'); }
    }

    if (buildType === 'tank') {
      if (augTags.includes('tank')) { score += 3; reasons.push('坦克'); }
      if (augTags.includes('survivability')) { score += 2; reasons.push('生存'); }
      if (augTags.includes('defense')) { score += 2; reasons.push('防御'); }
      if (augTags.includes('maxhp_damage')) { score += 2; reasons.push('最大生命值伤害'); }
      if (augTags.includes('stacking_hp')) { score += 2; reasons.push('生命成长'); }
    }

    if (buildType === 'bruiser') {
      if (augTags.includes('burst_ad')) { score += 2; reasons.push('AD输出'); }
      if (augTags.includes('survivability')) { score += 2; reasons.push('生存'); }
      if (augTags.includes('healing')) { score += 2; reasons.push('回血'); }
      if (augTags.includes('tank')) { score += 1; reasons.push('坦度'); }
    }

    if (buildType === 'support') {
      if (augTags.includes('healing') && !augTags.includes('lifesteal')) { score += 3; reasons.push('治疗'); }
      if (augTags.includes('shield')) { score += 3; reasons.push('护盾'); }
      if (augTags.includes('support')) { score += 2; reasons.push('辅助'); }
      if (augTags.includes('utility')) { score += 1; reasons.push('功能'); }
    }

    if (buildType === 'onhit') {
      if (augTags.includes('onhit')) { score += 3; reasons.push('攻击特效'); }
      if (augTags.includes('attack_speed') && !antiTraits.includes('attack_speed')) { score += 2; reasons.push('攻速'); }
      if (augTags.includes('burst_ad') || augTags.includes('burst_ap')) { score += 1; reasons.push('混合伤害'); }
    }

    // Champion trait matching
    for (const trait of champTraits) {
      if (augTags.includes(trait)) { score += 2; reasons.push(trait); }
    }

    // Universal good augments (moderate score)
    if (augTags.includes('economy') || augTags.includes('scaling') || augTags.includes('utility')) {
      score += 1;
    }

    if (score >= 2) {
      recommendations.push({
        name: augName,
        score,
        reasons: [...new Set(reasons)]
      });
    }
  }

  // Sort by score, take top results
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations;
}

// ===== MAIN SCRIPT =====
const championsDir = path.join(__dirname, '../src/data/champions');
const championsIndex = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/champions-index.json'), 'utf8'));
const allAugments = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/all-augments-aramkit.json'), 'utf8'));
const augmentStats = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/augment-stats.json'), 'utf8'));

// Build augment lookup
const augmentLookup = {};
allAugments.forEach(a => { augmentLookup[a.name] = a; });

const augmentWinRateLookup = {};
augmentStats.forEach(a => { augmentWinRateLookup[a.name] = a.winRate; });

let updatedCount = 0;

for (const champ of championsIndex) {
  const champId = champ.id;
  const champFile = path.join(championsDir, `${champId}.json`);

  if (!fs.existsSync(champFile)) continue;

  const champData = JSON.parse(fs.readFileSync(champFile, 'utf8'));
  const mechanics = championMechanics[champId];

  if (!mechanics) {
    console.log(`No mechanic data for ${champId} (${champ.name}), skipping`);
    continue;
  }

  const newBuilds = [];

  for (let bi = 0; bi < mechanics.builds.length; bi++) {
    const buildTemplate = mechanics.builds[bi];
    const buildType = buildTemplate.type;
    const buildName = buildTemplate.name;

    // Match augments
    const matched = matchAugmentsToBuild(mechanics.traits, mechanics.anti, buildType);

    // Take top 15-18, ensure mix of prismatic/gold/silver
    const prioritized = [];
    const remaining = [];

    for (const m of matched) {
      const augData = augmentLookup[m.name];
      if (augData) {
        const val = m.score;
        if (val >= 4) {
          prioritized.push({ ...m, priority: '核心' });
        } else if (val >= 3) {
          prioritized.push({ ...m, priority: '优先' });
        } else {
          remaining.push({ ...m, priority: '可选' });
        }
      }
    }

    // Combine: all core + top priority + top remaining, aim for ~15-18 total
    const finalAugs = [...prioritized, ...remaining].slice(0, 18);

    // Build augment array with win rates
    const augments = finalAugs.map(a => {
      const augData = augmentLookup[a.name];
      return {
        name: a.name,
        tier: augData ? augData.tier : '',
        priority: a.priority,
        winRate: augmentWinRateLookup[a.name] || '',
        reason: generateReason(a.name, a.reasons, champId, buildType)
      };
    });

    newBuilds.push({
      name: buildName,
      buildType: buildType,
      coreItems: buildTemplate.core || [],
      fullItems: buildTemplate.full || [],
      skillOrder: buildTemplate.skillOrder || '',
      skillDetail: buildTemplate.skillDetail || [],
      augments: augments,
      playstyle: generatePlaystyle(champId, buildType),
      tips: generateTips(champId, buildType)
    });
  }

  // If the champion already has more builds than our template, keep them
  // Otherwise, update with our generated builds
  const existingBuilds = champData.builds || [];
  // Preserve skillDetail from existing builds if available and template doesn't have it
  for (let i = 0; i < Math.min(existingBuilds.length, newBuilds.length); i++) {
    if (!newBuilds[i].skillDetail || newBuilds[i].skillDetail.length === 0) {
      newBuilds[i].skillDetail = existingBuilds[i].skillDetail || [];
    }
    if (!newBuilds[i].skillOrder || newBuilds[i].skillOrder === '') {
      newBuilds[i].skillOrder = existingBuilds[i].skillOrder || '';
    }
    if (!newBuilds[i].coreItems || newBuilds[i].coreItems.length === 0) {
      newBuilds[i].coreItems = existingBuilds[i].coreItems || [];
      newBuilds[i].fullItems = existingBuilds[i].fullItems || [];
    }
  }

  champData.builds = newBuilds;
  fs.writeFileSync(champFile, JSON.stringify(champData, null, 2));
  updatedCount++;
  console.log(`Updated ${champId} (${champ.name}): ${newBuilds.length} builds, ${newBuilds.reduce((s,b) => s + b.augments.length, 0)} total augments`);
}

console.log(`\nTotal champions updated: ${updatedCount}`);

// ===== HELPER FUNCTIONS =====

function generateReason(augName, matchReasons, champId, buildType) {
  const reasons = matchReasons.slice(0, 3);
  const reasonText = reasons.join('+');
  return `契合${reasonText}，适合${buildType === 'ad' ? 'AD' : buildType === 'ap' ? 'AP' : buildType === 'tank' ? '坦克' : buildType === 'bruiser' ? '半肉战士' : buildType === 'support' ? '辅助' : buildType}出装的${augName}。`;
}

function generatePlaystyle(champId, buildType) {
  const basics = {
    ad: '利用射程优势在后排持续输出，注意走位避开控制技能，优先攻击最近目标。活着才有输出。',
    ap: '利用技能射程在后排消耗压制敌方血线，寻找合适的开团时机使用大招。注意蓝量管理。',
    tank: '作为前排吸收伤害，抓住时机开团。利用控制技能保护后排或打断敌方关键技能。存活越久团队收益越大。',
    bruiser: '半肉半输出定位，找时机进场打一套技能后评估是否继续。不要第一个进场，等控制交了再切入。',
    assassin: '等待敌方交完关键控制和保命技能后再进场，优先切后排脆皮。打完一套后利用位移退场等待下一波。',
    support: '紧跟核心输出位提供治疗/护盾/控制保护。注意站位不要太靠前，活着才能持续为团队提供增益。',
    onhit: '利用高攻速和攻击特效快速叠满被动/装备效果，持续输出前排和高血量目标。注意走A保持安全距离。',
  };
  return basics[buildType] || '根据对局情况灵活调整出装和打法。海克斯优先选择与自身技能机制契合的符文。';
}

function generateTips(champId, buildType) {
  const common = [
    '根据对局情况灵活调整出装顺序',
    '大乱斗不能回家，生存装备优先级高于纯输出',
  ];
  const typeTips = {
    ad: ['注意走位不要站太靠前', '优先打能打到的目标而非越塔追残血', '暴击装备成型后伤害质变'],
    ap: ['技能不要全用来清兵，留技能打敌方英雄', '注意蓝量管理', '利用草丛卡视野出其不意放技能'],
    tank: ['不要单独追残血，脱离团队容易被风筝', '开团前确保队友能跟上', '心之钢层数叠起来后正面作战极强'],
    bruiser: ['不要第一个进场等控制交了再切入', '找准时机切后排脆皮', '活下来利用吸血/回复再战'],
    assassin: ['等敌方关键技能交了再进场', '优先切后排脆皮和法师', '打完一套就撤，不要贪输出'],
    support: ['紧跟核心输出位', '注意站位不要太靠前', '活着才能持续为团队提供增益'],
    onhit: ['攻速装备是核心不要替换', '利用走A保持安全距离输出', '对面前排多时攻击特效收益最高'],
  };
  return [...(typeTips[buildType] || typeTips.ad), ...common];
}
