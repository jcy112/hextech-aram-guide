// 合并手写内容到 champion JSON 文件
const fs = require('fs');
const path = require('path');
const batch = JSON.parse(fs.readFileSync(path.join(__dirname, 'content-batch.json'), 'utf8'));
const champsDir = path.join(__dirname, '..', 'src', 'data', 'champions');
let updated = 0;

for (const [id, content] of Object.entries(batch)) {
  const fp = path.join(champsDir, id + '.json');
  if (!fs.existsSync(fp)) { console.log('SKIP:', id); continue; }
  const champ = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (content.augs && champ.builds?.[0]?.augments) {
    const augMap = {};
    content.augs.forEach(a => { augMap[a.name] = a; });
    champ.builds.forEach(build => {
      build.augments = build.augments.map(old => {
        const nu = augMap[old.name];
        if (nu) { old.priority = nu.p; old.reason = nu.r; }
        return old;
      });
    });
  }
  if (content.ss) champ.summonerSpells = { primary: content.ss.p, secondary: content.ss.s, notes: content.ss.n };
  if (content.wtp) champ.whenToPick = { teamNeeds: content.wtp.tn, enemyComposition: content.wtp.ec, synergies: content.wtp.sy, avoidWhen: content.wtp.aw };

  // Remove universal tips
  if (champ.generalTips) {
    champ.generalTips = champ.generalTips.filter(t =>
      !t.includes('雪球是最佳') && !t.includes('走廊地形') && !t.includes('大乱斗兵线') &&
      !t.includes('根据对局情况灵活调整') && !t.includes('大乱斗不能回家') &&
      !t.includes('注意走位不要站太靠前') && !t.includes('优先打能打到的目标') &&
      !t.includes('不要第一个进场等控制') && !t.includes('找准时机切后排') &&
      !t.includes('活下来利用吸血') && !t.includes('生存装备优先级')
    );
    if (!champ.generalTips.length) delete champ.generalTips;
  }
  // Remove universal tips from build tips
  champ.builds?.forEach(b => {
    if (b.tips) {
      b.tips = b.tips.filter(t => !t.includes('根据对局情况灵活调整') && !t.includes('大乱斗不能回家') && !t.includes('生存装备优先级'));
      if (!b.tips.length) delete b.tips;
    }
  });
  // Remove generic matchup content
  if (champ.matchup) {
    for (const k of Object.keys(champ.matchup)) {
      const m = champ.matchup[k];
      if (m.strategy?.includes('利用自身优势应对坦克阵容') || m.strategy?.includes('保持距离不正面接消耗') || m.strategy?.includes('脆皮出防御装') || m.strategy?.includes('尽早出重伤装备')) delete m.strategy;
      if (m.tips?.includes('打坦=持久战') || m.tips?.includes('不要在中路正面站立') || m.tips?.includes('刺客目标=脆皮') || m.tips?.includes('大乱斗自己出重伤最保险')) delete m.tips;
    }
  }

  fs.writeFileSync(fp, JSON.stringify(champ, null, 2), 'utf8');
  updated++;
  console.log('OK:', id, champ.name);
}
console.log('Done:', updated, 'champions updated');
