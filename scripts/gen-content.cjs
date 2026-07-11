/**
 * 海克斯大乱斗攻略站 — AI 内容生成脚本
 *
 * 用法:
 *   node scripts/gen-content.cjs --dry-run          # 预览将要处理的英雄
 *   node scripts/gen-content.cjs --limit 5           # 生成前5个英雄
 *   node scripts/gen-content.cjs --only vayne        # 仅生成指定英雄
 *   node scripts/gen-content.cjs --limit 10 --force  # 强制覆盖已审核的英雄
 *
 * 环境变量:
 *   OPENAI_API_KEY  - API 密钥 (必填)
 *   OPENAI_BASE_URL - API 地址 (默认 https://api.openai.com/v1)
 *   OPENAI_MODEL    - 模型名称 (默认 gpt-4o)
 */

const fs = require('fs');
const path = require('path');

// ─── 路径常量 ───────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const CHAMPIONS_DIR = path.join(DATA, 'champions');
const GENERATED_DIR = path.join(ROOT, 'generated');
const PROMPTS_DIR = path.join(__dirname, 'prompts');
const INDEX_PATH = path.join(DATA, 'champions-index.json');
const STATS_PATH = path.join(DATA, 'champion-stats.json');
const AUGMENT_STATS_PATH = path.join(DATA, 'augment-stats.json');
const ALL_AUGMENTS_PATH = path.join(DATA, 'all-augments-aramkit.json');
const STATUS_PATH = path.join(DATA, 'content-status.json');
const MECHANICS_PATH = path.join(DATA, 'champion-mechanics.json');

// ─── CLI 参数解析 ───────────────────────────────────────────
function parseArgs() {
  const args = {
    limit: Infinity,
    only: null,
    force: false,
    dryRun: false,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || '',
    skipAugments: false,
    skipMatchup: false,
    skipWhenToPick: false,
    skipSummonerSpells: false,
    skipGeneralTips: false
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--limit': args.limit = parseInt(argv[++i]); break;
      case '--only': args.only = argv[++i]; break;
      case '--force': args.force = true; break;
      case '--dry-run': args.dryRun = true; break;
      case '--model': args.model = argv[++i]; break;
      case '--endpoint': args.baseUrl = argv[++i]; break;
      case '--api-key': args.apiKey = argv[++i]; break;
      case '--skip-augments': args.skipAugments = true; break;
      case '--skip-matchup': args.skipMatchup = true; break;
      case '--skip-wtp': args.skipWhenToPick = true; break;
      case '--skip-ss': args.skipSummonerSpells = true; break;
      case '--skip-tips': args.skipGeneralTips = true; break;
    }
  }
  return args;
}

// ─── 数据加载 ───────────────────────────────────────────────
function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadPrompt(name) {
  const fp = path.join(PROMPTS_DIR, name + '.txt');
  if (!fs.existsSync(fp)) return '';
  return fs.readFileSync(fp, 'utf8').trim();
}

// ─── 队列构建 ───────────────────────────────────────────────
function buildQueue(args) {
  const championsIndex = loadJSON(INDEX_PATH);
  const championStats = loadJSON(STATS_PATH);
  const contentStatus = fs.existsSync(STATUS_PATH) ? loadJSON(STATUS_PATH) : {};

  const statMap = {};
  championStats.forEach(s => { statMap[s.id] = s; });

  // 按 tier 排序: T0 → T1 → T2 → T3 → T4
  const tierOrder = { 'T0': 0, 'T1': 1, 'T2': 2, 'T3': 3, 'T4': 4 };

  let queue = championsIndex.map(c => {
    const stat = statMap[c.id] || {};
    return {
      id: c.id,
      name: c.name,
      title: c.title,
      tags: c.tags || [],
      imageUrl: c.imageUrl || '',
      tier: stat.tier || 'T4',
      winRate: stat.winRate || 'N/A',
      pickCount: stat.pickCount || 0,
      rank: stat.rank || 999,
      reviewed: contentStatus[c.id]?.contentStatus === 'approved'
    };
  });

  // 排序: 按 tier → rank
  queue.sort((a, b) => {
    const tDiff = (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99);
    if (tDiff !== 0) return tDiff;
    return (a.rank ?? 999) - (b.rank ?? 999);
  });

  // 过滤条件
  if (args.only) {
    queue = queue.filter(c => c.id === args.only);
    if (queue.length === 0) {
      console.error(`英雄 "${args.only}" 未找到`);
      process.exit(1);
    }
  }

  if (!args.force) {
    const skipped = queue.filter(c => c.reviewed).length;
    queue = queue.filter(c => !c.reviewed);
    if (skipped > 0) console.log(`跳过 ${skipped} 个已审核英雄 (--force 可覆盖)`);
  }

  if (args.limit < queue.length) {
    queue = queue.slice(0, args.limit);
  }

  return queue;
}

