const API_BASE_URL =
  import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY =
  'fintel-secure-token';

const USER_KEY =
  'fintel-secure-user';

let accessToken =
  localStorage.getItem(TOKEN_KEY) ||
  sessionStorage.getItem(TOKEN_KEY) ||
  null;

let storedUser = null;

try {
  const rawUser =
    localStorage.getItem(USER_KEY);

  storedUser = rawUser
    ? JSON.parse(rawUser)
    : null;
} catch {
  storedUser = null;
}


/* =========================================================
   STORED USER
========================================================= */

export const setStoredUser = (user) => {
  storedUser = user || null;

  if (storedUser) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(storedUser)
    );
  } else {
    localStorage.removeItem(
      USER_KEY
    );
  }
};

export const getStoredUser = () => {
  return storedUser;
};


/* =========================================================
   RESPONSE PARSER
========================================================= */

const parseResponse = async (
  response
) => {
  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  if (
    contentType.includes(
      'application/json'
    )
  ) {
    return response
      .json()
      .catch(() => ({}));
  }

  return response
    .text()
    .catch(() => '');
};


/* =========================================================
   GENERIC REQUEST
========================================================= */

const request = async (
  path,
  options = {}
) => {
  const headers =
    new Headers(
      options.headers || {}
    );

  if (accessToken) {
    headers.set(
      'Authorization',
      `Bearer ${accessToken}`
    );
  }

  /*
   * Never set JSON Content-Type for FormData.
   */
  if (
    !(options.body instanceof FormData)
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  /*
   * Upload processing can legitimately
   * take longer than normal API calls.
   */
  const timeoutMs =
    path === '/uploads'
      ? 120000
      : 15000;

  const controller =
    new AbortController();

  const timer =
    setTimeout(() => {
      controller.abort();
    }, timeoutMs);

  const started =
    performance.now();

  try {
    console.log(
      `[API] ${
        options.method || 'GET'
      } ${path}`
    );

    const response =
      await fetch(
        `${API_BASE_URL}${path}`,
        {
          ...options,
          headers,
          signal:
            controller.signal,
        }
      );

    const elapsed =
      Math.round(
        performance.now() -
          started
      );

    console.log(
      `[API] ${path} → ${
        response.status
      } (${elapsed}ms)`
    );

    const payload =
      await parseResponse(
        response
      );

    if (!response.ok) {
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message ||
            payload?.msg ||
            `Request failed (${response.status})`;

      const error =
        new Error(message);

      error.status =
        response.status;

      error.payload =
        payload;

      throw error;
    }

    return payload;
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      const timeoutError =
        new Error(
          path === '/uploads'
            ? 'Upload processing is taking longer than expected. Check the Fintel backend terminal.'
            : 'The Fintel backend did not respond. Make sure the backend and MongoDB are running.'
        );

      timeoutError.code =
        'REQUEST_TIMEOUT';

      timeoutError.path =
        path;

      throw timeoutError;
    }

    if (
      error instanceof TypeError
    ) {
      const connectionError =
        new Error(
          'Cannot connect to the Fintel backend at port 5000. Run "npm run server" in the project folder.'
        );

      connectionError.code =
        'BACKEND_UNREACHABLE';

      connectionError.path =
        path;

      throw connectionError;
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
};


/* =========================================================
   TOKEN
========================================================= */

export const setAccessToken = (
  token
) => {
  accessToken =
    token || null;

  if (accessToken) {
    localStorage.setItem(
      TOKEN_KEY,
      accessToken
    );

    sessionStorage.setItem(
      TOKEN_KEY,
      accessToken
    );
  } else {
    localStorage.removeItem(
      TOKEN_KEY
    );

    sessionStorage.removeItem(
      TOKEN_KEY
    );
  }
};

export const getAccessToken = () => {
  return accessToken;
};


/* =========================================================
   AUTH
========================================================= */

export const authApi = {
  signup: (body) =>
    request(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(
          body
        ),
      }
    ),

  login: (body) =>
    request(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(
          body
        ),
      }
    ),

  me: () =>
    request('/auth/me'),

  verifyPassword: (
    password
  ) =>
    request(
      '/auth/verify-password',
      {
        method: 'POST',
        body: JSON.stringify({
          password,
        }),
      }
    ),
};


/* =========================================================
   USER
========================================================= */

