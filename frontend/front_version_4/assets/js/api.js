// XAMPP API Configuration
window.API_BASE = "http://localhost/ghassra/backend/api";

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

  const res = await fetch(window.API_BASE + endpoint, options);

  const text = await res.text();
  console.log("RAW RESPONSE:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("JSON ERROR:", text);
    throw new Error("Invalid JSON response");
  }

  if (!data.success) {
    throw new Error(data.message || "API Error");
  }

  return data;
};

const apiRequest = window.apiRequest;

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

const Documents = {
  list: (filiere = "", matiere = "", query = "") =>
    apiRequest(
      `/documents/list.php?filiere=${encodeURIComponent(filiere)}&matiere=${encodeURIComponent(matiere)}&q=${encodeURIComponent(query)}`,
    ),
  detail: (id) => apiRequest(`/documents/detail.php?id=${id}`),
  getDownloadUrl: (id) => apiRequest(`/documents/download.php?id=${id}`),
  upload: (formData) => {
    const token = localStorage.getItem("token");
    return fetch(window.API_BASE + "/documents/upload.php", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    }).then((r) => r.json());
  },
};

const Payments = {
  initiate: (document_id) =>
    apiRequest("/payments/initiate.php", "POST", { document_id }),
  verify: (payment_ref, document_id) =>
    apiRequest("/payments/verify.php", "POST", { payment_ref, document_id }),
};

const Profile = {
  get: () => apiRequest("/profile/get.php"),
  update: (data) => apiRequest("/profile/update.php", "POST", data),
};
