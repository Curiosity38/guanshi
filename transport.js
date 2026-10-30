// Messages stay in this tab's local Worker. Birth information is never fetched.
let worker,serial=0;
const pending=new Map();
function getWorker(){
  if(worker)return worker;
  worker=new Worker(new URL('./engine-worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
    const job=pending.get(data.id);if(!job)return;
    job.cleanup();data.error?job.reject(Error(data.error)):job.resolve(data.result);
  };
  worker.onerror=()=>{
    for(const job of [...pending.values()]){job.cleanup();job.reject(Error('浏览器计算引擎未加载完成，请刷新页面重试。'));}
    worker.terminate();worker=undefined;
  };
  return worker;
}
export function sendRequest(path,payload,{signal}={}){
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(new DOMException('已取消','AbortError'));return;}
    const id=++serial;
    const abort=()=>{cleanup();reject(new DOMException('已取消','AbortError'));};
    const cleanup=()=>{clearTimeout(timer);pending.delete(id);signal?.removeEventListener('abort',abort);};
    const timer=setTimeout(()=>{cleanup();reject(Error('首次加载计算资源超时，请检查网络后刷新。'));},45000);
    pending.set(id,{resolve,reject,cleanup});signal?.addEventListener('abort',abort,{once:true});
    try{getWorker().postMessage({id,path,payload});}catch(error){cleanup();reject(error);}
  });
}
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{
    // Calculation still works online when private browsing disables offline cache.
  }));
}
