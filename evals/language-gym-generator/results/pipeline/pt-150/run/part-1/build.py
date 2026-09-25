import json, sys
sys.path.insert(0,'.')
from entries_src import E
L=json.load(open('list.json')); ids={x['term']:x['id'] for x in L['main']}
jobs={x['term']:x['job'] for x in L['main']}
OPT=['example','mental_model','discussion','anti_example','controversy']
bounds=[0,13,26,39,52,63,75]
assert len(E)==75, len(E)
for k,e in enumerate(E):
    e['id']=ids[e['term']]
    e['batch']=next(b for b in range(1,7) if bounds[b-1]<=k<bounds[b])
def entry(e):
    o={'id':e['id'],'batch':e['batch'],'term':e['term'],'category':e['category'],'definition':e['definition']}
    for f in OPT:
        if f in e: o[f]=e[f]
    return o
if 'plan' in sys.argv:
    plan={'terms':[]}
    for e in E:
        fl=[f for f in OPT if f in e]
        why=[]
        if 'anti_example' in e: why.append('anti_example: real trap - '+e['trap'])
        if 'discussion' in e: why.append('discussion: one usage point not in the definition')
        if 'mental_model' in e: why.append('mental_model: the ser/estar split clicks faster as an image')
        plan['terms'].append({'id':e['id'],'job':jobs[e['term']] if e['term']!='ficar' else 'where fixed places are located','trap':e['trap'],'scene':e['scene'],'fields':fl,'why_fields':'; '.join(why) or 'example only: the job is clear from definition + example','level_exceptions':[]})
    json.dump(plan,open('plan.json','w'),ensure_ascii=False,indent=1)
    style={"voice":"second person where needed, present tense, plain; a sharp tutor texting a friend",
    "categories":["Verb","Pattern","Pronoun","Question word","Negation","Possessive","Pointing word","Connector","Adverb","Adjective","Phrase","Noun","Preposition"],
    "gloss_separator":" — ",
    "limits":{"definition":18,"example":12,"mental_model":18,"discussion":22,"anti_example":20,"controversy":16},
    "opening_moves":["meaning first: 'Means…', 'Covers…'","action verb: 'Says…', 'Asks…', 'Points to…', 'Tells…', 'Gives…'","bare gloss verb for verbs: 'Know…', 'Give…', 'Come…'","quoted English equivalent: \"'They' for…\"","scene-free description: 'Brazil's everyday…', 'Spoken…'"],
    "banned_phrases":["it's important to note","in today's fast-paced world","leverage","utilize","robust","seamless","delve into","unlock","game-changer","cutting-edge","this word","refers to","is defined as","it is worth noting","plays a crucial role","a versatile"],
    "confusion_types":["often confused with"],
    "scenes_by_batch":{str(b):[e['scene'] for e in E if e['batch']==b] for b in range(1,7)},
    "ceiling":"B1",
    "ipa_format":"none (pronunciation = none): no IPA or respelling anywhere",
    "notes":"Brazilian Portuguese spoken standard; você as default 'you'. Examples: one short Portuguese sentence (two short turns allowed for a dialogue), then ' — ' and a short natural English gloss. Target text: present, pretérito perfeito, ir + infinitive only; no subjunctive. Quote Portuguese forms inside explanations with single quotes when they are phrases; single words stay bare. Patterns are written with + and the slot name in Portuguese (ir + infinitivo). Nouns: bare lemma, gender in discussion only when it is a trap. No IPA. Keep series part 2 on this same sheet."}
    json.dump(style,open('style.json','w'),ensure_ascii=False,indent=1)
    samp={'terms':[entry(e) for e in E if e['term'] in ('ser','então','tudo bem')]}
    json.dump(samp,open('samples.json','w'),ensure_ascii=False,indent=1)
if 'batches' in sys.argv:
    for b in range(1,7):
        json.dump({'terms':[entry(e) for e in E if e['batch']==b]},open(f'batch-{b}.json','w'),ensure_ascii=False,indent=1)
