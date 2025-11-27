let currentServerId = null;
let serverSettings = {};

async function loadServers() {
  try {
    const response = await fetch('/api/servers');
    if (!response.ok) throw new Error('Failed to fetch');
    const servers = await response.json();
    
    const serverList = document.getElementById('serverList');
    serverList.innerHTML = '';
    
    if (!servers || servers.length === 0) {
      serverList.innerHTML = '<div class="loading-servers">No servers found. Add the bot to a server first.</div>';
      return;
    }
    
    servers.forEach((server, index) => {
      const serverItem = document.createElement('div');
      serverItem.className = 'server-item';
      serverItem.dataset.serverId = server.id;
      serverItem.style.animationDelay = `${index * 0.1}s`;
      serverItem.innerHTML = `
        <img src="${server.icon}" alt="${server.name}" class="server-icon" onerror="this.src='/img/logo.png'">
        <div class="server-info">
          <h4>${server.name}</h4>
          <p>${server.members} members</p>
        </div>
      `;
      serverItem.onclick = (e) => selectServer(server, e);
      serverList.appendChild(serverItem);
    });
  } catch (error) {
    console.error('Error loading servers:', error);
    document.getElementById('serverList').innerHTML = '<div class="loading-servers">Error loading servers</div>';
  }
}

async function selectServer(server, evt) {
  currentServerId = server.id;
  document.querySelectorAll('.server-item').forEach(item => item.classList.remove('active'));
  try { evt.currentTarget.classList.add('active'); } catch (e) {}
  
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('serverSettings').style.display = 'block';
  
  document.getElementById('currentServerName').textContent = server.name;
  document.getElementById('currentServerId').textContent = `ID: ${server.id}`;
  document.getElementById('currentServerIcon').src = server.icon;
  
  await loadSettings(server.id);
}

