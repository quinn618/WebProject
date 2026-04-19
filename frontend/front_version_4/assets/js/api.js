// XAMPP API Configuration (localhost:80)
window.API_BASE = "http://localhost/backend/api";

// Utilitaire principal
window.apiRequest = async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
) {
  const token = localStorage.getItem("token");
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: "Bearer " + token }),
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(window.API_BASE + endpoint, options);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || data.error || "Erreur API");
    }
    return data.user || data.data || data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Create local references
const API_BASE = window.API_BASE;
const apiRequest = window.apiRequest;

// Auth
const Auth = {
  login: (email, password, institute_code) =>
    apiRequest("/auth/login.php", "POST", { email, password, institute_code }),
  register: (name, email, password, password_confirm, institute_code) =>
    apiRequest("/auth/register.php", "POST", {
      name,
      email,
      password,
      password_confirm,
      institute_code,
    }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  },
};

// Documents
const Documents = {
  list: (filiere, matiere, query) =>
    apiRequest(
      `/documents/list.php?filiere=${filiere}&matiere=${matiere}&q=${query}`,
    ),
  detail: (id) => apiRequest(`/documents/detail.php?id=${id}`),
  download: (id) => apiRequest(`/documents/download.php?id=${id}`),
  upload: (formData) => {
    const token = localStorage.getItem("token");
    return fetch(API_BASE + "/documents/upload.php", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData, // FormData pour le PDF
    }).then((r) => r.json());
  },
};

// Payments
const Payments = {
  initiate: (document_id) =>
    apiRequest("/payments/initiate.php", "POST", { document_id }),
  verify: (payment_ref, document_id) =>
    apiRequest("/payments/verify.php", "POST", { payment_ref, document_id }),
};

// Profile
const Profile = {
  get: () => apiRequest("/profile/get.php"),
  update: (data) => apiRequest("/profile/update.php", "POST", data),
};