// ─── 英雄机制摘要 ───────────────────────────────────────────
function getMechanics(championId, tags) {
  const mechanics = loadJSON(MECHANICS_PATH);
  if (mechanics[championId]) return mechanics[championId];
  return `${tags.join('+')}定位英雄，技能含伤害+控制+位移等标准机制。(请补充详细摘要到 champion-mechanics.json)`;
}

// ─── 海克斯候选池 ───────────────────────────────────────────
function getAugmentPool(champion, buildType) {
  const allAugments = loadJSON(ALL_AUGMENTS_PATH);
  const augmentStats = loadJSON(AUGMENT_STATS_PATH);
  const statMap = {};
  augmentStats.forEach(a => { statMap[a.name] = a.winRate; });

  // 分类：棱彩 + 黄金 + 白银
  const tiers = { '棱彩': [], '黄金': [], '白银': [] };
  allAugments.forEach(a => {
    const t = a.tier || '白银';
    if (tiers[t]) {
      tiers[t].push({ name: a.name, tier: t, winRate: statMap[a.name] || 'N/A' });
    }
  });

  // 每档取前N个（按胜率排序）
  const pool = [];
  for (const t of ['棱彩', '黄金', '白银']) {
    tiers[t].sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
    pool.push(...tiers[t].slice(0, 20));
  }

  return pool.map(a => `${a.name} ${a.winRate}`).join(', ');
}

// ─── Prompt 模板填充 ────────────────────────────────────────
function fillTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}

// ─── API 调用 ───────────────────────────────────────────────
async function callLLM(systemPrompt, userPrompt, args) {
  if (!args.apiKey) {
    throw new Error('缺少 API Key: 设置 OPENAI_API_KEY 环境变量或使用 --api-key');
  }

  const res = await fetch(`${args.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${args.apiKey}`
    },
    body: JSON.stringify({
      model: args.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 错误 ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ─── JSON 提取与校验 ────────────────────────────────────────
function extractJSON(text) {
  // 尝试直接解析
  try { return JSON.parse(text); } catch (e) { /* ignore */ }

  // 尝试从 markdown 代码块中提取
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()); } catch (e) { /* ignore */ }
  }

  // 尝试匹配最外层 {} 或 []
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch (e) { /* ignore */ }
  }

  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch (e) { /* ignore */ }
  }

  return null;
}

function validateAugments(augments) {
  if (!Array.isArray(augments)) return { valid: false, error: 'augments 必须是数组' };
  const validPriorities = ['核心必拿', '情境可选', '慎选避开'];
  for (const a of augments) {
    if (!a.name) return { valid: false, error: `海克斯缺少 name: ${JSON.stringify(a)}` };
    if (!validPriorities.includes(a.priority))
      return { valid: false, error: `无效 priority "${a.priority}" in "${a.name}"` };
  }
  return { valid: true };
}

function validateWhenToPick(wtp) {
  const fields = ['teamNeeds', 'enemyComposition', 'synergies', 'avoidWhen'];
  for (const f of fields) {
    if (!wtp[f] || typeof wtp[f] !== 'string' || wtp[f].length < 5) {
      return { valid: false, error: `whenToPick.${f} 缺失或过短` };
    }
  }
  return { valid: true };
}

function validateSummonerSpells(ss) {
  const fields = ['primary', 'secondary', 'notes'];
  for (const f of fields) {
    if (!ss[f] || typeof ss[f] !== 'string' || ss[f].length < 2) {
      return { valid: false, error: `summonerSpells.${f} 缺失或过短` };
    }
  }
  return { valid: true };
}

// ─── 合并策略: 只写文本字段，保留数据字段 ──────────────────
function mergeContent(existing, generated, section) {
  // existing: 当前 champion JSON
  // generated: LLM 返回的新内容
  // section: 'augments' | 'matchup' | 'whenToPick' | 'summonerSpells' | 'generalTips'

  const merged = JSON.parse(JSON.stringify(existing));

  switch (section) {
    case 'augments': {
      // 为每个 build 更新 augments
      if (!Array.isArray(generated)) break;
      const genByName = {};
      generated.forEach(a => { genByName[a.name] = a; });

      merged.builds.forEach(build => {
        build.augments = build.augments.map(oldAug => {
          const gen = genByName[oldAug.name];
          if (gen) {
            return {
              ...oldAug,           // 保留原有字段 (winRate etc.)
              priority: gen.priority,
              reason: gen.reason
            };
          }
          return oldAug;
        });
      });
      break;
    }
    case 'matchup': {
      for (const key of ['againstTank', 'againstPoke', 'againstAssassin', 'againstHeal']) {
        if (generated[key]) {
          merged.matchup = merged.matchup || {};
          merged.matchup[key] = {
            ...merged.matchup[key],
            strategy: generated[key].strategy || merged.matchup[key]?.strategy,
            tips: generated[key].tips || merged.matchup[key]?.tips
          };
        }
      }
      break;
    }
    case 'whenToPick': {
      merged.whenToPick = {
        teamNeeds: generated.teamNeeds || '',
        enemyComposition: generated.enemyComposition || '',
        synergies: generated.synergies || '',
        avoidWhen: generated.avoidWhen || ''
      };
      break;
    }
    case 'summonerSpells': {
      merged.summonerSpells = {
        primary: generated.primary || '',
        secondary: generated.secondary || '',
        notes: generated.notes || ''
      };
      break;
    }
    case 'generalTips': {
      merged.generalTips = Array.isArray(generated) ? generated : [];
      break;
    }
  }

  return merged;
}

