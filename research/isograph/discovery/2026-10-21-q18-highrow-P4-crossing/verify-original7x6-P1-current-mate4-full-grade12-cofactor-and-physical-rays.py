#!/usr/bin/env python3
"""True ORIGINAL 7x6 K4 source-only P1-turn P0 mate-within-four Boolean test.
Producer: all 69 H,V,rising,falling physical K4 grade1/grade2 owner cofactors
and two literal height shifts; NO future-valued game nodes or solved Oracle.
Validation: separate REAL physical four-directional ray race P1/P0/P1/P0.
Historical strong28 winning-line IDs are never used in this program.
"""
from collections import Counter
import random,json
W,H=7,6
D=((1,0),(0,1),(1,1),(1,-1))
lines=[]
for c in range(W):
 for r in range(H):
  for dx,dy in D:
   pts=[(c+i*dx,r+i*dy) for i in range(4)]
   if all(0<=x<W and 0<=y<H for x,y in pts):
    lines.append(tuple(x+W*y for x,y in pts))
assert len(lines)==69

def frontier(h):
 return tuple(c+7*r for c,r in enumerate(h) if r<H)

def physical_ray(b,e,p):
 c,r=e%W,e//W
 for dx,dy in D:
  n=1
  for s in (-1,1):
   x,y=c+s*dx,r+s*dy
   while 0<=x<W and 0<=y<H and b[x+7*y]==p:
    n+=1;x+=s*dx;y+=s*dy
  if n>=4:return True
 return False

def physical_step(q,e):
 board,h,n=q
 assert e in frontier(h)
 p=n%2;b=board[:];hh=h[:];b[e]=p;hh[e%7]+=1
 return (b,hh,n+1),physical_ray(b,e,p)

def source_replay(word):
 q=([-1]*42,[0]*7,0)
 for ch in word:
  c=int(ch)-1
  if c<0 or c>=W or q[1][c]>=H:return None
  e=c+7*q[1][c]
  q,won=physical_step(q,e)
  if won:return None
 return q

def source_cofactors(q):
 b,h,n=q
 U=[set(),set()];V=[set(),set()]
 for L in lines:
  p0=sum(b[e]==0 for e in L)
  p1=sum(b[e]==1 for e in L)
  missing=[e for e in L if b[e]<0]
  if not p1:
   if len(missing)==1 and p0==3:U[0].add(missing[0])
   if len(missing)==2 and p0==2:V[0].add(frozenset(missing))
  if not p0:
   if len(missing)==1 and p1==3:U[1].add(missing[0])
   if len(missing)==2 and p1==2:V[1].add(frozenset(missing))
 return U,V

def source_owner_promote(U,V,claimed):
 return (U-{claimed})|{next(iter(pair-{claimed})) for pair in V
                       if claimed in pair}

def exact_P1_defense_incompatibility(U0,U1,h):
 # Only ORIGINAL CURRENT cofactor bits & actual column heights.
 L=frontier(h)
 if any(x in U1 for x in L):return False # P1 firstwins now
 S={x for x in L if x in U0}
 if len(S)>=2:return True
 if len(S)==1:
  x=next(iter(S))
  return h[x%7]+1<H and x+7 in U0
 return all(h[x%7]+1<H and x+7 in U0 for x in L)

def source_p0_force_within_next_four(q,detail=False):
 assert q[2]%2==1
 U,V=source_cofactors(q)
 defender_choices_that_escape=[]
 witness=[]
 # P1 first physical claim x is universally quantified.
 for x in frontier(q[1]):
  if x in U[1]: # P1 firstwins immediately, so this P1 reply escapes
   defender_choices_that_escape.append(x%7+1)
   continue
  h1=q[1][:];h1[x%7]+=1
  U0_after=U[0]-{x}
  V0_after={pair for pair in V[0] if x not in pair}
  U1_after=source_owner_promote(U[1],V[1],x)
  p0_winning_action=None
  # P0 first physical claim z is existentially quantified.
  for z in frontier(h1):
   if z in U0_after:
    p0_winning_action=(z%7+1,'immediate')
    break
   h2=h1[:];h2[z%7]+=1
   U0_second=source_owner_promote(U0_after,V0_after,z)
   U1_second=U1_after-{z}
   # P1 and then P0 are eliminated by the exact all-rank original
   # singleton-ladder source Boolean formula (no future game values).
   if exact_P1_defense_incompatibility(U0_second,U1_second,h2):
    p0_winning_action=(z%7+1,'original_K4_defender_incompatibility')
    break
  if p0_winning_action is None:
   defender_choices_that_escape.append(x%7+1)
  else:witness.append({'P1FirstCol':x%7+1,'P0CertifiedAction':p0_winning_action})
 answer=not defender_choices_that_escape
 if detail:return answer,{'P1EscapingCol':defender_choices_that_escape,'P0ActionsByP1Move':witness}
 return answer