async function loadSettings(serverId) {
  try {
    const response = await fetch(`/api/settings/${serverId}`);
    serverSettings = await response.json();
    
    const antiNuke = serverSettings.antiNuke || {};
    
    ['bans', 'kicks', 'roleDeletes', 'channelDeletes', 'botAdds', 'serverNameChange', 'serverIconChange'].forEach(setting => {
      const data = antiNuke[setting] || {};
      const threshold = data.threshold || (setting === 'botAdds' || setting.includes('server') ? 2 : 3);
      const timeframe = data.timeframe || 60;
      
      setToggle(setting, data.enabled, threshold);
      
      const thresholdSlider = document.querySelector(`[data-setting="${setting}"]`);
      const thresholdValue = document.getElementById(`value-${setting}`);
      const timeSlider = document.getElementById(`${setting}-timeframe`);
      const timeValue = document.getElementById(`value-${setting}-time`);
      const action = document.getElementById(`${setting}-action`);
      
      if (thresholdSlider) thresholdSlider.value = threshold;
      if (thresholdValue) thresholdValue.textContent = threshold;
      if (timeSlider) timeSlider.value = timeframe;
      if (timeValue) timeValue.textContent = timeframe;
      if (action) action.value = data.action || 'ban';
    });
    
    const antiRaid = serverSettings.antiRaid || {};
    setToggle('textSpam', antiRaid.textSpam?.enabled, antiRaid.textSpam?.threshold || 5);
    
    const voicemaster = serverSettings.voicemaster || {};
    document.getElementById('toggle-voicemaster').checked = voicemaster.enabled || false;
    document.getElementById('voicemaster-join-channel').value = voicemaster.joinChannelId || '';
    document.getElementById('voicemaster-category').value = voicemaster.categoryId || '';
    
    const logs = serverSettings.logs || {};
    document.getElementById('logs-mod-channel').value = logs.modChannel || '';
    document.getElementById('logs-server-channel').value = logs.serverChannel || '';
    document.getElementById('logs-channel-channel').value = logs.channelChannel || '';
    document.getElementById('logs-role-channel').value = logs.roleChannel || '';
    document.getElementById('logs-message-channel').value = logs.messageChannel || '';
    document.getElementById('logs-voice-channel').value = logs.voiceChannel || '';
    document.getElementById('toggle-log-joins').checked = logs.logJoins || false;
    document.getElementById('toggle-log-leaves').checked = logs.logLeaves || false;
    document.getElementById('toggle-log-bans').checked = logs.logBans || false;
    document.getElementById('toggle-log-channel-create').checked = logs.logChannelCreate || false;
    document.getElementById('toggle-log-channel-delete').checked = logs.logChannelDelete || false;
    document.getElementById('toggle-log-channel-update').checked = logs.logChannelUpdate || false;
    document.getElementById('toggle-log-message-delete').checked = logs.logMessageDelete || false;
    document.getElementById('toggle-log-message-edit').checked = logs.logMessageEdit || false;
    document.getElementById('toggle-log-role-create').checked = logs.logRoleCreate || false;
    document.getElementById('toggle-log-role-delete').checked = logs.logRoleDelete || false;
    document.getElementById('toggle-log-voice-join').checked = logs.logVoiceJoin || false;
    document.getElementById('toggle-log-voice-leave').checked = logs.logVoiceLeave || false;
    document.getElementById('toggle-log-voice-move').checked = logs.logVoiceMove || false;
    document.getElementById('toggle-log-emoji-create').checked = logs.logEmojiCreate || false;
    
    const welcome = serverSettings.welcome || {};
    const welcomeToggle = document.getElementById('toggle-welcome');
    if (welcomeToggle) welcomeToggle.checked = welcome.enabled || false;
    const welcomeChannel = document.getElementById('welcome-channel');
    if (welcomeChannel) welcomeChannel.value = welcome.channelId || '';
    const welcomeImageUrl = document.getElementById('welcome-image-url');
    if (welcomeImageUrl) welcomeImageUrl.value = welcome.imageUrl || '';
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) welcomeText.value = welcome.text || 'Welcome to the server!';
    const welcomeColor = document.getElementById('welcome-color');
    const color = welcome.color || '#9933CC';
    if (welcomeColor) welcomeColor.value = color;
    
    const giveaways = serverSettings.giveaways || {};
    document.getElementById('toggle-giveaways').checked = giveaways.enabled || false;
    document.getElementById('giveaway-channel').value = giveaways.channelId || '';
    document.getElementById('giveaway-role').value = giveaways.requiredRole || '';
    
    const autoreply = serverSettings.autoreply || {};
    document.getElementById('toggle-autoreply').checked = autoreply.enabled || false;
    document.getElementById('autoreply-keywords').value = autoreply.keywords || '';
    document.getElementById('autoreply-message').value = autoreply.message || '';
    
    const suggestions = serverSettings.suggestions || {};
    document.getElementById('toggle-suggestions').checked = suggestions.enabled || false;
    document.getElementById('suggestion-channel').value = suggestions.channelId || '';
    document.getElementById('toggle-suggestion-react').checked = suggestions.autoReact || false;
    
    const rules = serverSettings.rules || {};
    document.getElementById('rules-channel').value = rules.channelId || '';
    document.getElementById('rules-title').value = rules.title || 'Server Rules';
    document.getElementById('rules-description').value = rules.description || 'Please follow these rules to keep our community safe';
    document.getElementById('rules-color').value = rules.color || '#ff3333';
    
    const tickets = serverSettings.tickets || {};
    const ticketCategories = tickets.categories || {};
    const ticketOptions = tickets.options || {};
    
    document.getElementById('ticket-panel-title').value = tickets.panelTitle || '🎫 Official Support Ticket System';
    document.getElementById('ticket-panel-desc').value = tickets.panelDesc || 'Welcome! Please select the category that best describes your issue.';
    document.getElementById('ticket-panel-color').value = tickets.panelColor || '#ff3333';
    document.getElementById('ticket-create-msg').value = tickets.createMessage || 'Your ticket for {CATEGORY} has been created! Please describe your issue.';
    
    document.getElementById('ticket-cat-general').value = ticketCategories.general || '';
    document.getElementById('ticket-cat-billing').value = ticketCategories.billing || '';
    document.getElementById('ticket-cat-technical').value = ticketCategories.technical || '';
    document.getElementById('ticket-cat-moderator').value = ticketCategories.moderator || '';
    document.getElementById('ticket-cat-feedback').value = ticketCategories.feedback || '';
    
    ['general', 'billing', 'technical', 'moderator', 'feedback'].forEach(cat => {
      const opt = ticketOptions[cat] || {};
      document.getElementById(`ticket-opt-${cat}-label`).value = opt.label || '';
      document.getElementById(`ticket-opt-${cat}-desc`).value = opt.description || '';
      document.getElementById(`ticket-opt-${cat}-emoji`).value = opt.emoji || '';
    });
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showNotification('Error loading settings', 'error');
  }
}

function setToggle(setting, enabled, threshold) {
  const toggle = document.getElementById(`toggle-${setting}`);
  const slider = document.getElementById(`slider-${setting}`);
  const valueSpan = document.getElementById(`value-${setting}`);
  const rangeInput = document.querySelector(`[data-setting="${setting}"]`);
  
  if (toggle) toggle.checked = enabled || false;
  if (slider) slider.style.display = enabled ? 'block' : 'none';
  if (rangeInput) rangeInput.value = threshold;
  if (valueSpan) valueSpan.textContent = threshold;
}

