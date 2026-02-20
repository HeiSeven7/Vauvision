import axios from "axios";
import router from "@/router"; // Импортируем роутер

const setToken = (accessToken:string, refreshToken:string) => {
  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("refresh_token", refreshToken)
}

const getToken = () => {
  const accessToken = localStorage.getItem("access_token")
  const refreshToken = localStorage.getItem("refresh_token")
  return {accessToken, refreshToken}
}

// Функция для очистки токенов при выходе
const clearTokens = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

// Функция для перенаправления на логин
const redirectToLogin = () => {
  clearTokens()
  // Получаем текущий путь для редиректа после логина
  const currentPath = window.location.pathname
  router.push({ 
    name: 'login',
    query: { redirect: currentPath }
  })
}

// Функция для обновления токена
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      throw new Error('No refresh token')
    }

    const response = await axios.request({
      method: 'post',
      url: '/api/token/refresh/', // замените на ваш endpoint для обновления токена
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      data: { refresh: refreshToken }
    })

    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access)
      return response.data.access
    }
  } catch (error) {
    console.error('Failed to refresh token:', error)
    throw error
  }
}

const sendRequest = async (typeRequest:string, url:string, data:any) => {
  let config = {
    method: typeRequest,
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    data: data
  };

  try {
    return await axios.request(config)
  } catch (error: any) {
    // Обработка ошибки 401
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - перенаправление на логин')
      redirectToLogin()
    }
    throw error
  }
}

const BearerRequest = async (typeRequest:string, url:string, data:any) => {
  let config = {
    method: typeRequest,
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + `${localStorage.getItem("access_token")}`,
      'Accept-Language': `${localStorage.getItem("user-locale")}`,
    },
    withCredentials: true,
    data: data
  };

  try {
    return await axios.request(config)
  } catch (error: any) {
    // Обработка ошибки 401
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - перенаправление на логин')
      
      // Пытаемся обновить токен
      try {
        const newToken = await refreshAccessToken()
        if (newToken) {
          // Повторяем запрос с новым токеном
          config.headers['Authorization'] = "Bearer " + newToken
          return await axios.request(config)
        }
      } catch (refreshError) {
        // Если не удалось обновить токен, перенаправляем на логин
        redirectToLogin()
      }
    }
    throw error
  }
}

const FileRequest = async (typeRequest:string, url:string, data:any) => {
  let config = {
    method: typeRequest,
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      'Accept-Language': `${localStorage.getItem("user-locale")}`,
    },
    withCredentials: true,
    data: data
  };

  try {
    return await axios.request(config)
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - перенаправление на логин')
      redirectToLogin()
    }
    throw error
  }
}

const getCSRFToken = async() => {
  try {
    const response = await fetch('/api/csrf/', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Не удалось получить CSRF-токен');
    }
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    if (!csrfToken) {
      throw new Error('CSRF-токен не найден в cookie');
    }

    return csrfToken; 
  } catch (error) {
    console.error('Ошибка при получении CSRF-токена:', error);
    return null;
  }
}

export { setToken, getToken, getCSRFToken, sendRequest, BearerRequest, FileRequest, clearTokens }