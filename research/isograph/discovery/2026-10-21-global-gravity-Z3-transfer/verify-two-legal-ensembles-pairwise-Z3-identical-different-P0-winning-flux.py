#!/usr/bin/env python3
"""Source ORIGINAL 7x6 K4 global Z3 Fourier hierarchy nonclosure.
Two 4-board distributions have EXACTLY equal ALL 1-site and2-site true
physical owner marginals but DIFFERENT next P0 firstwinner transfer flux.
All eight boards are actual alternating-turn gravity-legal firstwinfree
histories from empty. No solved game oracle or historic strong28 IDs.
"""
from itertools import product,combinations
from collections import Counter
import json
W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
LINES=[]
for c in range(W):
 for r in range(H):
  for name,dx,dy in D:
   sites=[(c+i*dx,r+i*dy) for i in range(4)]
   if all(0<=x<W and 0<=y<H for x,y in sites):
    LINES.append((name,[x+W*y for x,y in sites]))
assert len(LINES)==69

def source_word(bits):
 # All three switch columns c1..3 have height2; each [P0,P1]
 # or [P1,P0] contributes one of each owner. Fixed col7=[P0,P1]
 # assures a playable first P0 stone even when all switch bottoms P1.
 word=[7]
 for c,b in enumerate(bits,1):
  if b==0:word.extend((c,c)) # P1 bottom, P0 upper
 word.append(7) # P1 upper fixed c7
 for c,b in enumerate(bits,1):
  if b==1:word.extend((c,c)) # P0 bottom, P1 upper
 assert len(word)==8
 return word

def replay(word):
 height=[0]*W;board=[0]*(W*H) # EMPTY=0, P0=1, P1=2
 for turn,col in enumerate(word):
  c=col-1
  assert 0<=c<W and height[c]<H
  e=c+W*height[c];height[c]+=1
  p=turn%2+1;board[e]=p
  assert not any(all(board[j]==p for j in L) for _,L in LINES),(
      'earlier original K4 firstwin',word,turn)
 return tuple(board),tuple(height)

families={'even':[],'odd':[]}
for bits in product((0,1),repeat=3):
 word=source_word(bits)
 board,height=replay(word)
 assert height==(2,2,2,0,0,0,2)
 assert all(board[c]==(1 if bits[c] else 2) for c in range(3))
 tag='even' if sum(bits)%2==0 else 'odd'
 families[tag].append({'bits':bits,
    'word':''.join(map(str,word)),'board':board})
assert len(families['even'])==len(families['odd'])==4

single=pair=0
for e in range(W*H):
 A=Counter(x['board'][e] for x in families['even'])
 B=Counter(x['board'][e] for x in families['odd'])
 assert A==B
 single+=1
for e,f in combinations(range(W*H),2):
 A=Counter((x['board'][e],x['board'][f]) for x in families['even'])
 B=Counter((x['board'][e],x['board'][f]) for x in families['odd'])
 assert A==B
 pair+=1
assert(single,pair)==(42,861)
# Equal exact physical owner 1-/2-site marginals implies equal EVERY
# Z3 Fourier character with support size at most 2 by linear DFT.
# A real firstwin absorption operator does NOT factor through those modes.
flux={}
for tag,items in families.items():
 wins=[]
 for x in items:
  for c in range(W):
   if c in (0,1,2,6):r=2
   else:r=0
   bb=list(x['board']);newsite=c+W*r;bb[newsite]=1
   orientation=[o for o,L in LINES if newsite in L and
               all(bb[j]==1 for j in L)]
   if orientation:
    wins.append({'switchBits':x['bits'],'P0Column':c+1,
                 'originalDirections':orientation})
 flux[tag]={'trueOriginalP0FirstwinnerFlux':len(wins),
            'winningPhysicalTransitions':wins}
assert flux['even']['trueOriginalP0FirstwinnerFlux']==0
assert flux['odd']['trueOriginalP0FirstwinnerFlux']==1
threeway={tag:sum(all(x['board'][c]==1 for c in range(3))
                   for x in items) for tag,items in families.items()}
assert threeway=={'even':0,'odd':1}
result={'schema':1,'date':'2026-10-21',
 'status':'EXACT_PAIRWISE_Z3_FOURIER_PROJECTION_NOT_CLOSED_UNDER_ORIGINAL_P0_FIRSTWIN_TRANSFER',
 'sourceK4OriginalTruePhysical':69,
 'sampleOriginalRealRank8Boards':8,
 'ensembleWeightsPerBoard':1,
 'ensembleSizeEach':4,
 'oneSiteTernaryOwnerMarginalHistogramsEqual':single,
 'twoSiteTernaryOwnerJointMarginalHistogramsEqual':pair,
 'allPairwiseZ3OwnerFourierCharactersThereforeEqual':True,
 'threeBodyP0BottomC1C2C3SourceCorrelation':threeway,
 'nextTrueP0FirstwinAbsorptionFlux':flux,
 'eightOriginalFirstwinfreeLegalWords':{
  tag:[{'switchBits':x['bits'],'oneBasedWord':x['word']}
       for x in items] for tag,items in families.items()},
 'logic':'Even-vs-odd 3-bit parity distributions have identical <=2 bit marginals. All8 real alternating gravity firstwinfree q8 configurations are valid. Only odd set includes P0 bottom c1,c2,c3 all owned; P0 c4 bottom on move9 completes true H c1..4. Hence two ensemble fields with identical full Fourier degree<=2 have different firstwin flux; at least original 3-body ownership modes are required. This does NOT establish global perfect-play winning strategy.',
 'qualifiedIsoGraph1p2Changed':False,'productionSolverChanged':False,
 'maintainedCI':'NOT_RUN','thirdPartyFormalAssistant':'NOT_RUN'}
print(json.dumps(result,indent=2))
