/* js/api.js — Legal Metrology API client (drop-in for store.js) */
(function () {
  const API = window.LM_API_URL || 'http://localhost:5000/api/v1';
  const KEY = 'lm_verify_db_v1';

  const INSTRUMENT_TYPES = ["Shop Weighing Scale","Petrol/Fuel Dispenser","Fair-Price Ration Scale","Taxi / Auto Meter","Weighbridge","Beam Scale"];
  const DISTRICTS = ["Pune","Mumbai","Nagpur","Nashik","Thane"];

  function daysFromNow(d){ const t=new Date(); t.setHours(0,0,0,0); t.setDate(t.getDate()+d); return t.toISOString().slice(0,10); }
  function statusOf(inst){ if(!inst.expiry||!inst.lastVerified) return 'pending'; const today=new Date(); today.setHours(0,0,0,0); const diff=Math.round((new Date(inst.expiry)-today)/86400000); if(diff<0) return 'expired'; if(diff<=30) return 'due'; return 'verified'; }
  function daysToExpiry(inst){ if(!inst.expiry) return null; const today=new Date(); today.setHours(0,0,0,0); return Math.round((new Date(inst.expiry)-today)/86400000); }

  async function api(method, path, body){
    const headers={'Content-Type':'application/json'};
    const token=localStorage.getItem('lm_token');
    if(token) headers['Authorization']='Bearer '+token;
    const res=await fetch(API+path,{method,headers,body:body?JSON.stringify(body):undefined});
    const json=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(json.message||'Request failed');
    return json.data!==undefined?json.data:json;
  }

  function emptyDb(){
    return { traders:[], inspectors:[], instruments:[], applications:[],
      session:{role:'trader',id:'TR-1001',name:'Rajesh Kumar'},
      seq:{app:90016,inst:6000,cert:4500} };
  }
  function loadLocal(){ try{ const raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw); }catch(e){} return null; }

  const LM = {
    KEY, INSTRUMENT_TYPES, DISTRICTS,
    db: null,
    _ready: [],
    ready(fn){ if(this.db){ fn(); } else { this._ready.push(fn); } },

    statusOf, daysToExpiry,

    instrumentsByTrader(id){ return this.db.instruments.filter(i=>i.traderId===id); },
    appsByTrader(id){ return this.db.applications.filter(a=>a.traderId===id); },
    appsByInspector(id){ return this.db.applications.filter(a=>a.inspectorId===id); },
    instrumentsByInspector(id){ return this.db.instruments.filter(i=>i.inspectorId===id); },
    findInstrument(q){ q=(q||'').trim().toLowerCase(); return this.db.instruments.find(i=>i.serial.toLowerCase()===q||(i.certNo&&i.certNo.toLowerCase()===q)); },

    persist(){ localStorage.setItem(KEY, JSON.stringify(this.db)); },
    reset(){ localStorage.removeItem(KEY); this._boot(); },

    addApplication(data){
      const id='AP-'+this.db.seq.app++;
      const app={id,status:'Pending',inspectorId:null,inspectorName:null,applied:daysFromNow(0),scheduled:null,feePaid:false,...data};
      this.db.applications.unshift(app); this.persist();
      api('POST','/applications',app).catch(()=>{});
      return app;
    },
    payFee(appId){
      const a=this.db.applications.find(x=>x.id===appId);
      if(a){ a.feePaid=true; this.persist(); api('PATCH','/applications/'+appId+'/pay',{mode:'UPI'}).catch(()=>{}); }
      return a;
    },
    assignInspector(appId,inspectorId){
      const a=this.db.applications.find(x=>x.id===appId);
      const insp=this.db.inspectors.find(i=>i.id===inspectorId);
      if(a&&insp){ a.inspectorId=inspectorId; a.inspectorName=insp.name; a.status='Assigned'; a.scheduled=daysFromNow(3); this.persist(); api('PATCH','/applications/'+appId+'/assign',{inspectorId,scheduled:a.scheduled}).catch(()=>{}); }
      return a;
    },
    completeVerification(appId,result){
      const a=this.db.applications.find(x=>x.id===appId);
      if(!a) return null;
      if(result.pass){
        a.status='Verified';
        const serial=makeSerial(a);
        const certNo='LM-CERT-'+this.db.seq.cert++;
        const inst={serial,type:a.type,model:a.model||'—',capacity:result.capacity||'—',traderId:a.traderId,traderName:a.traderName,shop:(this.db.traders.find(t=>t.id===a.traderId)||{}).shop||'',district:a.district,inspectorId:a.inspectorId,inspectorName:a.inspectorName,lastVerified:daysFromNow(0),expiry:daysFromNow(365),certNo,fee:a.fee};
        this.db.instruments.unshift(inst); a.resultCert=certNo;
        api('PATCH','/applications/'+appId+'/verify',{pass:true,observations:result}).catch(()=>{});
      } else {
        a.status='Rejected'; a.rejectReason=result.reason||'Did not meet accuracy tolerance';
        api('PATCH','/applications/'+appId+'/verify',{pass:false,reason:a.rejectReason}).catch(()=>{});
      }
      this.persist(); return a;
    },
    renewInstrument(serial){
      const inst=this.db.instruments.find(i=>i.serial===serial);
      if(!inst) return null;
      return this.addApplication({traderId:inst.traderId,traderName:inst.traderName,type:inst.type,model:inst.model,district:inst.district,fee:inst.fee||500,isRenewal:true,renewSerial:serial});
    },

    async _boot(){
      let fresh=null;
      try { fresh=await Promise.race([api('GET','/public/bootstrap'), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),4000))]); }
      catch(e){}
      if(fresh && fresh.instruments){
        this.db={traders:fresh.traders||[],inspectors:fresh.inspectors||[],instruments:fresh.instruments,applications:fresh.applications||[],session:fresh.session||{role:'trader',id:'TR-1001',name:'Rajesh Kumar'},seq:{app:90016,inst:6000,cert:4500}};
      } else {
        this.db=loadLocal()||emptyDb();
      }
      this.persist();
      this._ready.forEach(fn=>fn()); this._ready=[];
    }
  };

  function makeSerial(app){
    const p={'Shop Weighing Scale':'WM','Beam Scale':'WM','Petrol/Fuel Dispenser':'FD','Fair-Price Ration Scale':'RS','Taxi / Auto Meter':'TM','Weighbridge':'WB'}[app.type]||'WM';
    const dc=(app.district||'XX').slice(0,2).toUpperCase();
    return p+'-'+dc+'-'+Math.floor(1000+Math.random()*8999);
  }

  window.LM=LM;
  LM._boot();
})();
