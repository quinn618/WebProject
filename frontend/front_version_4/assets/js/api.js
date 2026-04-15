const API_BASE = '../backend/api';

// Utilitaire principal
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': 'Bearer ' + token })
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(API_BASE + endpoint, options);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

// Auth
const Auth = {
    login: (email, password) => apiRequest('/auth/login.php', 'POST', { email, password }),
    register: (name, email, filiere, password) => 
        apiRequest('/auth/register.php', 'POST', { name, email, filiere, password }),
    logout: () => { localStorage.removeItem('token'); window.location.href = 'auth.html'; }
};

// Documents
const Documents = {
    list: (filiere, matiere, query) => 
        apiRequest(`/documents/list.php?filiere=${filiere}&matiere=${matiere}&q=${query}`),
    detail: (id) => apiRequest(`/documents/detail.php?id=${id}`),
    download: (id) => apiRequest(`/documents/download.php?id=${id}`),
    upload: (formData) => {
        const token = localStorage.getItem('token');
        return fetch(API_BASE + '/documents/upload.php', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData  // FormData pour le PDF
        }).then(r => r.json());
    }
};

// Profile
const Profile = {
    get: () => apiRequest('/profile/get.php'),
    update: (data) => apiRequest('/profile/update.php', 'POST', data)
};