// ─── 主流程 ─────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  const queue = buildQueue(args);

  console.log('='.repeat(60));
  console.log('英雄内容生成器');
  console.log('='.repeat(60));
  console.log(`待处理: ${queue.length} 个英雄`);
  console.log(`模型: ${args.model}`);
  console.log(`API: ${args.baseUrl}`);
  if (args.dryRun) {
    console.log('\n[Dry Run] 将处理以下英雄:');
    queue.forEach(c => console.log(`  ${c.tier} | ${c.name} (${c.id}) | WR ${c.winRate}`));
    console.log('\n使用 --dry-run 预览模式，未实际调用 API');
    return;
  }

  if (!args.apiKey) {
    console.error('\n错误: 未设置 API Key');
    console.error('请设置环境变量 OPENAI_API_KEY 或使用 --api-key <key>');
    process.exit(1);
  }

  // 确保输出目录存在
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const systemPrompt = loadPrompt('system');
  const reviewEntries = [];
  let success = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const champ = queue[i];
    console.log(`\n[${i + 1}/${queue.length}] ${champ.name} (${champ.id}) - ${champ.tier}`);

    // 加载现有 JSON
    const champPath = path.join(CHAMPIONS_DIR, `${champ.id}.json`);
    let existing;
    try {
      existing = loadJSON(champPath);
    } catch (e) {
      console.log(`  跳过: 无法加载 ${champPath}`);
      failed++;
      continue;
    }

    const mechanics = getMechanics(champ.id, champ.tags);
    const buildType = existing.builds?.[0]?.buildType || '';
    const buildName = existing.builds?.[0]?.name || '';
    const augmentPool = getAugmentPool(champ, buildType);

    const templateVars = {
      name: champ.name,
      title: champ.title,
      tags: champ.tags.join('+'),
      skillSummary: mechanics,
      winRate: champ.winRate,
      tier: champ.tier,
      buildName,
      buildType,
      augmentPool
    };

    let merged = JSON.parse(JSON.stringify(existing));

    // --- Augments ---
    if (!args.skipAugments && existing.builds?.length) {
      console.log('  生成 augments...');
      try {
        const prompt = fillTemplate(loadPrompt('build-augments'), templateVars);
        const raw = await callLLM(systemPrompt, prompt, args);
        const data = extractJSON(raw);
        if (data) {
          const validation = validateAugments(data);
          if (validation.valid) {
            merged = mergeContent(merged, data, 'augments');
            console.log(`  ✓ augments (${data.length} 条)`);
          } else {
            console.log(`  ✗ augments 校验失败: ${validation.error}`);
          }
        } else {
          console.log('  ✗ augments JSON 解析失败');
        }
      } catch (e) {
        console.log(`  ✗ augments 错误: ${e.message}`);
      }
    }

    // --- Matchup ---
    if (!args.skipMatchup) {
      console.log('  生成 matchup...');
      try {
        const prompt = fillTemplate(loadPrompt('matchup'), templateVars);
        const raw = await callLLM(systemPrompt, prompt, args);
        const data = extractJSON(raw);
        if (data) {
          merged = mergeContent(merged, data, 'matchup');
          console.log('  ✓ matchup');
        } else {
          console.log('  ✗ matchup JSON 解析失败');
        }
      } catch (e) {
        console.log(`  ✗ matchup 错误: ${e.message}`);
      }
    }

    // --- WhenToPick ---
    if (!args.skipWhenToPick && !existing.whenToPick?.teamNeeds) {
      console.log('  生成 whenToPick...');
      try {
        const prompt = fillTemplate(loadPrompt('when-to-pick'), templateVars);
        const raw = await callLLM(systemPrompt, prompt, args);
        const data = extractJSON(raw);
        if (data) {
          const validation = validateWhenToPick(data);
          if (validation.valid) {
            merged = mergeContent(merged, data, 'whenToPick');
            console.log('  ✓ whenToPick');
          } else {
            console.log(`  ✗ whenToPick 校验失败: ${validation.error}`);
          }
        } else {
          console.log('  ✗ whenToPick JSON 解析失败');
        }
      } catch (e) {
        console.log(`  ✗ whenToPick 错误: ${e.message}`);
      }
    }

    // --- SummonerSpells ---
    if (!args.skipSummonerSpells && !existing.summonerSpells?.primary) {
      console.log('  生成 summonerSpells...');
      try {
        const prompt = fillTemplate(loadPrompt('summoner-spells'), templateVars);
        const raw = await callLLM(systemPrompt, prompt, args);
        const data = extractJSON(raw);
        if (data) {
          const validation = validateSummonerSpells(data);
          if (validation.valid) {
            merged = mergeContent(merged, data, 'summonerSpells');
            console.log('  ✓ summonerSpells');
          } else {
            console.log(`  ✗ summonerSpells 校验失败: ${validation.error}`);
          }
        } else {
          console.log('  ✗ summonerSpells JSON 解析失败');
        }
      } catch (e) {
        console.log(`  ✗ summonerSpells 错误: ${e.message}`);
      }
    }

    // --- GeneralTips ---
    if (!args.skipGeneralTips) {
      console.log('  生成 generalTips...');
      try {
        const prompt = fillTemplate(loadPrompt('general-tips'), templateVars);
        const raw = await callLLM(systemPrompt, prompt, args);
        const data = extractJSON(raw);
        if (Array.isArray(data) && data.length > 0) {
          merged = mergeContent(merged, data, 'generalTips');
          console.log(`  ✓ generalTips (${data.length} 条)`);
        } else {
          console.log('  ✗ generalTips 解析或校验失败');
        }
      } catch (e) {
        console.log(`  ✗ generalTips 错误: ${e.message}`);
      }
    }

    // --- 写入草稿 ---
    const draftPath = path.join(GENERATED_DIR, `${champ.id}.json`);
    fs.writeFileSync(draftPath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`  → 草稿已写入 ${draftPath}`);

    reviewEntries.push({
      id: champ.id,
      name: champ.name,
      tier: champ.tier,
      draftPath: `generated/${champ.id}.json`,
      reviewChecks: [
        '所有装备/海克斯/召唤师技能名称真实存在',
        '海克斯三档分级合理，reason有决策价值',
        '无通用废话（雪球最佳/走廊地形等）',
        '内容英雄专属，可区分英雄身份',
        'whenToPick四字段均已填写',
        'summonerSpells三字段均已填写',
        'generalTips无跨英雄通用句',
        'JSON格式合法、字段齐全'
      ]
    });
    success++;
  }

  // --- 生成 review-queue.md ---
  const reviewMd = generateReviewQueue(reviewEntries);
  const reviewPath = path.join(GENERATED_DIR, 'review-queue.md');
  fs.writeFileSync(reviewPath, reviewMd, 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`完成: ${success} 成功, ${failed} 失败 (共 ${queue.length})`);
  console.log(`草稿目录: ${GENERATED_DIR}/`);
  console.log(`审核清单: ${reviewPath}`);
  console.log('='.repeat(60));
}

