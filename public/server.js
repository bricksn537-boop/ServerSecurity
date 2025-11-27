(async function(){
  // server.html expects ?guildId=<id>
  const params = new URLSearchParams(location.search);
  const guildId = params.get('guildId');
  const serverTitle = document.getElementById('serverTitle');
  const serverIdEl = document.getElementById('serverId');
  const serverAvatar = document.getElementById('serverAvatar');
  const channelDeleteThreshold = document.getElementById('channelDeleteThreshold');
  const banThreshold = document.getElementById('banThreshold');
  const timeframeMs = document.getElementById('timeframeMs');
  const punishAction = document.getElementById('punishAction');
  const saveBtn = document.getElementById('saveBtn');
  const msg = document.getElementById('msg');
  const openDiscordBtn = document.getElementById('openDiscordBtn');

  if (!guildId) {
    serverTitle.innerText = 'No Server Selected';
    serverIdEl.innerText = 'No guild specified. Please access this page through the dashboard or provide a guildId parameter.';
    showMessage('No server specified. Please use the dashboard to access server configuration.', 'error');
    return;
  }

  serverTitle.innerText = 'Loading...';
  serverIdEl.innerText = 'Guild ID: ' + guildId;
  openDiscordBtn.onclick = () => window.open(`https://discord.com/channels/${guildId}`, '_blank');

  async function load() {
    showMessage('Loading server configuration...', 'info');
    
    try {
      const res = await fetch(`/api/settings/${guildId}`);
      if (!res.ok) { 
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Load settings with defaults
      channelDeleteThreshold.value = data?.channelDeleteThreshold || 3;
      banThreshold.value = data?.banThreshold || 3;
      timeframeMs.value = data?.timeframeMs || 60000;
      punishAction.value = data?.punishAction || 'ban';
      
      // Try to get server info from guilds API
      try {
        const guildsRes = await fetch('/api/guilds');
        if (guildsRes.ok) {
          const guilds = await guildsRes.json();
          const guild = guilds.find(g => g.id === guildId);
          if (guild) {
            serverTitle.innerText = guild.name;
            if (guild.icon) {
              serverAvatar.src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
            }
          } else {
            serverTitle.innerText = 'Server Configuration';
          }
        }
      } catch (e) {
        console.warn('Could not load server info:', e);
        serverTitle.innerText = 'Server Configuration';
      }
      
      hideMessage();
      
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('Failed to load server configuration. Please check your permissions and try again.', 'error');
    }
  }

  function showMessage(text, type = 'info') {
    msg.style.display = 'block';
    msg.textContent = text;
    msg.className = 'status-message';
    
    if (type === 'success') {
      msg.classList.add('status-success');
    } else if (type === 'error') {
      msg.classList.add('status-error');
    } else {
      msg.classList.add('status-info');
    }
  }

  function hideMessage() {
    msg.style.display = 'none';
  }

  function showLoadingButton(button, text = 'Saving...') {
    button.disabled = true;
    button.innerHTML = `<span class="loading-spinner"></span>${text}`;
  }

  function resetButton(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
  }

  saveBtn.onclick = async () => {
    const originalText = saveBtn.innerHTML;
    
    // Validate inputs
    const channelThreshold = parseInt(channelDeleteThreshold.value, 10);
    const banThresholdVal = parseInt(banThreshold.value, 10);
    const timeframe = parseInt(timeframeMs.value, 10);
    
    if (isNaN(channelThreshold) || channelThreshold < 1 || channelThreshold > 50) {
      showMessage('Channel delete threshold must be between 1 and 50', 'error');
      return;
    }
    
    if (isNaN(banThresholdVal) || banThresholdVal < 1 || banThresholdVal > 50) {
      showMessage('Ban threshold must be between 1 and 50', 'error');
      return;
    }
    
    if (isNaN(timeframe) || timeframe < 1000 || timeframe > 300000) {
      showMessage('Timeframe must be between 1000ms (1 second) and 300000ms (5 minutes)', 'error');
      return;
    }
    
    const payload = {
      channelDeleteThreshold: channelThreshold,
      banThreshold: banThresholdVal,
      timeframeMs: timeframe,
      punishAction: punishAction.value || 'ban'
    };
    
    showLoadingButton(saveBtn, '💾 Saving...');
    showMessage('Saving configuration...', 'info');
    
    try {
      const res = await fetch(`/api/settings/${guildId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      
      const j = await res.json();
      
      if (j.ok) { 
        showMessage('✅ Configuration saved successfully!', 'success');
        setTimeout(() => hideMessage(), 3000);
      } else { 
        showMessage('❌ Failed to save configuration. Please try again.', 'error');
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('❌ Network error while saving. Please check your connection and try again.', 'error');
    } finally {
      resetButton(saveBtn, originalText);
    }
  };

  // Add input validation on change
  [channelDeleteThreshold, banThreshold, timeframeMs].forEach(input => {
    input.addEventListener('input', function() {
      const value = parseInt(this.value, 10);
      const min = parseInt(this.min, 10);
      const max = parseInt(this.max, 10);
      
      if (isNaN(value) || value < min || value > max) {
        this.style.borderColor = 'var(--danger)';
      } else {
        this.style.borderColor = 'var(--border)';
      }
    });
  });

  // Initialize
  await load();
})();