/**
 * Advanced Notification Center
 * Handles SSE connection, categorization, and backend synchronization.
 */
class NotificationCenter {
  constructor() {
    this.unreadCount = 0;
    this.notifications = [];
    this.readIds = new Set();
    
    this.initUI();
    this.connectSSE();
  }

  initUI() {
    const bellItem = document.getElementById('notificationBellItem');
    if (bellItem) {
      this.dropdown = document.createElement('div');
      this.dropdown.className = 'notification-dropdown';
      this.dropdown.innerHTML = `
        <div class="notification-header">
          <h3>Notifications</h3>
          <button class="mark-all-read" id="markAllReadBtn">Mark all read</button>
        </div>
        <ul class="notification-list" id="notificationList">
          <div class="no-notifications">No notifications yet</div>
        </ul>
      `;
      bellItem.appendChild(this.dropdown);
      
      bellItem.addEventListener('click', (e) => {
        if (e.target.closest('#markAllReadBtn')) return;
        this.dropdown.classList.toggle('open');
      });

      document.getElementById('markAllReadBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.markAllAsRead();
      });

      document.addEventListener('click', (e) => {
        if (!bellItem.contains(e.target)) {
          this.dropdown.classList.remove('open');
        }
      });
    }
  }

  getAuthToken() {
    return localStorage.getItem('parampara_token') || '';
  }

  getCsrfToken() {
    return document.cookie.split('; ').find(row => row.startsWith('_csrf='))?.split('=')[1] || '';
  }

  async fetchHistory() {
    try {
      const headers = {};
      const token = this.getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/notifications/history', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.readIds) {
          data.readIds.forEach(id => this.readIds.add(id));
        } else {
          // Fallback to local storage for anonymous users
          const localReads = JSON.parse(localStorage.getItem('parampara_read_notifications') || '[]');
          localReads.forEach(id => this.readIds.add(id));
        }

        data.data.reverse().forEach(n => {
          this.addNotification(n, false);
        });
        
        this.updateBadge();
        this.renderList();
      }
    } catch (err) {
      console.error('Failed to fetch notification history', err);
    }
  }

  connectSSE() {
    let url = '/api/notifications/stream';
    const token = this.getAuthToken();
    if (token) {
      url += `?token=${encodeURIComponent(token)}`;
    }

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('[NotificationCenter] Connected to SSE');
    };

    this.eventSource.addEventListener('new_item', (e) => this.handleEvent(e));
    this.eventSource.addEventListener('new_post', (e) => this.handleEvent(e));
    this.eventSource.addEventListener('alert', (e) => this.handleEvent(e));

    this.eventSource.onerror = (error) => {
      console.error('[NotificationCenter] SSE error, attempting reconnect...');
    };
    
    this.fetchHistory();
  }
  
  handleEvent(e) {
    try {
      const payload = JSON.parse(e.data);
      if (!this.readIds.has(payload.id)) {
        this.addNotification(payload, true);
        this.showToast(payload);
        this.updateBadge();
        this.renderList();
      }
    } catch (err) {
      console.error('[NotificationCenter] Failed to parse event', err);
    }
  }

  addNotification(notification, isNew) {
    if (this.notifications.some(n => n.id === notification.id)) return;
    
    this.notifications.unshift(notification);
    
    if (!this.readIds.has(notification.id)) {
      this.unreadCount++;
    }
  }

  async syncReadState(ids) {
    const token = this.getAuthToken();
    const csrf = this.getCsrfToken();
    
    if (token && csrf) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrf
          },
          body: JSON.stringify({ notificationIds: ids })
        });
      } catch (err) {
        console.error('Failed to sync read state', err);
      }
    } else {
      // Fallback
      const idsArray = Array.from(this.readIds).slice(-100);
      localStorage.setItem('parampara_read_notifications', JSON.stringify(idsArray));
    }
  }

  markAllAsRead() {
    const unreadIds = [];
    this.notifications.forEach(n => {
      if (!this.readIds.has(n.id)) {
        this.readIds.add(n.id);
        unreadIds.push(n.id);
      }
    });
    
    if (unreadIds.length > 0) {
      this.unreadCount = 0;
      this.syncReadState(unreadIds);
      this.updateBadge();
      this.renderList();
    }
  }

  updateBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
        badge.classList.add('active');
      } else {
        badge.classList.remove('active');
      }
    }
  }

  renderList() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="no-notifications">No notifications yet</div>';
      return;
    }

    list.innerHTML = '';
    this.notifications.forEach(n => {
      const isUnread = !this.readIds.has(n.id);
      const li = document.createElement('li');
      li.className = `notification-item category-${n.category} ${isUnread ? 'unread' : ''}`;
      
      const timeStr = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      li.innerHTML = `
        <p>${n.data.message}</p>
        <span class="time">${timeStr}</span>
      `;
      
      li.addEventListener('click', () => {
        if (isUnread) {
          this.readIds.add(n.id);
          this.unreadCount--;
          this.syncReadState([n.id]);
          this.updateBadge();
          this.renderList();
        }
      });
      
      list.appendChild(li);
    });
  }

  showToast(notification) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast category-${notification.category}`;
    
    let title = 'New Update';
    if (notification.type === 'new_item') title = 'New Cultural Item';
    if (notification.type === 'new_post') title = 'Live Village Post';
    if (notification.category === 'alert') title = 'Alert';

    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <p class="toast-message">${notification.data.message}</p>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
      }, 300);
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.notificationCenter = new NotificationCenter();
});
