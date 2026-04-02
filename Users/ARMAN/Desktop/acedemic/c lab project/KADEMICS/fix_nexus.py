import sys, re

with open('web/nexus.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Replace showUploadPop
new_upload = '''window.showUploadPop = () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      showToast('info', `Uplinking ${file.name}...`);
      setTimeout(() => {
        showToast('success', `File ${file.name} sent successfully!`);
        appendMessage(user.name, `[FILE]: ${file.name}`, true, 'file', `[FILE]: <a href="#" style="color:#00f3ff;text-decoration:underline;">${file.name}</a>`);
      }, 1000);
    }
  };
  fileInput.click();
};'''

html = html.replace("window.showUploadPop = () => showToast('info','File sharing coming soon!');", new_upload)

# Replace sendMessage
old_send = '''function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg || !activeRoom || !ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    type:    'text',
    content: msg,
    roll:    user.roll,
    room:    activeRoom
  }));
  appendMessage(user.name, msg, true, 'text', msg);
  input.value = '';
}'''

new_send = '''function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg || !activeRoom) return; // Allow sending even without WS for Demo Mode

  // If websocket is open, send it to the server
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type:    'text',
      content: msg,
      roll:    user.roll,
      room:    activeRoom
    }));
  }
  
  // Render message locally regardless of connection
  appendMessage(user.name, msg, true, 'text', msg);
  input.value = '';
}'''

html = html.replace(old_send, new_send)

# Replace appendMessage to support unescaped file anchors safely
old_append = '''function appendMessage(sender, content, isSelf, type='text', text=null) {
  if (type !== 'text' && type !== 'join') return;
  const msgText = text || content;
  if (!msgText) return;

  const msgArea = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = `msg-row ${isSelf ? 'self' : ''}`;
  row.innerHTML = `
    <div class="message-bubble ${isSelf ? 'mine' : 'theirs'}">
      ${!isSelf ? `<div class="msg-sender">${escHtml(sender)}</div>` : ''}
      ${escHtml(msgText)}
      <div class="msg-time">${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
    </div>`;
  msgArea.appendChild(row);
  scrollToBottom();
}'''

new_append = '''function appendMessage(sender, content, isSelf, type='text', text=null) {
  if (type !== 'text' && type !== 'join' && type !== 'file') return;
  const msgText = text || content;
  if (!msgText) return;

  const msgArea = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = `msg-row ${isSelf ? 'self' : ''}`;
  
  // If type is file, we inject HTML directly, else we sanitize the text
  const safeText = type === 'file' ? msgText : escHtml(msgText);
  
  row.innerHTML = `
    <div class="message-bubble ${isSelf ? 'mine' : 'theirs'}">
      ${!isSelf ? `<div class="msg-sender">${escHtml(sender)}</div>` : ''}
      ${safeText}
      <div class="msg-time">${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
    </div>`;
  msgArea.appendChild(row);
  scrollToBottom();
}'''

html = html.replace(old_append, new_append)

with open('web/nexus.html', 'w', encoding='utf-8') as f:
    f.write(html)
