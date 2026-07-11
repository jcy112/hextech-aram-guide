const fs=require('fs'),path=require('path');
const cd=path.join('src','data','champions');
const ix=path.join('src','data','champions-index.json');
const ch=JSON.parse(fs.readFileSync(ix,'utf8'));

// Simplified generation - each champion gets archetype-appropriate augments + matchup
let gen=0,skip=0;
for(const c of ch) {
  const fp=path.join(cd,c.id+'.json');
  let ex=null;
  try{ex=JSON.parse(fs.readFileSync(fp,'utf8'));}catch(e){}
  if(ex && ex.matchup && ex.builds && ex.builds[0] && ex.builds[0].id && ex.builds[0].type && ex.builds.length>=2){skip++;continue;}

  const t=c.tags;
  // Determine build type
  let bty='General',bn='通用出装',ci=[],fi=[],so='主Q副W，有R点R',sd=['Q','W','E','Q','Q','R','Q','W','Q','W','R','W','W','E','E','R','E','E'];
  if(t.includes('射手')){bty='AD';bn='ADC 出装';ci=['海妖杀手','卢安娜的飓风','无尽之刃'];fi=['海妖杀手','狂战士胫甲','卢安娜的飓风','无尽之刃','多米尼克领主的致意','饮血剑'];}
  else if(t.includes('法师')){bty='AP';bn='AP 法师出装';ci=['卢登的激荡','影焰','虚空之杖'];fi=['卢登的激荡','法师之靴','影焰','虚空之杖','灭世者的死亡之帽','视界专注'];}
  else if(t.includes('坦克')){bty='Tank';bn='坦克出装';ci=['心之钢','璀璨回响','千变者贾修'];fi=['心之钢','水银之靴','璀璨回响','千变者贾修','荆棘之甲','振奋盔甲'];so='主W副E，有R点R';}
  else if(t.includes('刺客')){bty='Assassin';bn='刺客出装';ci=['幽梦之灵','收集者','夜之锋刃'];fi=['幽梦之灵','明朗之靴','收集者','夜之锋刃','赛瑞尔达的怨恨','守护天使'];}
  else if(t.includes('战士')){bty='AD';bn='半肉战士出装';ci=['渴血战斧','黑色切割者','死亡之舞'];fi=['渴血战斧','水银之靴','黑色切割者','死亡之舞','斯特拉克的挑战护手','守护天使'];}
  else if(t.includes('辅助')){bty='Special';bn='辅助出装';ci=['月石再生器','救赎','炽热香炉'];fi=['月石再生器','明朗之靴','救赎','炽热香炉','米凯尔的祝福','警觉眼石'];}

  // Augments based on tags
  const augs=[];
  if(t.includes('射手')){augs.push({n:'连拨击锤',t:'棱彩',pr:'核心',sl:'S',r:'普攻额外5发飞弹=输出翻倍',d:'每次普攻=6次攻击触发'});augs.push({n:'灵巧',t:'白银',pr:'优先',sl:'S',r:'+60%攻速质变'});augs.push({n:'台风',t:'白银',pr:'优先',sl:'A',r:'普攻额外目标30%AD飞弹'});augs.push({n:'重量级打击手',t:'白银',pr:'优先',sl:'A',r:'普攻3.5%最大生命额外伤害'});}
  if(t.includes('法师')){augs.push({n:'尤里卡',t:'棱彩',pr:'核心',sl:'S',r:'技能加速=30%AP',d:'500AP=150技能急速'});augs.push({n:'珠光护手',t:'棱彩',pr:'优先',sl:'S',r:'技能可暴击+175%伤害'});augs.push({n:'魔法飞弹',t:'黄金',pr:'优先',sl:'A',r:'技能命中=3发飞弹追加'});augs.push({n:'回响施放',t:'棱彩',pr:'优先',sl:'S',r:'复制一次技能=双倍伤害'});}
  if(t.includes('坦克')){augs.push({n:'钢化你心',t:'黄金',pr:'核心',sl:'S',r:'心之钢300层×3倍效果'});augs.push({n:'歌利亚巨人',t:'棱彩',pr:'优先',sl:'S',r:'+35%生命+15%适应之力'});augs.push({n:'叠角龙',t:'白银',pr:'优先',sl:'S',r:'永久层数获取量+100%'});}
  if(t.includes('刺客')){augs.push({n:'秘术冲拳',t:'棱彩',pr:'核心',sl:'S',r:'命中减基础技能20%剩余CD'});augs.push({n:'全凭身法',t:'棱彩',pr:'优先',sl:'S',r:'位移技能+175技能急速'});augs.push({n:'飞身踢',t:'棱彩',pr:'优先',sl:'S',r:'处决低血+爆炸治疗'});}
  if(t.includes('战士')){augs.push({n:'灵魂虹吸',t:'黄金',pr:'核心',sl:'A',r:'12%技能吸血'});augs.push({n:'战争交响乐',t:'棱彩',pr:'优先',sl:'S',r:'致命节奏+征服者'});augs.push({n:'泰坦的坚决',t:'棱彩',pr:'优先',sl:'A',r:'战斗叠适应之力/双抗/体型'});}
  if(t.includes('辅助')){augs.push({n:'全心为你',t:'黄金',pr:'核心',sl:'S',r:'治疗/护盾+30%'});augs.push({n:'会心治疗',t:'黄金',pr:'优先',sl:'S',r:'治疗/护盾可暴击+40%'});augs.push({n:'急救用具',t:'白银',pr:'优先',sl:'A',r:'+20%治疗护盾强度'});}
  augs.push({n:'循环往复',t:'黄金',pr:'可选',sl:'A',r:'+60技能急速'});

  // Add hero-specific Q/W/E augments
  const id=c.id;
  const qHeroes=['nasus','yorick','darius','mordekaiser','gangplank','pantheon','camille','aatrox','illaoi','kayn','blitzcrank','pyke','warwick','xinzhao','vi','rengar','khazix','elise','nidalee','jayce','diana','corki','rumble','velkoz','xerath','ziggs','zoe','teemo','kaisa','graves','reksai','qiyana'];
  const eHeroes=['shaco','fizz','ekko','lucian','zeri','tryndamere','cassiopeia','akali','zilean'];
  const wHeroes=['volibear','masteryi','jax','sett','sylas','talon','vladimir'];
  if(qHeroes.includes(id)) augs.unshift({n:'邦！',t:'黄金',pr:'核心',sl:'S',r:'Q技能+100技能急速',d:'Q从主力技能变普攻频率。核心机制质变'});
  if(eHeroes.includes(id)) augs.unshift({n:'面包和奶酪',t:'黄金',pr:'核心',sl:'S',r:'E技能+100技能急速',d:'E无限循环释放'});
  if(wHeroes.includes(id)) augs.unshift({n:'面包和果酱',t:'黄金',pr:'核心',sl:'S',r:'W技能+100技能急速',d:'W无限循环释放'});
  // Special cases
  if(['sion','veigar','senna','swain','thresh','bard'].includes(id)) augs.unshift({n:'叠角龙',t:'白银',pr:'核心',sl:'S',r:'永久层数获取+100%',d:'核心无限成长机制翻倍'});
  if(['trundle','anivia','taliyah','ornn'].includes(id)) augs.unshift({n:'地形专家',t:'黄金',pr:'核心',sl:'S',r:'击退至墙壁/地形=额外伤害+眩晕',d:'走廊极限控制+伤害'});
  if(['urgot','belveth','kogmaw','vayne','varus'].includes(id)) augs.unshift({n:'连拨击锤',t:'棱彩',pr:'核心',sl:'S',r:'攻速×6倍攻击判定',d:'攻击特效触发频率爆炸'});
  if(['ezreal','ryze'].includes(id)) augs.unshift({n:'超负荷',t:'棱彩',pr:'核心',sl:'S',r:'其他技能重置指定技能CD',d:'无限技能链'});
  if(['lux','morgana'].includes(id)) augs.unshift({n:'咒语裂变',t:'棱彩',pr:'核心',sl:'S',r:'弹体命中一分为二',d:'走廊覆盖全场'});
  if(['garen','katarina','samira'].includes(id)) augs.unshift({n:'旋转至胜',t:'白银',pr:'核心',sl:'S',r:'旋转技能+30AP+30%伤害',d:'专属强化'});
  if(['soraka','sona'].includes(id)) augs.unshift({n:'会心治疗',t:'黄金',pr:'核心',sl:'S',r:'治疗可暴击+40%',d:'奶量双倍'});
  if(['heimerdinger','malzahar','annie'].includes(id)) augs.unshift({n:'仆从大师',t:'黄金',pr:'核心',sl:'S',r:'召唤物+40%体/命/伤',d:'召唤物全面质变'});
  if(['leona','nautilus','alistar'].includes(id)) augs.unshift({n:'
