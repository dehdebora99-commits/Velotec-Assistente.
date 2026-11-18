const CACHE='velotec-assistente-ui-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('velotec-assistente-ui-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{if(event.request.method==='GET'&&new URL(event.request.url).origin===self.location.origin){event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)))}});
// Recebe push apenas se um servidor externo enviar uma mensagem para a inscrição do dispositivo.
self.addEventListener('push',event=>{
 let payload={};
 try{payload=event.data?.json()||{}}catch(_){payload={body:event.data?.text()||''}}
 const title=String(payload.title||'🔔 Velotec Assistente').slice(0,120);
 const body=String(payload.body||'Você tem um lembrete.').slice(0,300);
 const url=new URL(payload.url||'./',self.registration.scope);
 const destination=url.origin===self.location.origin?url.href:self.registration.scope;
 event.waitUntil(self.registration.showNotification(title,{body,icon:'./icon-192.png',badge:'./icon-192.png',tag:String(payload.tag||'velotec-lembrete'),data:{url:destination}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=event.notification.data?.url||self.registration.scope;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.focus();return}}
  await self.clients.openWindow(url);
 })());
});
