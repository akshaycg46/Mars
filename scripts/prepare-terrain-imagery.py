from pathlib import Path
import json,hashlib,re
from PIL import Image
root=Path(__file__).resolve().parents[1];tmp=root.parent/'tmp';out=root/'next/public/terrain'
Image.MAX_IMAGE_PIXELS=150_000_000
label=(tmp/'ESP_023957_1755_RED_C_01_ORTHO.LBL').read_text()
dtm=(out/'source-label.txt').read_text()
for key in ['MAP_SCALE','MAP_RESOLUTION','LINE_PROJECTION_OFFSET','SAMPLE_PROJECTION_OFFSET','CENTER_LONGITUDE']:
 def value(text):return float(re.search(r'^\s*'+key+r'\s*=\s*([-+\d.eE]+)',text,re.M).group(1))
 assert value(label)==value(dtm),key
im=Image.open(tmp/'ESP_023957_1755_RED_C_01_ORTHO.JP2');im.load()
for name in ['gale','rugged']:
 p=out/(name+'.json');m=json.loads(p.read_text());w=m['sourcePixelWindow'];crop=im.crop((w['column'],w['row'],w['column']+513,w['row']+513)).convert('L');dest=out/(name+'-ortho.png');crop.save(dest)
 m['ortho']={'file':dest.name,'sourceUrl':m['sourceUrl'].rsplit('/',1)[0]+'/ESP_023957_1755_RED_C_01_ORTHO.JP2','productId':'ESP_023957_1755_RED_C_01_ORTHO','sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'note':'Co-registered red-band orbital brightness. Same map projection, resolution and pixel origin as the DTM. Display tint and subpixel shader detail are illustrative, not measured color.'};p.write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
 print(name,crop.getextrema())
(out/'ortho-label.txt').write_text(label,encoding='ascii')
