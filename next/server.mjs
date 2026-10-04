import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const here = dirname(fileURLToPath(import.meta.url));
// Allow only the bundled viewer's exact shadow stylesheet, not arbitrary inline CSS.
const viewerStyleHash = createHash('sha256').update(readFileSync(resolve(here,'public/vendor/model-viewer-shadow.css'))).digest('base64');
export const cameras = {ALL:'',MAST:'MAST_LEFT|MAST_RIGHT',NAV:'NAV_LEFT_A|NAV_LEFT_B|NAV_RIGHT_A|NAV_RIGHT_B',MAHLI:'MAHLI',CHEMCAM:'CHEMCAM_RMI',FHAZ:'FHAZ_LEFT_A|FHAZ_RIGHT_A|FHAZ_LEFT_B|FHAZ_RIGHT_B',RHAZ:'RHAZ_LEFT_A|RHAZ_RIGHT_A|RHAZ_LEFT_B|RHAZ_RIGHT_B',MARDI:'MARDI'};
const fail = (message,status=400) => Object.assign(new Error(message),{status});
export function photoQuery(input) {
 const start=input.get('start')||'', end=input.get('end')||start, camera=input.get('camera')||'ALL';
 const page=Number(input.get('page')||0);
 const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
 if ((start&&!valid(start))||(end&&!valid(end))) throw fail('Choose a valid calendar date.');
 if(end&&!start) throw fail('Choose a start date first.');
 if(start&&end<start) throw fail('The end date must be on or after the start date.');
 if(!Object.hasOwn(cameras,camera)) throw fail('Choose a listed camera.');
 if(!Number.isInteger(page)||page<0||page>100000) throw fail('Invalid page.');
 const p=new URLSearchParams({condition_1:'msl:mission',per_page:'24',page:String(page),order:'date_taken desc',extended:'thumbnail::sample_type::noteq',search:cameras[camera]});
 if(start){p.set('condition_2',start+':date_taken:gte');const next=new Date(end+'T00:00:00Z');next.setUTCDate(next.getUTCDate()+1);p.set('condition_3',next.toISOString().slice(0,10)+':date_taken:lt');}
 return {params:p,start,end,camera,page};
}
export function normalizePhoto(p) {
 const url=new URL(p.https_url||p.url);
 if(!['mars.nasa.gov','mars.jpl.nasa.gov'].includes(url.hostname)) throw fail('Unexpected image source.',502);
 url.protocol='https:';
 return {id:String(p.id),url:url.href,title:p.title||'Curiosity observation',camera:p.instrument,sol:p.sol,date:p.date_taken,credit:p.image_credit||'NASA/JPL-Caltech',source:'https://mars.nasa.gov/raw_images/'+p.id+'/'};
}
export function createApp({dataDir=resolve(here,'.data'), fetcher=fetch}={}) {
 mkdirSync(dataDir,{recursive:true});const db=new DatabaseSync(resolve(dataDir,'jigyasa.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS saved(user_id INTEGER REFERENCES users(id),photo_id TEXT,photo TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',PRIMARY KEY(user_id,photo_id));`);
 const cache=new Map(), attempts=new Map();
 const timer=setInterval(()=>{const now=Date.now();db.prepare('DELETE FROM sessions WHERE expires < ?').run(now);for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);for(const [k,v] of cache)if(now-v.at>300000)cache.delete(k);},60000);timer.unref();
 function user(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('jigyasa='))?.slice(8);if(!token)return null;return db.prepare('SELECT users.id,email,name FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(createHash('sha256').update(token).digest('hex'),Date.now())||null;}
 const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 async function body(req){let b='';for await(const chunk of req){b+=chunk;if(b.length>16000)throw fail('Request too large.',413);}try{return JSON.parse(b);}catch{throw fail('Invalid request.');}}
 function setSession(req,res,id){const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),id,Date.now()+7*86400000);res.setHeader('Set-Cookie',`jigyasa=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.COOKIE_SECURE==='1'?'; Secure':''}`);}
 const server=createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',`default-src 'self'; img-src 'self' https://mars.nasa.gov https://mars.jpl.nasa.gov https://science.nasa.gov data: blob:; style-src 'self' 'sha256-${viewerStyleHash}'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' blob:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
 try{
 const url=new URL(req.url,'http://localhost');
 if(!['GET','HEAD'].includes(req.method)&&req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)throw fail('This request came from another site.',403);
 if(url.pathname==='/api/me'&&req.method==='GET')return json(res,200,{user:user(req)});
 if(['/api/register','/api/login'].includes(url.pathname)&&req.method==='POST'){
 const ip=req.socket.remoteAddress,now=Date.now();let attempt=attempts.get(ip);if(!attempt||attempt.until<now){attempt={count:0,until:now+900000};attempts.set(ip,attempt);}if(++attempt.count>20)throw fail('Too many attempts. Please try again in 15 minutes.',429);
 const b=await body(req),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw fail('Enter a valid email address.');
 if(password.length<10||password.length>128)throw fail('Use a password of 10 to 128 characters.');
 let account;
 if(url.pathname==='/api/register'){
 const name=String(b.name||'').trim();if(!name||name.length>60)throw fail('Enter a name of 1 to 60 characters.');
 const salt=randomBytes(16).toString('hex'),hash=Buffer.from(await scrypt(password,salt,64)).toString('hex');
 try{const result=db.prepare('INSERT INTO users(email,name,password) VALUES(?,?,?)').run(email,name,salt+':'+hash);account={id:Number(result.lastInsertRowid),email,name};}catch(e){if(e.code?.includes('SQLITE'))throw fail('That email is already registered. Try signing in.',409);throw e;}
 }else{account=db.prepare('SELECT * FROM users WHERE email=?').get(email);const [salt,stored]=(account?.password||('00000000000000000000000000000000:'+ '00'.repeat(64))).split(':');const hash=await scrypt(password,salt,64);if(!account||!timingSafeEqual(Buffer.from(stored,'hex'),hash))throw fail('Email or password is incorrect.',401);delete account.password;}
 setSession(req,res,account.id);return json(res,200,{user:account});
 }
 if(url.pathname==='/api/logout'&&req.method==='POST'){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('jigyasa='))?.slice(8);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(createHash('sha256').update(token).digest('hex'));res.setHeader('Set-Cookie','jigyasa=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');return json(res,200,{ok:true});}
 if(url.pathname==='/api/photos'&&req.method==='GET'){
 const q=photoQuery(url.searchParams),key=q.params.toString();let result=cache.get(key);
 if(!result||Date.now()-result.at>300000){try{const upstream=await fetcher('https://mars.nasa.gov/api/v1/raw_image_items?'+key,{signal:AbortSignal.timeout(20000)});if(!upstream.ok)throw new Error('Upstream '+upstream.status);const data=await upstream.json();if(!Array.isArray(data.items)||!Number.isFinite(data.total))throw new Error('Invalid NASA response');
 const photos=data.items.map(normalizePhoto);if(q.start&&photos.some(p=>p.date.slice(0,10)<q.start||p.date.slice(0,10)>q.end))throw new Error('NASA date mismatch');
 result={at:Date.now(),value:{photos,total:data.total,page:q.page,perPage:24,source:'NASA / JPL',retrievedAt:new Date().toISOString()}};if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,result);
 }catch{throw fail('NASA’s image archive is temporarily unavailable. Please try again shortly.',502);}}
 return json(res,200,result.value);
 }
 if(url.pathname==='/api/saved'){
 const account=user(req);if(!account)throw fail('Sign in to keep a field notebook.',401);
 if(req.method==='GET')return json(res,200,{photos:db.prepare('SELECT photo,note FROM saved WHERE user_id=? ORDER BY rowid DESC').all(account.id).map(r=>({...JSON.parse(r.photo),note:r.note}))});
 if(req.method==='POST'){const b=await body(req),p=b.photo;if(!p||!/^\d+$/.test(String(p.id)))throw fail('Invalid image.');const trusted=[...cache.values()].flatMap(c=>c.value.photos).find(x=>x.id===String(p.id));const existing=db.prepare('SELECT photo FROM saved WHERE user_id=? AND photo_id=?').get(account.id,String(p.id));if(!trusted&&!existing)throw fail('Search for this image again before saving it.');const note=String(b.note||'').slice(0,2000);db.prepare('INSERT INTO saved(user_id,photo_id,photo,note) VALUES(?,?,?,?) ON CONFLICT(user_id,photo_id) DO UPDATE SET note=excluded.note').run(account.id,String(p.id),JSON.stringify(trusted||JSON.parse(existing.photo)),note);return json(res,200,{ok:true});}
 if(req.method==='DELETE'){const b=await body(req);db.prepare('DELETE FROM saved WHERE user_id=? AND photo_id=?').run(account.id,String(b.id));return json(res,200,{ok:true});}
 }
 if(req.method!=='GET'&&req.method!=='HEAD')throw fail('Method not allowed.',405);
 const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/favicon.svg':'favicon.svg','/scenes.js':'scenes.js','/vendor/model-viewer.min.js':'vendor/model-viewer.min.js','/models/mars.glb':'models/mars.glb','/models/curiosity.glb':'models/curiosity.glb'};const file=files[url.pathname];if(!file)throw fail('Not found.',404);
 const bytes=readFileSync(resolve(here,'public',file));res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.glb':'model/gltf-binary'}[extname(file)]});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){json(res,e.status||500,{error:e.status?e.message:'Something went wrong. Please try again.'});}
 });server.on('close',()=>{clearInterval(timer);db.close();});return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||4173);createApp().listen(port,'127.0.0.1',()=>console.log(`Jigyasa is ready at http://127.0.0.1:${port}`));}
