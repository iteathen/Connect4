#!/usr/bin/env python3
"""True original7x6 q18 center-five saturation face.  No solver WDL/strong28.
A bounded tactical P1/P0/P1/P0 four-ply verifier falsifies inferred
P0 WIN-by23 after a chosen current P0 third-row crossing at ply19.
Run: python3 verify-q18-face-P4-and-P1-vertical-countertempo.py
"""
from collections import Counter
import random,json
W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
lines=[]
for c in range(W):
 for r in range(H):
  for o,dc,dr in D:
   pts=tuple((c+i*dc,r+i*dr) for i in range(4))
   if all(0<=x<W and 0<=y<H for x,y in pts):
    lines.append((o,pts,sum(1<<(x+7*y) for x,y in pts)))
assert len(lines)==69
incident=[[mask for _,pts,mask in lines if mask&(1<<e)] for e in range(42)]
FROZEN='444446526337114725'
def frontier(h):
 return [c+7*h[c] for c in range(W) if h[c]<H]
def wins(mask,e):
 return any((mask&v)==v for v in incident[e])
def move(q,c):
 a,b,h,t=q
 if h[c]>=H:return None
 e=c+7*h[c];hs=list(h);hs[c]+=1;p=t%2
 bb=(a|(1<<e),b,tuple(hs),t+1) if p==0 else (a,b|(1<<e),tuple(hs),t+1)
 return bb,wins(bb[p],e),e
def replay(word):
 q=(0,0,(0,)*W,0)
 for ch in word:
  r=move(q,int(ch)-1)
  if r is None:return None
  q,win,e=r
  if win:return None
 return q
def horizontal_p4(q):
 a,b,hs,t=q;got=[]
 for o,pts,mask in lines:
  if o!='H' or pts[0][1]!=2 or not any(x==3 for x,y in pts):
   continue
  if mask&b:continue
  remain=[x+1 for x,y in pts if not(a&(1<<(x+7*y)))]
  if len(remain)==2:got.append(tuple(sorted(remain)))
 return sorted(got)
def forced_by23_from_q19(q):
 # q19 P1 move20; then P0 move21, P1 move22, P0 move23.
 def p0_response(q20):
  for x21 in frontier(q20[2]):
   q21,win21,_=move(q20,x21%7)
   if win21:return True
   if all((not move(q21,e22%7)[1]) and
       any(move(move(q21,e22%7)[0],e23%7)[1]
           for e23 in frontier(move(q21,e22%7)[0][2]))
       for e22 in frontier(q21[2])):
    return True
  return False
 replies={}
 for x20 in frontier(q[2]):
  q20,win20,_=move(q,x20%7)
  replies[x20%7+1]=False if win20 else p0_response(q20)
 return all(replies.values()),sorted(c for c,good in replies.items() if not good)
seed=20261021;rng=random.Random(seed)
remaining=[4]+[c for c in range(1,8) if c!=4 for _ in range(2)]
roots=[];seen=set()
for attempt in range(150000):
 seq=remaining[:];rng.shuffle(seq)
 word='44444'+''.join(map(str,seq))
 q=replay(word)
 if q is None:continue
 assert q[2]==(2,2,2,6,2,2,2)
 key=q[0],q[1]
 if key in seen:continue
 seen.add(key);roots.append((word,q))
 if len(roots)==160:break
assert len(roots)>100
fixed=replay(FROZEN);assert fixed is not None
if (fixed[0],fixed[1]) not in seen:
 roots.insert(0,(FROZEN,fixed));seen.add((fixed[0],fixed[1]))
counts=Counter();samples=[]
example={'withP1C7TwoBottom':None,'withoutP1C7TwoBottom':None,
         'P1ImmediateWin20':None,'P0ForceWin23':None}
for word,q in roots:
 c7stack=bool(q[1]&(1<<6)) and bool(q[1]&(1<<13))
 k='withP1C7TwoBottom' if c7stack else 'withoutP1C7TwoBottom'
 if example[k] is None:example[k]={'word':word,'P1OwnsC7Rows1And2':c7stack}
 for c19 in (3,5):
  q19,w19,_=move(q,c19-1);assert not w19
  expected=[(1,2),(2,5),(5,6)] if c19==3 else [(2,3),(3,6),(6,7)]
  assert horizontal_p4(q19)==expected,(word,c19)
  immediate=[];two_step=[]
  for e20 in frontier(q19[2]):
   c20=e20%7+1
   q20,w20,_=move(q19,c20-1)
   if w20:immediate.append(c20)
   elif c20!=c19 and c20!=4 and (
      (q[1]&(1<<(c20-1))) and(q[1]&(1<<(c20-1+7)))):
    e4=(c20-1)+7*3
    assert e4 in frontier(q20[2]) and wins(q20[1]|(1<<e4),e4)
    two_step.append(c20)
  mate,neutral=forced_by23_from_q19(q19)
  counts['crossings']+=1
  counts['someP1ImmediateWin20']+=bool(immediate)
  counts['someP1VerticalMove20ThreatWin22']+=bool(two_step)
  counts['P0ForcesWinBy23']+=mate
  if immediate and example['P1ImmediateWin20'] is None:
   example['P1ImmediateWin20']={'word':word,'P0Cross19':c19,
                                 'P1WinningColumn20':immediate}
  if mate and example['P0ForceWin23'] is None:
   example['P0ForceWin23']={'word':word,'P0Cross19':c19}
  if len(samples)<16 or word in (FROZEN,'444443152537166724'):
   samples.append({'word':word,'P0Column19':c19,
    'P1DirectWinningReplies20':immediate,
    'P1PotentialVerticalTwoStepColumns20':two_step,
    'P0CanForceFirstWinBy23':mate,
    'P1Move20RepliesAvoidingP0FirstWinBy23':neutral})
counts['distinctGenuineFirstwinfreeQ18States']=len(roots)
counts['randomFullHistoryAttempts']=attempt+1
print(json.dumps({'schema':1,'date':'2026-10-21',
 'sourceOriginalK4Windows':len(lines),
 'heldBackHistoricStrongTerminalLinesUsed':False,
 'randomSeed':seed,'counts':dict(counts),'witnesses':example,
 'selectedControls':samples,
 'scope':'Genuine firstwinfree 7x6 q18 sampled from conditional center-five saturation; q19 P0 c3/c5 bounded forced WIN-by23 only, never full root WDL.'},indent=2))
