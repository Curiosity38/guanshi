import { initializeEngine, compute } from './engine.js';
const ready=initializeEngine();
self.onmessage=async({data})=>{
  const {id,path,payload}=data;
  try{await ready;self.postMessage({id,result:compute(path,payload)});}
  catch(error){self.postMessage({id,error:error instanceof Error?error.message:String(error)});}
};
