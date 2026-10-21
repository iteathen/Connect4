#!/usr/bin/env python3
"""Original7x6 P1-to-move two-stage danger-intersection positive certificate.
Source producer uses only current original69 H/V/R/F K4 one-missing owner
cofactors, physical gravity and two literal local source promotions.
Falsification is separately bounded P1/P0/P1/P0 FIRSTWIN (not full WDL).
No historical28 IDs or prior Connect4 solution data are used.
"""
from pathlib import Path
from contextlib import redirect_stdout
from collections import Counter
import runpy,io,json
sibling=Path(__file__).with_name(
 'verify-q18-face-P4-and-P1-vertical-countertempo.py')
with redirect_stdout(io.StringIO()):
    src=runpy.run_path(str(sibling))
roots=src['roots']
lines=src['window']
move=src['place']
front=src['landing']
physical_limited=src['exact5_from_q19']

def singletons(q,owner):
    P0,P1,h,t=q
    own=P0 if owner==0 else P1
    opp=P1 if owner==0 else P0
    out={}
    for e in front(h):
        supported=[]
        for orientation,pts,mask in lines:
            if not(mask & (1<<e)):continue
            if mask&opp:continue
            if (mask&own).bit_count()!=3:continue
            supported.append((orientation,tuple((x+1,y+1) for x,y in pts)))
        if supported:out[e%7+1]=supported
    return out

def source_certificate(q):
    assert q[3]%2==1 and not any(
        (m&own)==m for own in q[:2] for _,_,m in lines)
    p1=singletons(q,1)
    p0=singletons(q,0)
    if p1 or len(p0)!=1:
        return {'certified':False,'reason':'own-P1-direct-or-P0-not-singleton',
                'P0CurrentTargets':list(p0),'P1ImmediateTargets':list(p1)}
    forced_column=next(iter(p0))
    q_block,P1won,_=move(q,forced_column-1)
    assert not P1won
    P0afterBlock=singletons(q_block,0)
    if P0afterBlock:
        return {'certified':True,'reason':'compulsory-block-releases-current-win',
                'forcedP1BlockingColumn':forced_column,
                'P0NewImmediateTargets':list(P0afterBlock)}
    successful=[]
    for e in front(q_block[2]):
        z=e%7+1
        q_pivot,win21,_=move(q_block,z-1)
        if win21:
            successful.append({'P0Pivot':z,'P0WinsImmediately21':True})
            continue
        nextP0=singletons(q_pivot,0)
        nextP1=singletons(q_pivot,1)
        if len(nextP0)>=2 and not nextP1:
            successful.append({'P0Pivot':z,'newP0DistinctPhysicalTargets':
                               list(nextP0),'P1ImmediateFirstwin22':[]})
    return {'certified':bool(successful),
            'reason':'compulsory-singleton-plus-two-site-fork'
                     if successful else 'incomplete',
            'forcedP1BlockingColumn':forced_column,
            'sourceWitnessP0Pivots':successful}

counts=Counter()
contrast={}
positiveExamples=[]
falsePositive=[]
for word,q in roots:
    for chosen in (3,5):
        q19,terminal,_=move(q,chosen-1)
        assert not terminal
        cert=source_certificate(q19)
        wins,defenses=physical_limited(q19)
        counts['q19SourceStatesTested']+=1
        counts['physicallyForcedP0WINBy23']+=wins
        counts['sourceCertificates']+=bool(cert['certified'])
        counts['missedPhysicalWINBy23']+=wins and not cert['certified']
        if cert['certified'] and not wins:
            falsePositive.append({'sourceWord18':word,
                                  'P0Move19':chosen,
                                  'claimed':cert,'actualP1Defense':defenses})
        if cert['certified'] and len(positiveExamples)<5:
            positiveExamples.append({'sourceWord18':word,
                                     'P0Move19':chosen,
                                     'certificate':cert})
        if word in ('444446526337114725',
                    '444443152537166724'):
            contrast[word+'/'+str(chosen)]={
                'source':cert,'physicalWINby23':wins,
                'P1SafeReplies20':defenses}
assert counts['q19SourceStatesTested']==322
assert counts['physicallyForcedP0WINBy23']==98
assert counts['sourceCertificates']==84
assert not falsePositive
result={'schema':1,'date':'2026-10-21',
 'scope':'Any real P1-to-move original7x6 q: sound four-ply P0 forced-win sufficient condition; tested on conditional center-five saturated q18 states at q19 after P0 row3 crossing.',
 'proof':'S1(q)=empty, S0(q)={y}. P1 must take physical y or P0 firstwins next. After P1(y), P0 either currently firstwins or chooses a legal pivot z that immediately wins or creates >=2 distinct currently playable P0 one-missing K4 sites while P1 has no direct firstwinner. P1 can block at most one, P0 wins next. Every K4 owner grade uses original physical 69 lines; no full game value premise.',
 'inputHistoric28OrSolvedRootWDL':False,
 'sample':dict(counts),'falsePositiveCertificates':falsePositive,
 'examples':positiveExamples,'twoStateContrast':contrast,
 'limits':['Only a sufficient tactical certificate; 14 of98 bounded source wins use other mechanisms.',
           'No proof the conditional q19 source state is forced from EMPTY by perfect P0.',
           'Nested checks are original source grade1/2 locality, not recursive full-game WDL.']}
print(json.dumps(result,indent=2))
