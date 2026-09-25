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
        if 'controversy' in e: why.append('controversy: real prescriptive vs spoken split, one flat sentence')
        if 'mental_model' in e: why.append('mental_model: the four place words click as one picture')
        plan['terms'].append({'id':e['id'],'job':jobs[e['term']] if e['term']!='ficar' else 'where fixed places are located','trap':e['trap'],'scene':e['scene'],'fields':fl,'why_fields':'; '.join(why) or 'example only: the job is clear from definition + example','level_exceptions':[]})
    json.dump(plan,open('plan.json','w'),ensure_ascii=False,indent=1)
if 'batches' in sys.argv:
    for b in range(1,7):
        json.dump({'terms':[entry(e) for e in E if e['batch']==b]},open(f'batch-{b}.json','w'),ensure_ascii=False,indent=1)
