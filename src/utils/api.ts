import "axios"
import axios from "axios";

const setToken = (accessToken:string, refreshToken:string) => {
  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("refresh_token", refreshToken)
}

const getToken = () => {
  const accessToken = localStorage.getItem("access_token")
  const refreshToken = localStorage.getItem("refresh_token")
  return {accessToken, refreshToken}
}

const sendRequest = async (typeRequest:string, url:string, data:any)  => {
  let csrf = await getCSRFToken();
  let config = {
    method: typeRequest,
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf,
    },
    withCredentials: true, // для отправки cookie
    data : data
  };

  return await axios.request(config)
}

const BearerRequest = async (typeRequest:string, url:string, data:any)  => {
  let csrf = await getCSRFToken();
  let config = {
    method: typeRequest,
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf,
      'Authorization': "Bearer " + `${localStorage.getItem("access_token")}`,
      'Accept-Language': `${localStorage.getItem("user-locale")}`,
    },
    withCredentials: true, // для отправки cookie
    data : data
  };

  return await axios.request(config)
}

const FileRequest = async (typeRequest:string, url:string, data:any)  => {
  let csrf = await getCSRFToken();
  let config = {
    method: typeRequest,
    maxBodyLength: Infinity,
    url: url,
    headers: { 
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      'X-CSRFToken': csrf,
      // 'Authorization': "Bearer " + `${localStorage.getItem("access_token")}`,
      'Accept-Language': `${localStorage.getItem("user-locale")}`,
    },
    withCredentials: true, // для отправки cookie
    data : data
  };

  return await axios.request(config)
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

export { setToken, getToken, getCSRFToken, sendRequest, BearerRequest, FileRequest }