import axios from 'axios';
import Cookie from 'js-cookie';
import constant from './constant';


const api = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
    withCredentials : true,
});

api.interceptors.request.use((config) =>{
    const accessToken = Cookie.get(constant.ACCESS_TOKEN_KEY);


    if(accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default api;