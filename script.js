let items = [];
let users = [];
let currentUser = null;
let editingItemId = null;

// Auth Functions
function switchAuth(panel) {
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const authCard = document.querySelector('.auth-card');
  
  if (panel === 'login') {
    loginPanel.classList.add('active');
    registerPanel.classList.remove('active');
    authCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    loginPanel.classList.remove('active');
    registerPanel.classList.add('active');
    authCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showApp();
      loadItems();
      if (isAdmin()) {
        renderAdminStats();
        renderAdminUsers();
      }
      alert('Login successful!');
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Registration successful! Please login.');
      switchAuth('login');
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = '';
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

function showApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = isAdmin() ? '👑 Admin' : '👤 User';
  document.getElementById('adminPanel').style.display = isAdmin() ? 'block' : 'none';
  document.getElementById('logoutBtn').style.display = 'block';
  document.getElementById('welcomeMsg').style.display = 'block';
  document.getElementById('welcomeMsg').textContent = `Welcome, ${currentUser.name}! 👋`;
}

// Item Functions
async function loadItems() {
  try {
    const response = await fetch('/api/items');
    items = await response.json();
    renderItems();
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

function renderItems() {
  const itemsList = document.getElementById('itemsList');
  itemsList.innerHTML = '';

  let filteredItems = items;
  const searchBox = document.getElementById('searchBox').value.toLowerCase();
  if (searchBox) {
    filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(searchBox) || item.sku.toLowerCase().includes(searchBox)
    );
  }

  filteredItems.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.sku}</td>
      <td>${item.category}</td>
      <td>${item.qty}</td>
      <td>Rp ${item.price.toLocaleString('id-ID')}</td>
      <td>
        <button class="btn btn-secondary" onclick="editItem(${item.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `;
    itemsList.appendChild(row);
  });

  // Update stats
  document.getElementById('itemCount').textContent = filteredItems.length;
  const totalPrice = filteredItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  document.getElementById('totalPrice').textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
}

function setFormForEdit(item) {
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemSku').value = item.sku;
  document.getElementById('itemQty').value = item.qty;
  document.getElementById('itemPrice').value = item.price;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('formTitle').textContent = 'Edit Item';
  document.getElementById('submitBtn').textContent = 'Update Item';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  editingItemId = item.id;
}

function cancelEdit() {
  clearForm();
  editingItemId = null;
  document.getElementById('formTitle').textContent = 'Add New Item';
  document.getElementById('submitBtn').textContent = 'Add Item';
  document.getElementById('cancelBtn').style.display = 'none';
}

function clearForm() {
  document.getElementById('itemName').value = '';
  document.getElementById('itemSku').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('itemCategory').value = '';
}

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (item) {
    setFormForEdit(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function handleAddItem(event) {
  event.preventDefault();

  const itemData = {
    name: document.getElementById('itemName').value,
    sku: document.getElementById('itemSku').value,
    qty: parseInt(document.getElementById('itemQty').value),
    price: parseFloat(document.getElementById('itemPrice').value),
    category: document.getElementById('itemCategory').value
  };

  try {
    if (editingItemId) {
      // Update existing item
      const response = await fetch(`/api/items/${editingItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        alert('Item updated successfully!');
        editingItemId = null;
        cancelEdit();
        loadItems();
      } else {
        alert('Failed to update item');
      }
    } else {
      // Add new item
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        alert('Item added successfully!');
        clearForm();
        loadItems();
      } else {
        alert('Failed to add item');
      }
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Item deleted successfully!');
        loadItems();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
}

// Admin Functions
async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    users = await response.json();
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

async function renderAdminStats() {
  await loadUsers();
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  document.getElementById('totalUsers').textContent = users.length;
  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('totalValue').textContent = 'Rp ' + totalValue.toLocaleString('id-ID');
}

async function renderAdminUsers() {
  await loadUsers();
  const usersList = document.getElementById('adminUsersList');
  usersList.innerHTML = '';

  users.forEach(user => {
    const isCurrentUser = currentUser.id === user.id;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role === 'admin' ? '👑 Admin' : '👤 User'}</td>
      <td>
        ${!isCurrentUser && user.role !== 'admin' ? 
          `<button class="btn btn-danger" onclick="deleteUserAccount(${user.id})">Delete</button>` 
          : '<span style="color: #999">-</span>'}
      </td>
    `;
    usersList.appendChild(row);
  });
}

async function deleteUserAccount(userId) {
  if (confirm('Are you sure? This will delete the user and all their items.')) {
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        alert('User account deleted successfully!');
        renderAdminUsers();
        renderAdminStats();
        loadItems();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
}

// Event Listeners
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  currentUser = null;
  items = [];
  editingItemId = null;
  cancelEdit();
  location.reload();
});

document.getElementById('searchBox').addEventListener('input', renderItems);

// Load Auth
window.addEventListener('load', () => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
    loadItems();
    if (isAdmin()) {
      renderAdminStats();
      renderAdminUsers();
    }
  }
});
