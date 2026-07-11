/**
 * 海克斯大乱斗攻略站 — 全英雄海克斯推荐批量升级
 *
 * 功能:
 *   1. 基于胜率+定位重新给海克斯三档分级 (核心必拿/情境可选/慎选避开)
 *   2. 生成英雄专属的非模板化推荐理由
 *   3. 补充缺失的 summonerSpells / whenToPick / generalTips
 *
 * 用法:
 *   node scripts/batch-upgrade.cjs --dry-run        # 预览
 *   node scripts/batch-upgrade.cjs --only aatrox     # 单英雄
 *   node scripts/batch-upgrade.cjs --limit 5         # 前5个
 *   node scripts/batch-upgrade.cjs                   # 全部(需确认)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHAMPIONS_DIR = path.join(ROOT, 'src', 'data', 'champions');
const MECHANICS_PATH = path.join(ROOT, 'src', 'data', 'champion-mechanics.json');
const STATS_PATH = path.join(ROOT, 'src', 'data', 'champion-stats.json');

// ======= ARG PARSING =======
const args = {
  dryRun: process.argv.includes('--dry-run'),
  only: null,
  limit: Infinity,
  force: process.argv.includes('--force'),
  verbose: process.argv.includes('--verbose'),
};
const onlyIdx = process.argv.indexOf('--only');
if (onlyIdx >= 0) args.only = process.argv[onlyIdx + 1];
const limitIdx = process.argv.indexOf('--limit');
if (limitIdx >= 0) args.limit = parseInt(process.argv[limitIdx + 1]);

// ======= DATA LOADING =======
const mechanics = JSON.parse(fs.readFileSync(MECHANICS_PATH, 'utf8'));
const stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
const statMap = {};
stats.forEach(s => { statMap[s.id] = s; });

const championFiles = fs.readdirSync(CHAMPIONS_DIR)
  .filter(f => f.endsWith('.json') && !f.includes('index') && !f.includes('mechanics') && !f.includes('status'));

if (args.only) {
  const found = championFiles.filter(f => f === args.only + '.json');
  if (found.length === 0) { console.error('Champion not found:', args.only); process.exit(1); }
}

// ======= AUGMENT EFFECT REFERENCE =======
const augmentEffects = {
  '亮出你的剑': { type: 'ad', desc: '转近战+AD+吸血', goodFor: ['ad','bruiser','assassin'], badFor: ['ap'] },
  '双刀流': { type: 'onhit', desc: '攻击特效双倍', goodFor: ['ad','attackSpeed','onhit'], badFor: [] },
  '踢踏舞': { type: 'mobility', desc: '平A加移速', goodFor: ['ad','attackSpeed','onhit','assassin'], badFor: [] },
  '暴击飞弹': { type: 'crit', desc: '暴击AOE飞弹', goodFor: ['ad','crit','assassin'], badFor: ['ap','tank'] },
  '邦！': { type: 'spell', desc: '技能命中额外伤害', goodFor: ['ad','ap','assassin','poke'], badFor: [] },
  '歌利亚巨人': { type: 'tank', desc: '加最大HP+体型', goodFor: ['tank','bruiser'], badFor: ['ad','ap','assassin'] },
  '连锁反应': { type: 'ap', desc: 'AOE法术伤害(AP)', goodFor: ['ap'], badFor: ['ad','tank','bruiser'] },
  '余震': { type: 'tank', desc: '控制后双抗', goodFor: ['tank','bruiser'], badFor: ['ad','ap'] },
  '重量级打击手': { type: 'onhit', desc: '%HP伤害', goodFor: ['attackSpeed','onhit','ad'], badFor: ['ap'] },
  '点亮他们！': { type: 'attackSpeed', desc: '突破攻速上限', goodFor: ['attackSpeed','onhit','ad'], badFor: ['ap','tank'] },
  '台风': { type: 'attackSpeed', desc: '固定攻速加成', goodFor: ['attackSpeed','onhit'], badFor: ['ap','tank','assassin'] },
  '缩小射线': { type: 'utility', desc: '减伤叠层', goodFor: ['tank','bruiser'], badFor: ['ad','ap','assassin'] },
  '战争交响乐': { type: 'hybrid', desc: 'AD+AP混伤', goodFor: ['hybrid'], badFor: ['ad','ap'] },
  '灵魂虹吸': { type: 'sustain', desc: '附近死亡回血', goodFor: ['tank','bruiser','assassin'], badFor: [] },
  '飞身踢': { type: 'mobility', desc: '移速+技能急速', goodFor: ['bruiser','assassin'], badFor: ['tank'] },
  '防护面纱': { type: 'defense', desc: '周期性法术护盾', goodFor: ['tank','bruiser','assassin'], badFor: [] },
  '不退不减': { type: 'tank', desc: '受击无敌+回血', goodFor: ['tank','bruiser'], badFor: ['ad','ap'] },
  '贪欲束缚': { type: 'spellvamp', desc: '技能吸血+AD', goodFor: ['ad','assassin','bruiser'], badFor: ['ap','tank'] },
  '回响施放': { type: 'spell', desc: '技能命中增伤下个技能', goodFor: ['ap','assassin','poke'], badFor: ['attackSpeed','onhit'] },
  '秘术冲拳': { type: 'spell', desc: '技能后AA爆发', goodFor: ['assassin','bruiser'], badFor: ['attackSpeed','tank'] },
  '连拨击锤': { type: 'onhit', desc: '攻击特效AD加成', goodFor: ['ad','onhit'], badFor: ['ap'] },
  '虚幻武器': { type: 'onhit', desc: '普攻附带魔伤', goodFor: ['onhit','hybrid'], badFor: ['ap'] },
  '神射法师': { type: 'ap', desc: '攻击附带AP伤害', goodFor: ['hybrid'], badFor: ['ad','tank'] },
  '海克斯科技龙魂': { type: 'utility', desc: '攻击减速', goodFor: ['ad','attackSpeed','onhit'], badFor: [] },
  '逃跑计划': { type: 'defense', desc: '致命伤无敌', goodFor: ['tank','bruiser'], badFor: [] },
  '黎明使者的坚决': { type: 'sustain', desc: '低血护盾+治疗', goodFor: ['tank','bruiser'], badFor: ['ad','ap'] },
  '三重射击': { type: 'spell', desc: '技能急速+AD', goodFor: ['ad','assassin'], badFor: ['ap','tank'] },
  '升级：无尽': { type: 'crit', desc: '无尽之刃升级+暴击', goodFor: ['ad','crit','assassin'], badFor: ['ap','tank'] },
  '升级：耀光': { type: 'spell', desc: '耀光升级+技能后AA', goodFor: ['bruiser','ad'], badFor: ['ap'] },
  '炼狱龙魂': { type: 'onhit', desc: '攻击特效混伤', goodFor: ['onhit','hybrid'], badFor: [] },
  '海洋龙魂': { type: 'sustain', desc: '回血+治疗', goodFor: ['tank','bruiser','support'], badFor: [] },
  '天音爆': { type: 'aoe', desc: 'AOE回血+伤害', goodFor: ['tank','bruiser','support'], badFor: ['assassin'] },
  '死亡之环': { type: 'aoe', desc: 'AOE+回血', goodFor: ['tank','bruiser'], badFor: ['assassin'] },
  '狙神飞星': { type: 'ad', desc: 'AD+AOE', goodFor: ['ad','assassin'], badFor: ['ap'] },
  '无尽大杀四方': { type: 'aoe', desc: 'AOE+回血', goodFor: ['tank','bruiser'], badFor: ['ad'] },
  '旋转至胜': { type: 'spell', desc: '普攻+技能循环', goodFor: ['bruiser','ad'], badFor: ['ap'] },
  '物法皆修': { type: 'hybrid', desc: 'AD+AP双修', goodFor: ['hybrid'], badFor: ['ad','ap','tank'] },
  '火上浇油': { type: 'onhit', desc: '攻击叠加伤害', goodFor: ['attackSpeed','onhit'], badFor: [] },
  '双发快射': { type: 'onhit', desc: '每3次AA触发onhit', goodFor: ['onhit','attackSpeed'], badFor: ['ap'] },
  '仁慈打击': { type: 'attackSpeed', desc: '攻速(击杀触发)', goodFor: ['ad','attackSpeed'], badFor: ['tank','support'] },
  '罪恶快感': { type: 'mobility', desc: '攻速+移速', goodFor: ['attackSpeed','ad'], badFor: ['tank'] },
  // catch-all for augments not in the list
};

// ======= ROLE-BASED CONTENT GENERATORS =======

function getRoleType(tags, buildType) {
  const tagStr = tags.join(',');
  if (tagStr.includes('射手') && buildType === 'onhit') return 'onhit';
  if (tagStr.includes('射手')) return 'ad';
  if (tagStr.includes('刺客')) return buildType === 'bruiser' ? 'bruiser' : 'assassin';
  if (tagStr.includes('法师')) return 'ap';
  if (tagStr.includes('坦克')) return 'tank';
  if (tagStr.includes('战士')) return buildType === 'tank' ? 'tank' : 'bruiser';
  if (tagStr.includes('辅助')) return 'support';
  if (buildType === 'ap') return 'ap';
  if (buildType === 'ad') return 'ad';
  if (buildType === 'bruiser') return 'bruiser';
  if (buildType === 'tank') return 'tank';
  return 'ad';
}

function isCritChampion(tags, buildType) {
  const tagStr = tags.join(',');
  // Champions that naturally build crit
  const critChamps = ['射手', '刺客'];
  const noCrit = ['法师', '坦克', '辅助'];
  if (noCrit.some(t => tagStr.includes(t))) return false;
  if (buildType === 'onhit') return false;
  if (buildType === 'ap') return false;
  if (buildType === 'tank') return false;
  return critChamps.some(t => tagStr.includes(t)) || buildType === 'ad';
}

function getAugmentEffect(name) {
  if (augmentEffects[name]) return augmentEffects[name];
  // Guess from name
  if (name.includes('升级：无') || name.includes('暴击')) return { type: 'crit', desc: '暴击向', goodFor: ['ad','crit','assassin'], badFor: ['ap'] };
  if (name.includes('龙魂')) return { type: 'onhit', desc: '龙魂特效', goodFor: ['onhit','ad'], badFor: [] };
  return { type: 'general', desc: '通用', goodFor: [], badFor: [] };
}

function classifyAugment(augName, champRole, winRate) {
  const wr = parseFloat(winRate);
  const eff = getAugmentEffect(augName);

  // Crit champions + crit augments = core
  if (eff.type === 'crit' && champRole === 'ad') return '核心必拿';

  // Bad fit: aug is explicitly bad for this role
  if (eff.badFor.includes(champRole)) return '慎选避开';

  // Good fit: aug is explicitly good for this role
  if (eff.goodFor.includes(champRole)) {
    if (wr >= 51) return '核心必拿';
    if (wr >= 47) return '情境可选';
    return '慎选避开';
  }

  // Fallback: use pure win rate
  if (wr >= 53) return '核心必拿';
  if (wr >= 48) return '情境可选';
  return '慎选避开';
}

function generateReason(augName, augTier, priority, winRate, champName, champRole, champTags, mechanicsText) {
  const eff = getAugmentEffect(augName);
  const wr = parseFloat(winRate);

  // Common patterns
  const corePhrases = {
    '亮出你的剑': `${champName}定位偏近战/贴脸输出，转近战判定后获得大量AD+吸血+攻速，${wr >= 55 ? '胜率高居不下' : '收益可观'}。对面有强控制链时注意近战判定会增加被集火风险。`,
    '双刀流': `攻击特效翻倍触发，${champTags.includes('射手') ? '对特效流射手是毁灭性提升' : '大幅提升on-hit伤害'}。但若出装不走特效流(如纯暴击)，收益打折。`,
    '踢踏舞': `平A加移速，${champName}走A拉扯的核心保障。${wr >= 52 ? '胜率说明一切' : '机动性就是生存'}。对面全近战时价值略降——你不需要风筝坦克。`,
    '暴击飞弹': `暴击触发AOE飞弹，${isCritChampion(champTags, 'ad') ? '暴击流核心装备下触发频率极高' : '需要一定暴击率支撑'}。走廊地形溅射伤害翻倍。${wr >= 54 ? '胜率顶尖，暴击流无脑拿。' : ''}`,
    '邦！': `技能命中附加额外伤害，${champName}的AOE技能多，团战中一次技能至少命中2-3人，触发稳定。适合技能型打法。`,
    '歌利亚巨人': `加最大HP+体型变大，${champTags.includes('坦克') ? '血量就是一切——W护盾、心之钢伤害全部挂钩HP' : '提升容错率的同时扩大技能范围'}。对面有%真伤英雄(薇恩等)时优先级下降。`,
    '连锁反应': champRole === 'ap' ? `AOE法术伤害，${champName}的法强装让这个海克斯伤害拉满。团战中心一发触发能炸半管血。` : `纯AP向海克斯，${champName}不出法强装，伤害低到可以忽略。40%出头的胜率不是巧合——拿了就是浪费。`,
    '余震': `控制后触发双抗加成，${champName}拥有稳定控制技能，触发条件宽松。2.5秒的双抗加成窗口覆盖关键对拼期。${champTags.includes('坦克') ? '坦克拿了硬度翻倍。' : ''}`,
    '重量级打击手': `普攻附带%最大生命值伤害，${champTags.includes('射手') ? '配合攻速装打坦克效率翻倍' : '对面多前排时价值极高'}。对面全脆皮阵容时优先级降一档。`,
    '点亮他们！': `攻速突破2.5上限，${champTags.includes('射手') ? '高攻速=高W触发频率=高伤害，后期3.0攻速下输出质变' : '依赖攻速的英雄拿到直接质变'}。非攻速流英雄跳过。`,
    '战争交响乐': `混伤AD+AP，一半属性对${champRole === 'ad' ? '纯AD的' + champName : '纯AP的' + champName}等于浪费。47%胜率在棱彩中垫底——看到跳过。`,
    '台风': `固定攻速加成，没有特效联动。${champTags.includes('射手') ? '点亮他们！不但加攻速还能突破上限，完全上位替代。' : '对不依赖攻速的英雄更是0收益。'}`,
  };

  if (corePhrases[augName]) {
    let reason = corePhrases[augName];
    // Add decision guidance for situational/avoid
    if (priority === '情境可选') reason += ' 拿到更好但非必须，看其他选项决定。';
    if (priority === '慎选避开') reason += ` 胜率仅${winRate}，拿了不如不拿。`;
    return reason;
  }

  // Generate based on augment type + champion role
  const lines = [];
  if (eff.type === 'ad') {
    if (champRole === 'ad' || champRole === 'assassin' || champRole === 'bruiser') {
      lines.push(`${augName}提供AD加成，${champName}物理输出流完全吃满。`);
      if (wr >= 50) lines.push(`${winRate}胜率证明了这点，同级别中值得优先。`);
    } else {
      lines.push(`${augName}偏向AD向，${champName}不走AD出装，收益有限。`);
    }
  } else if (eff.type === 'ap') {
    if (champRole === 'ap') {
      lines.push(`${augName}提供AP加成，${champName}法师出装完美适配。`);
    } else {
      lines.push(`${augName}偏AP向，${champName}没有法强装备，伤害加成几乎为零。`);
    }
  } else if (eff.type === 'tank') {
    if (champRole === 'tank' || champRole === 'bruiser') {
      lines.push(`${augName}提升坦度，${champName}的前排定位让这个加成值回票价。`);
    } else {
      lines.push(`${augName}加坦度但对${champRole}定位的${champName}来说，牺牲输出换容错不划算。`);
    }
  } else if (eff.type === 'sustain') {
    lines.push(`${augName}提供续航，${champTags.includes('坦克') || champTags.includes('战士') ? '长期团战中持续回血效果显著' : '但身板脆可能来不及触发就被秒'}。`);
  } else if (eff.type === 'mobility') {
    lines.push(`${augName}加移速/机动力，对于${champTags.join('+')}定位的${champName}，${champRole === 'assassin' || champRole === 'bruiser' ? '拉扯能力是刚需' : '机动性属于锦上添花'}。`);
  } else if (eff.type === 'onhit') {
    if (champRole === 'onhit' || champRole === 'attackSpeed') {
      lines.push(`${augName}的on-hit效果与${champName}的高攻速出装完美配合。`);
    } else {
      lines.push(`${augName}的on-hit效果需要高攻速支撑，${champName}攻速不高时触发有限。`);
    }
  } else if (eff.type === 'spell') {
    lines.push(`${augName}技能命中触发，${champName}的技能组${champTags.includes('法师') || champTags.includes('刺客') ? '能频繁触发' : '触发频率一般'}。`);
  } else if (eff.type === 'hybrid') {
    lines.push(`${augName}的AD+AP混伤设计，${champRole === 'hybrid' ? '混合出装的' + champName + '可以双向收益。' : champName + '只走单属性，一半加成浪费。'}`);
  } else if (eff.type === 'crit') {
    if (isCritChampion(champTags, '')) {
      lines.push(`${augName}的暴击加成与${champName}的暴击流出装高度契合，${wr >= 51 ? '是暴击流质变点' : '值得考虑'}。对面有兰顿/冰心时暴击收益降低。`);
    } else {
      lines.push(`${augName}强化暴击但${champName}不出暴击装，暴击率趋近于零——触发不了。`);
    }
  } else {
    lines.push(`${augName}${priority === '核心必拿' ? '的全局胜率优秀' : priority === '情境可选' ? '可拿但非必须' : '胜率偏低慎选'}。`);
  }

  // Add win rate context
  if (priority === '慎选避开') lines.push(`${winRate}胜率说明拿了大概率亏。`);
  if (priority === '核心必拿' && wr >= 53) lines.push(`${winRate}胜率证明确实强。`);

  return lines.join('');
}

// ======= MAIN UPGRADE FUNCTION =======
function upgradeChampion(data) {
  const champ = JSON.parse(JSON.stringify(data));
  const mech = mechanics[champ.id] || '';
  const tags = champ.tags || [];

  let changed = false;

  // Process each build's augments
  champ.builds?.forEach(build => {
    if (!build.augments?.length) return;

    const buildType = build.buildType || '';
    const role = getRoleType(tags, buildType);

    // Sort augments by win rate (descending) within each tier
    const byTier = {};
    build.augments.forEach(a => {
      const tier = a.tier || '白银';
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier].push(a);
    });

    const newAugments = [];
    for (const tier of ['棱彩', '黄金', '白银']) {
      const augs = byTier[tier] || [];
      augs.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

      // Assign new priority and generate new reason
      augs.forEach(a => {
        const newPriority = classifyAugment(a.name, role, a.winRate);
        // Check for crit champion special case
        let priority = newPriority;
        if (isCritChampion(tags, buildType) && a.name.includes('升级：无尽')) {
          priority = '核心必拿';
        }
        if (isCritChampion(tags, buildType) && a.name.toLowerCase().includes('暴击') && parseFloat(a.winRate) >= 48) {
          priority = '核心必拿';
        }

        const newReason = generateReason(a.name, tier, priority, a.winRate, champ.name, role, tags, mech);

        if (a.priority !== priority || a.reason !== newReason) changed = true;
        newAugments.push({
          ...a,
          priority,
          reason: newReason
        });
      });
    }

    build.augments = newAugments;
  });

  // Add summonerSpells if missing
  if (!champ.summonerSpells) {
    const role = getRoleType(tags, '');
    const ss = getDefaultSummonerSpells(tags, role);
    if (ss) { champ.summonerSpells = ss; changed = true; }
  }

  // Add whenToPick if missing
  if (!champ.whenToPick) {
    const wtp = getDefaultWhenToPick(champ.name, tags);
    if (wtp) { champ.whenToPick = wtp; changed = true; }
  }

  // Add generalTips if missing
  if (!champ.generalTips?.length) {
    const tips = getDefaultTips(champ.name, tags);
    if (tips.length) { champ.generalTips = tips; changed = true; }
  }

  return { champ, changed };
}

function getDefaultSummonerSpells(tags, role) {
  if (tags.includes('坦克') || tags.includes('战士')) return { primary: '雪球', secondary: '闪现', notes: '雪球进场接控制是基本连招；对面控制多换净化。' };
  if (tags.includes('射手')) return { primary: '雪球', secondary: '净化', notes: '雪球攻守兼备；对面控制链多必带净化，缺治疗时换治疗。' };
  if (tags.includes('法师')) return { primary: '雪球', secondary: '虚弱', notes: '法师雪球用于逃生/追击；对面刺客多换虚弱保命。' };
  if (tags.includes('刺客')) return { primary: '雪球', secondary: '净化', notes: '雪球贴脸爆发；对面硬控多换净化保证连招不被打断。' };
  if (tags.includes('辅助')) return { primary: '治疗', secondary: '虚弱', notes: '治疗保队友，虚弱克制对方突进；己方不缺治疗时可换雪球。' };
  return { primary: '雪球', secondary: '闪现', notes: '根据阵容灵活调整副选。' };
}

function getDefaultWhenToPick(name, tags) {
  const tagStr = tags.join('+');
  return {
    teamNeeds: `团队需要${tagStr}定位英雄时可选${name}。`,
    enemyComposition: `敌方${tags.includes('坦克') ? '多脆皮' : '缺控制'}时体验更好；具体视英雄机制调整。`,
    synergies: `配合${tags.includes('坦克') ? '有输出的后排' : '有控制的前排'}效果更佳。`,
    avoidWhen: `己方${tagStr}溢出的阵容慎选。`
  };
}

function getDefaultTips(name, tags) {
  return [`${name}的核心机制是利用好被动效果，熟悉技能连招节奏是发挥上限的关键。`];
}

// ======= MAIN =======
function main() {
  const toProcess = [];
  championFiles.forEach(f => {
    const id = f.replace('.json', '');
    if (args.only && id !== args.only) return;
    toProcess.push(id);
  });

  // Sort by tier (T0 first)
  toProcess.sort((a, b) => {
    const ta = statMap[a]?.tier || 'T4';
    const tb = statMap[b]?.tier || 'T4';
    const order = { 'T0': 0, 'T1': 1, 'T2': 2, 'T3': 3, 'T4': 4 };
    return (order[ta] || 99) - (order[tb] || 99);
  });

  const limit = Math.min(args.limit, toProcess.length);
  const selected = toProcess.slice(0, limit);

  console.log('='.repeat(60));
  console.log('海克斯推荐批量升级');
  console.log('='.repeat(60));
  console.log(`待处理: ${selected.length} 个英雄 (共 ${toProcess.length})`);
  if (args.dryRun) console.log('[DRY RUN 模式] 仅预览，不写入文件\n');

  let upgraded = 0, unchanged = 0;
  const changes = [];

  selected.forEach((id, i) => {
    const fp = path.join(CHAMPIONS_DIR, id + '.json');
    let data;
    try { data = JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch (e) { console.log(`[${i+1}/${selected.length}] ${id}: 读取失败`); return; }

    const { champ, changed } = upgradeChampion(data);

    if (changed) {
      upgraded++;
      changes.push({ id, name: champ.name, tier: statMap[id]?.tier || 'T4' });

      if (!args.dryRun) {
        fs.writeFileSync(fp, JSON.stringify(champ, null, 2), 'utf8');
      }
      console.log(`[${i+1}/${selected.length}] ✓ ${champ.name} (${id}) ${args.dryRun ? '【预览】' : '【已保存】'}`);
    } else {
      unchanged++;
      if (args.verbose) console.log(`[${i+1}/${selected.length}] - ${champ.name} (${id}) 无变化`);
    }
  });

  console.log(`\n完成: ${upgraded} 修改, ${unchanged} 不变`);
  if (args.dryRun) {
    console.log('\n使用以下命令执行实际修改:');
    console.log('  node scripts/batch-upgrade.cjs --force');
  } else {
    console.log('\n建议运行 npm run build 验证 JSON 格式。');
  }
}

main();
