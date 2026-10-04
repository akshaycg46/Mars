import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createApp} from '../server.mjs';
const raw={id:8123,https_url:'https://mars.nasa.gov/test.jpg',instrument:'MAST_LEFT',sol:2733,date_taken:'2020-04-14T10:46:14.000Z'};
test('archive retries, persists exact-query cache, labels stale data and expires it',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'jigyasa-cache-test-'));let clock=Date.now(),calls=0,offline=false,server;
 const fetcher=async()=>{calls++;if(offline||calls===1)throw Error('offline');return {ok:true,json:async()=>({items:[raw],total:1})};};
 async function start(){server=createApp({dataDir:dir,fetcher,now:()=>clock});await new Promise(r=>server.listen(0,'127.0.0.1',r));return 'http://127.0.0.1:'+server.address().port;}
 const stop=()=>new Promise(r=>server.close(r));
 try{
  let base=await start();let r=await fetch(base+'/api/photos?start=2020-04-14');assert.equal(r.status,200);assert.equal((await r.json()).stale,false);assert.equal(calls,2);
  await stop();clock+=360000;offline=true;base=await start();r=await fetch(base+'/api/photos?start=2020-04-14');assert.equal(r.status,200);const cached=await r.json();assert.equal(cached.stale,true);assert.equal(cached.photos[0].id,'8123');
  assert.equal((await fetch(base+'/api/photos?start=2020-04-15')).status,502,'never substitute a different query');
  clock+=86400000;assert.equal((await fetch(base+'/api/photos?start=2020-04-14')).status,502,'expired cache is not served');
 }finally{if(server?.listening)await stop();assert.ok(resolve(dir).startsWith(resolve(tmpdir())+requireSeparator()));rmSync(dir,{recursive:true,force:true});}
});
function requireSeparator(){return process.platform==='win32'?'\\':'/';}
