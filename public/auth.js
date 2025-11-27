(function(){
  async function initAuthWidget(){
    try{
      const res = await fetch('/api/user', { credentials: 'same-origin' });
      if (!res.ok) return;
      const u = await res.json();
      if (!u.loggedIn) return;

      // Replace any .login links to logout link
      document.querySelectorAll('a.login, a[href*="/login"]').forEach(a => {
        a.href = '/logout';
        a.textContent = 'LOGOUT';
      });

      // Create widget container if not already present
      if (!document.getElementById('globalUserWidget')){
        const widget = document.createElement('div');
        widget.id = 'globalUserWidget';
        widget.style.position = 'fixed';
        widget.style.bottom = '20px';
        widget.style.left = '20px';
        widget.style.display = 'flex';
        widget.style.alignItems = 'center';
        widget.style.gap = '12px';
        widget.style.background = 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)';
        widget.style.border = '2px solid rgba(255,255,255,0.06)';
        widget.style.borderRadius = '12px';
        widget.style.padding = '8px 12px';
        widget.style.zIndex = 10000;
        widget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';

        const img = document.createElement('img');
        img.src = u.avatar;
        img.alt = u.username;
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.borderRadius = '50%';
        img.style.border = '2px solid rgba(255,255,255,0.06)';

        const name = document.createElement('div');
        name.style.color = '#fff';
        name.style.fontWeight = '700';
        name.style.fontSize = '14px';
        name.textContent = u.username;

        widget.appendChild(img);
        widget.appendChild(name);
        document.body.appendChild(widget);
      }
    }catch(e){
      // ignore errors
      console.debug('auth widget error', e);
    }
  }

  // Initialize after DOM
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAuthWidget);
  } else {
    initAuthWidget();
  }
})();