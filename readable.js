const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={bazi:'八字',meihua:'梅花易数',pair:'双人合婚',astrology:'星座',mbti:'MBTI'};
const topics={personality:'个人倾向',work:'做事与表达',relationship:'感情与相处',year:'年度主题',overview:'卦象启发',communication:'沟通偏好'};
let filter='all',subject='pair';
export function resetReadingFilters(mode){filter=mode==='liunian'?'year':'all';subject=mode==='pair'?'pair':'a';}
export function chooseReadingFilter(value,who='a'){filter=value;subject=who;}
export function mountMbtiFields(){
  const types=[];for(const e of ['I','E'])for(const s of ['S','N'])for(const t of ['T','F'])for(const j of ['J','P'])types.push(e+s+t+j);
  for(const [i,fieldset] of document.querySelectorAll('#people fieldset').entries()){
    const label=document.createElement('label');label.className='mbti-field';label.innerHTML=`MBTI 类型 <select name="${i===0?'a':'b'}-mbti"><option value="">不了解 / 暂不填写</option>${types.map(t=>`<option value="${t}">${t}</option>`).join('')}</select>`;
    fieldset.querySelector('.person-option-fields').append(label);
  }
}
export function readableView(report,mode){
  if(!report)return '<div class="notice">生活化解读暂不可用，盘面仍可查看。</div>';
  let cards=report.cards.filter(c=>c.subject===subject);
  if(filter!=='all')cards=cards.filter(c=>filter==='identity'?['astrology','mbti'].includes(c.system):c.system===filter||c.topic===filter);
  const filters=mode==='pair'?[['all','合婚解读'],['pair','八字与卦象'],['mbti','沟通偏好']]:[['all','全部解读'],['bazi','八字'],['relationship','感情'],['work','做事'],['meihua','梅花'],['identity','星座与 MBTI'],['year','年度主题']];
  const subjects=mode==='pair'?`<div class="reading-subjects" aria-label="解读对象">${[['pair','两个人的关系'],['a','A 方个人'],['b','B 方个人']].map(([v,label])=>`<button type="button" data-subject="${v}" aria-pressed="${v===subject}">${label}</button>`).join('')}</div>`:'';
  return `<section class="readable"><div class="reading-title"><div><p class="eyebrow">BEYOND THE CHART</p><h3>把盘面，读成日常语言。</h3></div><span class="badge">有依据的文化阅读</span></div><p class="reading-intro">${mode==='pair'?'从传统符号与自报偏好，找到可以一起讨论的相处议题。':'从个人倾向、做事方式、感情与年度主题，逐条理解盘面。'}</p>${subjects}<div class="reading-filters" aria-label="解读筛选">${filters.map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="${key===filter}">${label}</button>`).join('')}</div><div class="reading-cards">${cards.length?cards.map((c,index)=>`<article class="reading-card"><div class="reading-card-top"><span>${esc(labels[c.system])} · ${esc(topics[c.topic])}</span><small>${String(index+1).padStart(2,'0')}</small></div><h4>${esc(c.title)}</h4><p>${esc(c.summary)}</p><div class="reflection"><strong>可以怎样理解</strong><p>${esc(c.reflection)}</p></div><details class="reading-evidence"><summary>查看这条解释的依据</summary><dl>${c.evidence.map(e=>`<dt>${esc(e.explanation)}</dt><dd>${esc(e.value)}<small>${esc(e.path)}</small></dd>`).join('')}</dl><p class="rule-meta">规则 ${esc(c.ruleId)} · v${esc(c.ruleVersion)}<br>流派 / 方法：${esc(c.schoolId)}<br>审核：结构与出处已核对；生活化建议为项目自编，未经专家审定。</p>${c.sourceIds.map(id=>{const s=report.sources.find(s=>s.id===id);return s?`<div class="reading-source"><strong>${esc(s.title)}</strong><p>${esc(s.section)}</p><small>${esc(s.license)} · 核对 ${esc(s.checkedOn)}</small></div>`:'';}).join('')}<p class="hint">${c.caveats.map(esc).join('<br>')}</p></details></article>`).join(''):'<div class="notice">这一筛选下暂无可用解读。MBTI 需先在出生表单中自选已有类型。</div>'}</div><details class="reading-limits"><summary>阅读范围与尚未覆盖的内容</summary>${report.limitations.map(s=>`<p>${esc(s)}</p>`).join('')}${report.missingInputs.map(s=>`<p>${esc(s)}</p>`).join('')}<p>解释配置 ${esc(report.profile.id)} · ${esc(report.profile.version)}<br>${esc(report.profile.hash)}</p></details></section>`;
}
export function bindReadable(rerender){
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;rerender();document.querySelector(`[data-filter="${filter}"]`)?.focus();});
  document.querySelectorAll('[data-subject]').forEach(button=>button.onclick=()=>{subject=button.dataset.subject;filter='all';rerender();document.querySelector(`[data-subject="${subject}"]`)?.focus();});
}

