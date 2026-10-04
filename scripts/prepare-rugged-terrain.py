from pathlib import Path
import urllib.request,json,re,hashlib
import numpy as np
root=Path(__file__).resolve().parents[1]
tmp=root.parent/'tmp';tmp.mkdir(parents=True,exist_ok=True);out=root/'next/public/terrain'
base='https://hirise-pds.lpl.arizona.edu/PDS/DTM/ESP/ORB_023900_023999/ESP_023957_1755_ESP_024023_1755/'
label=(out/'source-label.txt').read_text()
def number(key,text=label):return float(re.search(r'^\s*'+key+r'\s*=\s*([-+\d.eE]+)',text,re.M).group(1))
w=int(number('LINE_SAMPLES'));first=14000;rows=2049;start=27060+first*w*4;end=start+rows*w*4-1
cache=tmp/'rough-source.bin'
if not cache.exists():
 req=urllib.request.Request(base+'DTEEC_023957_1755_024023_1755_U01.IMG',headers={'Range':f'bytes={start}-{end}'})
 with urllib.request.urlopen(req,timeout=120) as r:
  assert r.status==206
  cache.write_bytes(r.read())
raw=cache.read_bytes();assert len(raw)==rows*w*4
h=np.frombuffer(raw,dtype='<f4').reshape(rows,w)
best=None
for r in range(0,rows-513,128):
 for c in range(0,w-513,128):
  tile=h[r:r+513,c:c+513]
  if not np.isfinite(tile).all() or tile.min()<-10000:continue
  gy,gx=np.gradient(tile,number('MAP_SCALE'));slope=np.degrees(np.arctan(np.hypot(gx,gy)));relief=float(np.ptp(tile))
  score=float(np.percentile(slope,90))
  if best is None or score>best[0]:best=(score,r,c,relief,tile.copy())
score,r,c,relief,tile=best;data=tile.astype('<f4').tobytes();(out/'rugged-heights.f32').write_bytes(data)
m=json.loads((out/'gale.json').read_text());cr=first+r+256;cc=c+256
m.update(name='Gale Crater — southern surveyed slopes',centerLatitude=(number('LINE_PROJECTION_OFFSET')-cr)/number('MAP_RESOLUTION'),centerLongitude=number('CENTER_LONGITUDE')+(cc-number('SAMPLE_PROJECTION_OFFSET'))/number('MAP_RESOLUTION'),sourcePixelWindow=dict(row=first+r,column=c,width=513,height=513),minimumElevation=float(tile.min()),maximumElevation=float(tile.max()),heightSha256=hashlib.sha256(data).hexdigest(),sourceRangeSha256=hashlib.sha256(raw).hexdigest(),sourceByteRange=[start,end],slope90Degrees=score)
# Start at a moderate slope near the center, with rougher ground within view.
gy,gx=np.gradient(tile,number('MAP_SCALE'));slopes=np.degrees(np.arctan(np.hypot(gx,gy)));candidates=np.argwhere((slopes>5)&(slopes<10));candidates=candidates[(candidates[:,0]>70)&(candidates[:,0]<443)&(candidates[:,1]>70)&(candidates[:,1]<443)];sr,sc=candidates[np.argmin(((candidates-256)**2).sum(axis=1))];m['spawn']={'x':float((sc-256)*number('MAP_SCALE')),'z':float((sr-256)*number('MAP_SCALE'))}
(out/'rugged.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
for name in ['ESP_023957_1755_RED_C_01_ORTHO.LBL','ESP_023957_1755_RED_C_01_ORTHO.JP2']:
 p=tmp/name
 if not p.exists():
  with urllib.request.urlopen(base+name,timeout=120) as response:p.write_bytes(response.read())
print(json.dumps(m,indent=2))
