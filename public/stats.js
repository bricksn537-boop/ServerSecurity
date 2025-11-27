(function(){
  const serversEl = document.getElementById('servers');
  const uptimeEl = document.getElementById('uptime');
  const uptimePercentEl = document.getElementById('uptimePercent');

  function update(data){
    if (typeof data.serverCount !== 'undefined') serversEl.textContent = data.serverCount >= 1000 ? `${Math.floor(data.serverCount/100)/10}k+` : data.serverCount;
    if (data.uptimeHuman) uptimeEl.textContent = data.uptimeHuman;
    if (typeof data.uptimePercent !== 'undefined') uptimePercentEl.textContent = `${data.uptimePercent}%`;
  }

  // Use Server-Sent Events if available
  if (!!window.EventSource){
    const es = new EventSource('/api/stats/stream');
    es.onmessage = (e)=>{
      try{
        const payload = JSON.parse(e.data);
        update(payload);
      }catch(err){ console.error('stats stream parse', err); }
    };
    es.onerror = (err)=>{ console.warn('stats stream error', err); es.close(); };
  } else {
    // Fallback: poll every 5s
    async function poll(){
      try{
        const r = await fetch('/api/stats');
        if (!r.ok) throw new Error('bad response');
        const json = await r.json();
        update(json);
      }catch(err){ console.error('stats poll failed', err); }
    }
    poll();
    setInterval(poll, 5000);
  }

  // Also try to fetch server list to get an initial server count fallback
  async function fetchServersFallback(){
    try{
      const r = await fetch('/api/servers');
      if (!r.ok) return;
      const list = await r.json();
      if (Array.isArray(list) && list.length && !document.getElementById('servers').textContent.trim()){
        update({ serverCount: list.length });
      }
    }catch(e){/* ignore */}
  }
  fetchServersFallback();
})();