async function saveSettings() {
  if (!currentServerId) return;
  
  const settings = {
    antiNuke: {
      bans: { enabled: document.getElementById('toggle-bans').checked, threshold: parseInt(document.querySelector('[data-setting="bans"]').value), timeframe: parseInt(document.getElementById('bans-timeframe')?.value) || 60, action: document.getElementById('bans-action')?.value || 'ban' },
      kicks: { enabled: document.getElementById('toggle-kicks').checked, threshold: parseInt(document.querySelector('[data-setting="kicks"]').value), timeframe: parseInt(document.getElementById('kicks-timeframe')?.value) || 60, action: document.getElementById('kicks-action')?.value || 'ban' },
      roleDeletes: { enabled: document.getElementById('toggle-roleDeletes').checked, threshold: parseInt(document.querySelector('[data-setting="roleDeletes"]').value), timeframe: parseInt(document.getElementById('roleDeletes-timeframe')?.value) || 60, action: document.getElementById('roleDeletes-action')?.value || 'ban' },
      channelDeletes: { enabled: document.getElementById('toggle-channelDeletes').checked, threshold: parseInt(document.querySelector('[data-setting="channelDeletes"]').value), timeframe: parseInt(document.getElementById('channelDeletes-timeframe')?.value) || 60, action: document.getElementById('channelDeletes-action')?.value || 'ban' },
      botAdds: { enabled: document.getElementById('toggle-botAdds').checked, threshold: parseInt(document.querySelector('[data-setting="botAdds"]').value), timeframe: parseInt(document.getElementById('botAdds-timeframe')?.value) || 60, action: document.getElementById('botAdds-action')?.value || 'ban' },
      serverNameChange: { enabled: document.getElementById('toggle-serverNameChange').checked, threshold: parseInt(document.querySelector('[data-setting="serverNameChange"]').value), timeframe: parseInt(document.getElementById('serverNameChange-timeframe')?.value) || 60, action: document.getElementById('serverNameChange-action')?.value || 'ban' },
      serverIconChange: { enabled: document.getElementById('toggle-serverIconChange').checked, threshold: parseInt(document.querySelector('[data-setting="serverIconChange"]').value), timeframe: parseInt(document.getElementById('serverIconChange-timeframe')?.value) || 60, action: document.getElementById('serverIconChange-action')?.value || 'ban' }
    },
    antiRaid: {
      textSpam: { enabled: document.getElementById('toggle-textSpam').checked, threshold: parseInt(document.querySelector('[data-setting="textSpam"]').value) }
    },
    voicemaster: {
      enabled: document.getElementById('toggle-voicemaster').checked,
      joinChannelId: document.getElementById('voicemaster-join-channel').value,
      categoryId: document.getElementById('voicemaster-category').value
    },
    logs: {
      modChannel: document.getElementById('logs-mod-channel').value || '',
      serverChannel: document.getElementById('logs-server-channel').value || '',
      channelChannel: document.getElementById('logs-channel-channel').value || '',
      roleChannel: document.getElementById('logs-role-channel').value || '',
      messageChannel: document.getElementById('logs-message-channel').value || '',
      voiceChannel: document.getElementById('logs-voice-channel').value || '',
      logJoins: document.getElementById('toggle-log-joins').checked,
      logLeaves: document.getElementById('toggle-log-leaves').checked,
      logBans: document.getElementById('toggle-log-bans').checked,
      logChannelCreate: document.getElementById('toggle-log-channel-create').checked,
      logChannelDelete: document.getElementById('toggle-log-channel-delete').checked,
      logChannelUpdate: document.getElementById('toggle-log-channel-update').checked,
      logMessageDelete: document.getElementById('toggle-log-message-delete').checked,
      logMessageEdit: document.getElementById('toggle-log-message-edit').checked,
      logRoleCreate: document.getElementById('toggle-log-role-create').checked,
      logRoleDelete: document.getElementById('toggle-log-role-delete').checked,
      logVoiceJoin: document.getElementById('toggle-log-voice-join').checked,
      logVoiceLeave: document.getElementById('toggle-log-voice-leave').checked,
      logVoiceMove: document.getElementById('toggle-log-voice-move').checked,
      logEmojiCreate: document.getElementById('toggle-log-emoji-create').checked
    },
    welcome: {
      enabled: (document.getElementById('toggle-welcome') && document.getElementById('toggle-welcome').checked) || false,
      channelId: (document.getElementById('welcome-channel') && document.getElementById('welcome-channel').value) || '',
      imageUrl: (document.getElementById('welcome-image-url') && document.getElementById('welcome-image-url').value) || '',
      text: (document.getElementById('welcome-text') && document.getElementById('welcome-text').value) || 'Welcome to the server!',
      color: (document.getElementById('welcome-color') && document.getElementById('welcome-color').value) || '#9933CC'
    },
    tickets: {
      panelTitle: document.getElementById('ticket-panel-title').value,
      panelDesc: document.getElementById('ticket-panel-desc').value,
      panelColor: document.getElementById('ticket-panel-color').value,
      createMessage: document.getElementById('ticket-create-msg').value,
      categories: {
        general: document.getElementById('ticket-cat-general').value,
        billing: document.getElementById('ticket-cat-billing').value,
        technical: document.getElementById('ticket-cat-technical').value,
        moderator: document.getElementById('ticket-cat-moderator').value,
        feedback: document.getElementById('ticket-cat-feedback').value
      },
      options: {
        general: { label: document.getElementById('ticket-opt-general-label').value, description: document.getElementById('ticket-opt-general-desc').value, emoji: document.getElementById('ticket-opt-general-emoji').value },
        billing: { label: document.getElementById('ticket-opt-billing-label').value, description: document.getElementById('ticket-opt-billing-desc').value, emoji: document.getElementById('ticket-opt-billing-emoji').value },
        technical: { label: document.getElementById('ticket-opt-technical-label').value, description: document.getElementById('ticket-opt-technical-desc').value, emoji: document.getElementById('ticket-opt-technical-emoji').value },
        moderator: { label: document.getElementById('ticket-opt-moderator-label').value, description: document.getElementById('ticket-opt-moderator-desc').value, emoji: document.getElementById('ticket-opt-moderator-emoji').value },
        feedback: { label: document.getElementById('ticket-opt-feedback-label').value, description: document.getElementById('ticket-opt-feedback-desc').value, emoji: document.getElementById('ticket-opt-feedback-emoji').value }
      }
    },
    giveaways: {
      enabled: document.getElementById('toggle-giveaways').checked,
      channelId: document.getElementById('giveaway-channel').value,
      requiredRole: document.getElementById('giveaway-role').value
    },
    autoreply: {
      enabled: document.getElementById('toggle-autoreply').checked,
      keywords: document.getElementById('autoreply-keywords').value,
      message: document.getElementById('autoreply-message').value
    },
    suggestions: {
      enabled: document.getElementById('toggle-suggestions').checked,
      channelId: document.getElementById('suggestion-channel').value,
      autoReact: document.getElementById('toggle-suggestion-react').checked
    },
    rules: {
      channelId: document.getElementById('rules-channel').value,
      title: document.getElementById('rules-title').value,
      description: document.getElementById('rules-description').value,
      color: document.getElementById('rules-color').value
    }
  };
  
  try {
    const response = await fetch(`/api/settings/${currentServerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      showNotification('Settings Saved', 'success');
    } else {
      showNotification('Failed to save settings', 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', 'error');
  }
}

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
  notification.className = 'notification';
  if (type === 'error') notification.classList.add('error');
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

async function sendRules() {
  if (!currentServerId) return;
  try {
    const response = await fetch(`/api/send/${currentServerId}/rules`, { method: 'POST' });
    const result = await response.json();
    showNotification(result.success ? 'Rules sent!' : result.error, result.success ? 'success' : 'error');
  } catch (error) {
    showNotification('Error sending rules', 'error');
  }
}

async function sendTicketPanel() {
  if (!currentServerId) return;
  const channelId = prompt('Enter channel ID to send ticket panel:');
  if (!channelId) return;
  
  try {
    const response = await fetch(`/api/send/${currentServerId}/ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId })
    });
    const result = await response.json();
    showNotification(result.success ? 'Ticket panel sent!' : result.error, result.success ? 'success' : 'error');
  } catch (error) {
    showNotification('Error sending ticket panel', 'error');
  }
}

async function sendGiveaway() {
  if (!currentServerId) return;
  showNotification('Giveaway feature coming soon!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  loadServers();
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  document.querySelectorAll('.toggle input').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const setting = e.target.id.replace('toggle-', '');
      const slider = document.getElementById(`slider-${setting}`);
      if (slider) {
        slider.style.display = e.target.checked ? 'block' : 'none';
      }
    });
  });
  
  document.querySelectorAll('.slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const setting = e.target.dataset.setting;
      const valueSpan = document.getElementById(`value-${setting}`);
      if (valueSpan) valueSpan.textContent = e.target.value;
    });
  });
});