def literal_four_ply_firstwinning_race(q):
 # INDEPENDENT physical-ray check P1/P0/P1/P0 ONLY (not entire game).
 answers=[]
 for x in frontier(q[1]):
  q1,p1win=physical_step(q,x)
  if p1win:
   answers.append((x%7+1,False))
   continue
  p0_can=False
  for z in frontier(q1[1]):
   q2,p0win=physical_step(q1,z)
   if p0win:
    p0_can=True;break
   all_reply_fail=True
   for y in frontier(q2[1]):
    q3,p1win_second=physical_step(q2,y)
    if p1win_second or not any(
      physical_step(q3,last)[1] for last in frontier(q3[1])):
     all_reply_fail=False
     break
   if all_reply_fail:p0_can=True;break
  answers.append((x%7+1,p0_can))
 return all(ok for _,ok in answers),[c for c,ok in answers if not ok]

# Held-back physical q18 inputs: generate ORIGINAL legal states independently
# of known optimal moves or original strong28 terminal line IDs.
rng=random.Random(20261021)
remaining=[4]+[c for c in range(1,8) if c!=4 for _ in range(2)]
roots=[];seen=set()
for attempt in range(150000):
 moves=remaining[:];rng.shuffle(moves)
 word='44444'+''.join(map(str,moves))
 q=source_replay(word)
 if q is None:continue
 assert q[1]==[2,2,2,6,2,2,2]
 state=tuple(q[0])
 if state in seen:continue
 seen.add(state);roots.append((word,q))
 if len(roots)==160:break
assert len(roots)==160
fixed='444446526337114725'
q=source_replay(fixed)
assert q is not None
if tuple(q[0]) not in seen:
 roots.insert(0,(fixed,q))
count=Counter();mismatches=[];examples=[]
for word,q18 in roots:
 for c19 in (3,5):
  e=c19-1+7*q18[1][c19-1]
  q19,win19=physical_step(q18,e)
  assert not win19
  a,source=source_p0_force_within_next_four(q19,True)
  b,escape=literal_four_ply_firstwinning_race(q19)
  count['tested_q19']+=1;count['source_P0_forceWIN_by23']+=a
  count['physical_P0_forceWIN_by23']+=b
  if a!=b or source['P1EscapingCol']!=escape:
   mismatches.append({'word':word,'c19':c19,'source':source,'actualEscape':escape})
  if len(examples)<8:examples.append({'word':word,'c19':c19,'source':source})
assert count['tested_q19']==322 and count['physical_P0_forceWIN_by23']==98
assert not mismatches
print('SATURATED_FACE',json.dumps({'counts':dict(count),
 'distinct_original_q18':len(roots),'source_vs_physical_mismatches':len(mismatches),
 'firstExamples':examples[:2]}))

# Different and independently seeded original true games across ALL ranks.
rng=random.Random(0x16210)
random_counts=Counter();failures=[]
for j in range(2000):
 q=([-1]*42,[0]*7,0)
 while True:
  if q[2]%2==1:
   pred=source_p0_force_within_next_four(q)
   actual,escape=literal_four_ply_firstwinning_race(q)
   random_counts['P1_firstwinfree_visits']+=1
   random_counts['source_FORCED_P0WIN4']+=pred
   random_counts['literal_ray_FORCED_P0WIN4']+=actual
   if pred!=actual:
    failures.append({'game':j,'ply':q[2],'source':pred,'physical':actual})
    break
  next_moves=frontier(q[1])
  if not next_moves:break
  q,terminal=physical_step(q,rng.choice(next_moves))
  if terminal:break
 random_counts['real_firstwinner_stopped_games']+=1
 if failures:break
assert not failures
print('UNRESTRICTED_RANKS',json.dumps({'counts':dict(random_counts),
 'source_vs_physical_mismatches':len(failures)}))

# Precise FIRSTWIN-only boundary: a genuine complete legal DRAW path has
# no spurious P0 forcedWIN when P1 to move41 (one empty physical site).
draw='444443333337777774111111222222555555666666'
for n in [39,41]:
 q=source_replay(draw[:n])
 assert q is not None and q[2]==n
 a=source_p0_force_within_next_four(q)
 b,_=literal_four_ply_firstwinning_race(q)
 assert a==b==False,(n,a,b)
print('TERMINAL_EDGE_CASES',json.dumps({'legalDrawHistory':'verified',
 'testedP1MoverRanks':[39,41],'sourceFalseWINS':0}))
