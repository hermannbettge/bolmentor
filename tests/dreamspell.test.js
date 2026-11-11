import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateKin, parseCivilDate, civilDateISO, SEALS, TONES } from '../src/lib/mayanCalendar.js'
import { REGEN_DAYS, REGEN_PROVENANCE, getRegenDay } from '../src/data/regenDays.js'
import { calendarFacts } from '../server/lib/mayaContext.js'
import { computeGoodDays, generateKinTable, detectActivity, resolveActivityRange, SEAL_KNOWLEDGE, TONE_KNOWLEDGE } from '../server/lib/mayaActivities.js'
import { KNOWLEDGE_BASE } from '../src/lib/knowledgeBase.js'
const iso = d => d.toISOString().slice(0,10)
const start = new Date('2027-05-14T00:00:00Z')
const mod = (a,m) => (a % m + m) % m
function dayKin(k) { return calculateKin(iso(new Date(+start+(k-1)*86400000))) }
// Independent seal lookup from the Foundation oracle readout, zero-based.
const analogs = [17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,19,18]
const guides = [0,12,4,16,8,0,12,4,16,8,0,12,4]
test('Published independent date anchors and all 2027 days', () => {
 for(const [date,kin] of Object.entries({'1987-07-26':34,'1993-07-26':144,'2012-12-21':207,'2023-10-21':1,'2024-07-08':1,'2026-08-27':1,'2027-01-01':128,'2027-05-13':260,'2027-05-14':1,'2027-12-31':232,'2028-01-02':234,'2028-01-03':235,'1965-07-18':56,'2025-11-11':232}))assert.equal(calculateKin(date).kin,kin,date)
 for(let i=0;i<365;i++) {const date=iso(new Date(Date.UTC(2027,0,1+i)));assert.equal(calculateKin(date).kin,mod(127+i,260)+1,date)}
})
test('Complete 260-kin oracle, tones, colors and 20 waves',()=>{
 const found=new Set()
 for(let k=1;k<=260;k++){
  const x=dayKin(k),s=(k-1)%20,t=(k-1)%13+1;found.add(x.kin)
  assert.equal(x.kin,k);assert.equal(x.seal,SEALS[s].name);assert.equal(x.tone,TONES[t-1].name)
  assert.equal(x.wavespell,Math.floor((k-1)/13)+1)
  assert.equal(x.analogIndex,analogs[s]);assert.equal(dayKin(x.analogKin).toneNumber,t)
  assert.equal(dayKin(x.analogKin).analogKin,k)
  assert.equal(x.antipodeIndex,(s+10)%20);assert.equal(dayKin(x.antipodeKin).antipodeKin,k)
  assert.equal(x.occultKin,261-k);assert.equal(x.occultSealIndex,19-s)
  assert.equal(dayKin(x.occultKin).toneNumber+t,14);assert.equal(dayKin(x.occultKin).occultKin,k)
  assert.equal(x.guideIndex,(s+guides[t-1])%20);assert.equal(SEALS[x.guideIndex].color,x.sealColor)
  assert.equal(dayKin(x.guideKin).toneNumber,t)
  if([1,6,11].includes(t))assert.equal(x.guideKin,k)
 }
 assert.equal(found.size,260)
})
test('All ordinary civil dates 1900–2100 match an independent leap-exclusion method',()=>{
 const anchor=new Date('1993-07-26T00:00:00Z')
 function leapCountBefore(d){let n=0;for(let y=1900;y<=2100;y++){if(y%4===0&&(y%100!==0||y%400===0)&&Date.UTC(y,1,29)<+d)n++}return n}
 const base=leapCountBefore(anchor)
 for(let d=new Date('1900-01-01T00:00:00Z');d.getUTCFullYear()<=2100;d.setUTCDate(d.getUTCDate()+1)){
  if(d.getUTCMonth()===1&&d.getUTCDate()===29)continue
  const expected=mod(143+(d-anchor)/86400000-(leapCountBefore(d)-base),260)+1
  assert.equal(calculateKin(iso(d)).kin,expected,iso(d))
 }
})
test('Date validation, negative offsets, leap-day policy and July 25',()=>{
 for(const x of ['2027-02-29','2027-04-31','1900-02-29','2100-02-29','2027-13-01','garbage','2027-01-01T12:00:00Z','0000-01-01'])assert.throws(()=>calculateKin(x),RangeError)
 assert.equal(calculateKin('18.7.1965').kin,56)
 for(const year of [1904,1964,1992,2000,2024,2028,2096]){
  const a=calculateKin(`${year}-02-28`),b=calculateKin(`${year}-03-01`),special=calculateKin(`${year}-02-29`)
  assert.equal(b.kin,a.kin%260+1);assert.equal(special.specialDay,'hunab-ku');assert.equal(special.toneNumber,null)
  assert.equal(calculateKin(`${year}-02-29`,{leapDayBirth:'before-noon'}).kin,a.kin)
  assert.equal(calculateKin(`${year}-02-29`,{leapDayBirth:'after-noon'}).kin,b.kin)
 }
 assert.equal(calculateKin('2027-07-26').kin,calculateKin('2027-07-25').kin%260+1)
 assert.equal(civilDateISO(new Date('2027-01-01T23:30:00Z')),'2027-01-02')
 assert.equal(civilDateISO(new Date('2027-07-01T22:30:00Z')),'2027-07-02')
})
test('Every preserved regeneration record is valid; both storm waves cover exactly Kin 79–91',()=>{
 for(const [date,r] of Object.entries(REGEN_DAYS)){parseCivilDate(date);assert.ok(Number.isInteger(r.level)&&r.level>=0&&r.level<=3);if(r.wave)assert.equal(calculateKin(date).wavespell,7)}
 for(const start of ['2026-11-13','2027-07-31'])for(let i=0;i<13;i++){const date=iso(new Date(+new Date(start+'T00:00:00Z')+i*86400000));assert.equal(getRegenDay(date).wave,true);assert.equal(calculateKin(date).kin,79+i)}
 assert.equal(Object.values(REGEN_DAYS).filter(x=>x.wave).length,26)
 assert.equal(REGEN_PROVENANCE.status,'editorial-unverified');assert.equal(getRegenDay('2028-01-01'),null)
})
test('Activity detection uses the current user question and whole words',()=>{
 assert.equal(detectActivity([{role:'user',content:'Akquise heute?'},{role:'assistant',content:'Akquise'},{role:'user',content:'Sport im Januar 2027?'}]),'sport')
 assert.equal(detectActivity([{role:'user',content:'Ich brauche eine Antwort'}]),null)
 assert.equal(detectActivity([{role:'user',content:'Meine Partnerschaft'}]),null)
})
test('Activity ranges, vetoes, qualities and no undefined metadata',()=>{
 const now=new Date('2026-11-11T00:00:00Z'),end=new Date('2027-12-31T00:00:00Z')
 const ask=text=>resolveActivityRange([{role:'user',content:text}],now,end)
 assert.equal(iso(ask('Akquise im März 2027').start),'2027-03-01');assert.equal(iso(ask('Akquise im März 2027').end),'2027-03-31')
 assert.equal(ask('nächste Woche'),null);assert.equal(ask('2027-02-30'),null)
 assert.equal(iso(ask('diesen Monat').start),'2026-11-01')
 const rows=generateKinTable(new Date('2024-02-28T00:00:00Z'),new Date('2024-03-01T00:00:00Z'))
 assert.equal(rows.length,3);assert.ok(rows[1].includes('kein reguläres Kin'));assert.ok(!rows.join().includes('undefined'))
 const a=computeGoodDays('akquise',new Date('2027-01-01T00:00:00Z'),new Date('2027-12-31T00:00:00Z'))
 assert.deepEqual(a,computeGoodDays('akquise',new Date('2027-01-01T00:00:00Z'),new Date('2027-12-31T00:00:00Z')))
 for(const row of a.days){assert.ok(!row.includes('Blaue Nacht'));assert.ok(!row.includes('Roter Mond'));assert.ok(row.includes('Ton '))}
 assert.equal(SEAL_KNOWLEDGE.length,20);assert.equal(TONE_KNOWLEDGE.length,13)
})
test('Full knowledge and server context retained, no contradictory anchor',()=>{
 assert.equal((KNOWLEDGE_BASE.match(/^SIEGEL \d+:/gm)||[]).length,20)
 assert.equal((KNOWLEDGE_BASE.match(/^TON \d+ /gm)||[]).length,13)
 assert.equal((KNOWLEDGE_BASE.match(/^POSITION \d+:/gm)||[]).length,5)
 assert.equal((KNOWLEDGE_BASE.match(/^LEBENSTHEMA \d+:/gm)||[]).length,8)
 assert.ok(!KNOWLEDGE_BASE.includes('Kristalliner Gelbe Saat'))
 assert.equal(calendarFacts(2027).split('\n').length,366)
 assert.equal(calendarFacts(2028,2).split('\n').length,30)
})