export const userApi = {
  upgrade: () =>
    request(
      '/user/upgrade',
      {
        method: 'POST',
      }
    ),
};


/* =========================================================
   UPLOADS
========================================================= */

export const uploadsApi = {
  list: () =>
    request('/uploads'),

  get: (id) =>
    request(
      `/uploads/${encodeURIComponent(
        id
      )}`
    ),

  history: () =>
    request('/uploads/history'),

  create: (files) => {
    const formData =
      new FormData();

    Array.from(
      files || []
    ).forEach((file) => {
      formData.append(
        'files',
        file
      );
    });

    return request(
      '/uploads',
      {
        method: 'POST',
        body: formData,
      }
    );
  },

  delete: (id) =>
    request(
      `/uploads/${encodeURIComponent(
        id
      )}`,
      {
        method: 'DELETE',
      }
    ),

  review: (
    uploadId,
    transactionIndex,
    status,
    note = ''
  ) =>
    request(
      `/uploads/${encodeURIComponent(
        uploadId
      )}/transactions/${encodeURIComponent(
        transactionIndex
      )}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          note,
        }),
      }
    ),
};


/* =========================================================
   COMPLAINTS
========================================================= */

export const complaintApi = {
  mine: () =>
    request(
      '/complaints/mine'
    ),

  all: () =>
    request(
      '/complaints/admin/all'
    ),

  create: (body) =>
    request(
      '/complaints',
      {
        method: 'POST',
        body: JSON.stringify(
          body
        ),
      }
    ),

  update: (
    id,
    body
  ) =>
    request(
      `/complaints/${encodeURIComponent(
        id
      )}`,
      {
        method: 'PATCH',
        body: JSON.stringify(
          body
        ),
      }
    ),
};


/* =========================================================
   MARKET
========================================================= */

export const marketApi = {
  overview: () =>
    request(
      '/market/overview'
    ),

  indices: () =>
    request(
      '/market/indices'
    ),

  stocks: (
    query = '',
    sector = 'All'
  ) =>
    request(
      `/market/stocks?q=${encodeURIComponent(
        query
      )}&sector=${encodeURIComponent(
        sector
      )}`
    ),

  stock: (
    symbol
  ) =>
    request(
      `/market/stocks/${encodeURIComponent(
        symbol
      )}`
    ),

  history: (
    symbol,
    period = '1Y'
  ) =>
    request(
      `/market/stocks/${encodeURIComponent(
        symbol
      )}/history?period=${encodeURIComponent(
        period
      )}`
    ),

  ipos: (
    status = 'all'
  ) =>
    request(
      `/market/ipos?status=${encodeURIComponent(
        status
      )}`
    ),

  screener: (
    params = {}
  ) => {
    const qs =
      new URLSearchParams(
        params
      ).toString();

    return request(
      `/market/screener${
        qs
          ? `?${qs}`
          : ''
      }`
    );
  },
};


/* =========================================================
   CASES
========================================================= */

export const caseApi = {
  list: () =>
    request('/cases'),

  create: (body) =>
    request(
      '/cases',
      {
        method: 'POST',
        body: JSON.stringify(
          body
        ),
      }
    ),

  update: (
    id,
    body
  ) =>
    request(
      `/cases/${encodeURIComponent(
        id
      )}`,
      {
        method: 'PATCH',
        body: JSON.stringify(
          body
        ),
      }
    ),

  timeline: (
    id,
    text
  ) =>
    request(
      `/cases/${encodeURIComponent(
        id
      )}/timeline`,
      {
        method: 'POST',
        body: JSON.stringify({
          text,
        }),
      }
    ),
};


/* =========================================================
   RULES
========================================================= */

export const ruleApi = {
  list: () =>
    request('/rules'),

  create: (body) =>
    request(
      '/rules',
      {
        method: 'POST',
        body: JSON.stringify(
          body
        ),
      }
    ),

  update: (
    id,
    body
  ) =>
    request(
      `/rules/${encodeURIComponent(
        id
      )}`,
      {
        method: 'PATCH',
        body: JSON.stringify(
          body
        ),
      }
    ),

  test: (body) =>
    request(
      '/rules/test',
      {
        method: 'POST',
        body: JSON.stringify(
          body
        ),
      }
    ),
};


/* =========================================================
   ADMIN
========================================================= */

export const adminApi = {
  risk: () =>
    request('/admin/risk'),
};