function generateReviewQueue(entries) {
  const lines = [
    '# 内容审核清单',
    '',
    `生成时间: ${new Date().toISOString().split('T')[0]}`,
    `待审核: ${entries.length} 个英雄`,
    '',
    '## 审核 Checklist (站长逐条签收)',
    '',
    '| 英雄 | Tier | 审核状态 | 装备名 | 海克斯分级 | 无废话 | 英雄专属 | WTP | SS | Tips |',
    '|------|------|---------|--------|-----------|--------|---------|-----|-----|------|',
    ...entries.map(e =>
      `| ${e.name} (${e.id}) | ${e.tier} | ⬜ 待审核 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |`
    ),
    '',
    '## 详细审核要点',
    '',
    ...entries.map(e => [
      `### ${e.name} (\`${e.id}\`) - ${e.tier}`,
      '',
      `草稿: \`${e.draftPath}\``,
      '',
      '- [ ] 所有装备/海克斯/召唤师技能名称真实存在，无拼写错误、无编造',
      '- [ ] 海克斯三档分级合理：核心必拿确实是质变点，慎选避开确实负收益',
      '- [ ] 无通用废话：tips/strategy 中找不到"雪球最佳""走廊地形"等跨英雄通用句',
      `- [ ] 内容英雄专属：读完后能区分"这是${e.name}"而非"任意同类型英雄"`,
      '- [ ] 与数据不自相矛盾（如推荐AD出装却不拿任何AD向海克斯）',
      '- [ ] 语气/长度符合要求，JSON格式合法、字段齐全',
      '- [ ] whenToPick四字段均已填写，非空',
      '',
      '---',
      ''
    ].join('\n'))
  ];
  return lines.join('\n');
}

main().catch(e => {
  console.error('致命错误:', e.message);
  process.exit(1);
});
