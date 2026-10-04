"""Extract a reproducible 513x513 measured-height tile from the HiRISE PDS DTM.
Requires Python 3 + numpy. Downloads only the header and contiguous crop rows.
No synthetic elevations, smoothing, hole-filling, or vertical exaggeration.
"""
from pathlib import Path
import urllib.request,re,json,hashlib
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'next/public/terrain'
URL='https://hirise-pds.lpl.arizona.edu/PDS/DTM/ESP/ORB_023900_023999/ESP_023957_1755_ESP_024023_1755/DTEEC_023957_1755_024023_1755_U01.IMG'
def byte_range(start,end):
 req=urllib.request.Request(URL,headers={'Range':f'bytes={start}-{end}'})
 with urllib.request.urlopen(req,timeout=90) as r:
  if r.status!=206 or not r.headers.get('Content-Range','').startswith(f'bytes {start}-{end}/'):raise RuntimeError('Server did not honor the byte range')
  data=r.read(end-start+2)
 if len(data)!=end-start+1:raise RuntimeError('Wrong range length')
 return data
header=byte_range(0,27059).decode('ascii').rstrip('\x00 ')
def number(key):return float(re.search(r'^\s*'+key+r'\s*=\s*([-+\d.eE]+)',header,re.M).group(1))
width=int(number('LINE_SAMPLES'));record=int(number('RECORD_BYTES'));spacing=number('MAP_SCALE');res=number('MAP_RESOLUTION')
# PDS map equations use one-based pixel indices. These crop indices are zero-based.
lat=-4.5895;lon=137.447;n=513
center_row=round(number('LINE_PROJECTION_OFFSET')-lat*res)
center_col=round(number('SAMPLE_PROJECTION_OFFSET')+(lon-number('CENTER_LONGITUDE'))*res)
row=center_row-n//2;col=center_col-n//2
start=record+row*width*4;end=start+n*width*4-1
raw=byte_range(start,end)
all_rows=np.frombuffer(raw,dtype='<f4').reshape(n,width)
valid=np.isfinite(all_rows).all(axis=0)&(all_rows>-10000).all(axis=0)
starts=np.flatnonzero(np.convolve(valid.astype(int),np.ones(n,dtype=int),mode='valid')==n)
if not len(starts):raise RuntimeError('No fully measured crop at this latitude')
col=int(starts[np.argmin(abs(starts-col))]);center_col=col+n//2
heights=all_rows[:,col:col+n].copy()
if heights.shape!=(n,n) or not np.isfinite(heights).all() or (heights<-10000).any():raise RuntimeError('Crop has missing elevations; choose a valid area')
OUT.mkdir(parents=True,exist_ok=True)
data=heights.astype('<f4').tobytes();(OUT/'gale-heights.f32').write_bytes(data)
(OUT/'source-label.txt').write_text(header,encoding='ascii')
metadata={'name':'Gale Crater — Curiosity landing-site region','productId':'DTEEC_023957_1755_024023_1755_U01','sourceUrl':URL,'sourcePage':'https://www.uahirise.org/dtm/dtm.php?ID=ESP_023957_1755','credit':'NASA/JPL/University of Arizona/USGS','width':n,'height':n,'spacingMeters':spacing,'spanMeters':(n-1)*spacing,'format':'float32 little-endian, north-to-south rows, west-to-east columns','datum':'Mars 2000 equipotential surface, meters','projection':'Equirectangular, planetocentric, east-positive','centerLatitude':(number('LINE_PROJECTION_OFFSET')-center_row)/res,'centerLongitude':number('CENTER_LONGITUDE')+(center_col-number('SAMPLE_PROJECTION_OFFSET'))/res,'sourcePixelWindow':{'row':row,'column':col,'width':n,'height':n},'minimumElevation':float(heights.min()),'maximumElevation':float(heights.max()),'heightSha256':hashlib.sha256(data).hexdigest(),'sourceRangeSha256':hashlib.sha256(raw).hexdigest(),'sourceByteRange':[start,end],'verticalExaggeration':1,'notes':'Measured stereo-derived elevations. No missing samples, no invented height detail. Surface color is illustrative, not satellite photography. The drive is a simulation, not a replay of Curiosity telemetry.'}
(OUT/'gale.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
print(json.dumps(metadata,indent=2))
