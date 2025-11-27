let serverSettings = {};
let currentServerId = null;

async function loadServers() {
    try {
        const response = await fetch('/api/servers');
        const servers = await response.json();
        const serversGrid = document.getElementById('serversGrid');
        serversGrid.innerHTML = '';

        servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            serverCard.innerHTML = `
                <img src="${server.icon}" alt="${server.name}" class="server-icon">
                <div class="server-name">${server.name}</div>
                <div class="server-members">${server.members} members</div>
            `;
            serverCard.addEventListener('click', () => openServerModal(server));
            serversGrid.appendChild(serverCard);
        });
    } catch (error) {
        console.error('Error loading servers:', error);
    }
}

async function openServerModal(server) {
    currentServerId = server.id;
    const modal = document.getElementById('serverModal');
    const serverIcon = document.getElementById('modalServerIcon');
    const serverName = document.getElementById('modalServerName');
    
    serverIcon.src = server.icon;
    serverName.textContent = server.name;
    
    await loadServerSettings(server.id);
    modal.style.display = 'block';
}

async function loadServerSettings(serverId) {
    try {
        const response = await fetch(`/api/settings/${serverId}`);
        const settings = await response.json();
        
        document.getElementById('textSpamToggle').checked = settings.textSpam || false;
        document.getElementById('allProtectionToggle').checked = settings.all || false;
        document.getElementById('bansToggle').checked = settings.bans || false;
        document.getElementById('kicksToggle').checked = settings.kicks || false;
        document.getElementById('channelDeletesToggle').checked = settings.channelDeletes || false;
        document.getElementById('roleDeletesToggle').checked = settings.roleDeletes || false;
        document.getElementById('voicemasterToggle').checked = settings.voicemaster || false;
        document.getElementById('autoDeleteToggle').checked = settings.autoDelete !== false;
        document.getElementById('moderationLogsToggle').checked = settings.moderationLogs || false;
        document.getElementById('serverLogsToggle').checked = settings.serverLogs || false;
        
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            updateThresholdValue(slider);
        });
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveServerSettings() {
    if (!currentServerId) return;
    
    const settings = {
        textSpam: document.getElementById('textSpamToggle').checked,
        all: document.getElementById('allProtectionToggle').checked,
        bans: document.getElementById('bansToggle').checked,
        kicks: document.getElementById('kicksToggle').checked,
        channelDeletes: document.getElementById('channelDeletesToggle').checked,
        roleDeletes: document.getElementById('roleDeletesToggle').checked,
        voicemaster: document.getElementById('voicemasterToggle').checked,
        autoDelete: document.getElementById('autoDeleteToggle').checked,
        moderationLogs: document.getElementById('moderationLogsToggle').checked,
        serverLogs: document.getElementById('serverLogsToggle').checked,
        bansThreshold: parseInt(document.getElementById('bansThreshold').value),
        kicksThreshold: parseInt(document.getElementById('kicksThreshold').value),
        channelDeletesThreshold: parseInt(document.getElementById('channelDeletesThreshold').value),
        roleDeletesThreshold: parseInt(document.getElementById('roleDeletesThreshold').value)
    };
    
    try {
        const response = await fetch(`/api/settings/${currentServerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showSuccessMessage('Settings saved successfully!');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) existingMessage.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'background: #ff0000; color: #000; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; animation: slideDown 0.3s ease;';
    
    const modalContent = document.querySelector('.modal-content');
    modalContent.insertBefore(successDiv, modalContent.firstChild);
    
    setTimeout(() => successDiv.remove(), 3000);
}

function updateThresholdValue(slider) {
    const valueSpan = slider.parentElement.querySelector('.threshold-value');
    if (valueSpan) valueSpan.textContent = slider.value;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function generateInviteLink() {
    const permissions = '8';
    const clientId = 'YOUR_BOT_CLIENT_ID';
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
}

function copyInviteLink() {
    const inviteInput = document.getElementById('inviteLink');
    inviteInput.select();
    document.execCommand('copy');
    
    const copyButton = document.getElementById('copyInvite');
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    copyButton.style.background = '#ff6666';
    
    setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.background = '#ff0000';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    loadServers();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Main invite button
    document.getElementById('inviteMainBtn').addEventListener('click', function(e) {
        e.preventDefault();
        const inviteModal = document.getElementById('inviteModal');
        const inviteInput = document.getElementById('inviteLink');
        inviteInput.value = generateInviteLink();
        inviteModal.style.display = 'block';
    });
    
    document.getElementById('mainLogo').addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 600);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('serverModal').style.display = 'none';
    });
    
    document.getElementById('closeInviteModal').addEventListener('click', function() {
        document.getElementById('inviteModal').style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        const serverModal = document.getElementById('serverModal');
        const inviteModal = document.getElementById('inviteModal');
        
        if (event.target === serverModal) serverModal.style.display = 'none';
        if (event.target === inviteModal) inviteModal.style.display = 'none';
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    document.getElementById('saveSettings').addEventListener('click', saveServerSettings);
    
    document.getElementById('inviteBot').addEventListener('click', function() {
        const inviteModal = document.getElementById('inviteModal');
        const inviteInput = document.getElementById('inviteLink');
        inviteInput.value = generateInviteLink();
        inviteModal.style.display = 'block';
    });
    
    document.getElementById('copyInvite').addEventListener('click', copyInviteLink);
    
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', function() {
            updateThresholdValue(this);
        });
        updateThresholdValue(slider);
    });
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.getElementById('serverModal').style.display = 'none';
        document.getElementById('inviteModal').style.display = 'none';
    }
    
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (currentServerId) saveServerSettings();
    }
});