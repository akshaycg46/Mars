import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp,photoQuery} from '../server.mjs';
const dir=mkdtempSync(join(tmpdir(),'jigyasa-test-'));
const raw={id:123,https_url:'https://mars.nasa.gov/test.jpg',instrument:'MAST_LEFT',sol:2733,date_taken:'2020-04-14T10:46:14.000Z',title:'Sol 2733',image_credit:'NASA/JPL'};
let failure=false;
const server=createApp({dataDir:dir,fetcher:async()=>{if(failure)throw Error('offline');return {ok:true,json:async()=>({items:[raw],total:1})};}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
after(async()=>{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});});
const request=async(path,body,cookie,method='POST')=>{const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
test('date bounds include full last day and validate calendar values',()=>{const q=photoQuery(new URLSearchParams({start:'2020-02-28',end:'2020-02-29'}));assert.equal(q.params.get('condition_3'),'2020-03-01:date_taken:lt');for(const p of [{start:'2020-02-30'},{start:'04-14-2020'},{start:'2020-04-15',end:'2020-04-14'},{end:'2020-04-14'},{camera:'UNKNOWN'},{page:'-1'}])assert.throws(()=>photoQuery(new URLSearchParams(p)));});
test('registration, session, per-user notebook, notes, logout and login',async()=>{
 const auth=await request('/api/register',{name:'Explorer',email:'test@example.com',password:'test-password-123'});assert.equal(auth.status,200);assert.ok(auth.cookie);assert.equal(auth.body.user.email,'test@example.com');assert.equal(auth.body.user.password,undefined);
 const dup=await request('/api/register',{name:'Other',email:'test@example.com',password:'test-password-123'});assert.equal(dup.status,409);
 const cookie=auth.cookie;assert.equal((await request('/api/me',null,cookie,'GET')).body.user.name,'Explorer');
 const photos=await request('/api/photos?start=2020-04-14',null,null,'GET');assert.equal(photos.status,200);assert.equal(photos.body.photos[0].date.slice(0,10),'2020-04-14');const photo=photos.body.photos[0];
 assert.equal((await request('/api/saved',{photo})).status,401);
 assert.equal((await request('/api/saved',{photo,note:'Layered rock'},cookie)).status,200);
 assert.equal((await request('/api/saved',null,cookie,'GET')).body.photos[0].note,'Layered rock');
 const other=await request('/api/register',{name:'Second',email:'second@example.com',password:'test-password-456'});assert.deepEqual((await request('/api/saved',null,other.cookie,'GET')).body.photos,[]);
 await request('/api/logout',{},cookie);assert.equal((await request('/api/me',null,cookie,'GET')).body.user,null);
 assert.equal((await request('/api/login',{email:'test@example.com',password:'wrong-password'})).status,401);
 const login=await request('/api/login',{email:'test@example.com',password:'test-password-123'});assert.equal(login.status,200);
 assert.equal((await request('/api/saved',null,login.cookie,'GET')).body.photos.length,1);
 await request('/api/saved',{id:photo.id},login.cookie,'DELETE');assert.equal((await request('/api/saved',null,login.cookie,'GET')).body.photos.length,0);
});
test('invalid dates and NASA outage are distinct errors',async()=>{assert.equal((await request('/api/photos?start=2020-02-30',null,null,'GET')).status,400);failure=true;const r=await request('/api/photos?start=2025-01-01',null,null,'GET');assert.equal(r.status,502);assert.match(r.body.error,/NASA/);failure=false;});
test('cross-site account creation is blocked',async()=>{const r=await fetch(base+'/api/register',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({name:'Evil',email:'evil@example.com',password:'test-password-123'})});assert.equal(r.status,403);});
test('private files are never served',async()=>{for(const path of ['/.data/jigyasa.sqlite','/server.mjs','/../server.mjs'])assert.equal((await fetch(base+path)).status,404);});

test('3D assets are served locally with the required restricted CSP',async()=>{
 const page=await fetch(base+'/');const policy=page.headers.get('content-security-policy');
 assert.match(policy,/script-src 'self' 'wasm-unsafe-eval'/);assert.doesNotMatch(policy,/'unsafe-eval'|'unsafe-inline'/);
 assert.match(policy,/style-src 'self' 'sha256-[A-Za-z0-9+/=]+'/);
 for(const name of ['mars','curiosity']){const r=await fetch(base+'/models/'+name+'.glb');assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'model/gltf-binary');const bytes=Buffer.from(await r.arrayBuffer());assert.equal(bytes.subarray(0,4).toString(),'glTF');assert.equal(bytes.readUInt32LE(8),bytes.length);}
 const script=await fetch(base+'/scenes.js');assert.equal(script.status,200);assert.match(script.headers.get('content-type'),/javascript/);
});
