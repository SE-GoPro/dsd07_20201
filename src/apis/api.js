import axios from 'axios';
import { API_DOMAIN, REQUEST_TIMEOUT } from '../configs';
import { removeVietnameseTones } from '../helpers/removeVietnameseTones';

const instance = axios.create({
  baseURL: API_DOMAIN,
  responseType: 'json',
  timeout: REQUEST_TIMEOUT,
});

instance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  const projectType = localStorage.getItem('project-type');
  let persist = JSON.parse(localStorage.getItem('persist:root'));
  persist = JSON.parse(persist.user) || {};
  const { user = {} } = persist;
  // eslint-disable-next-line no-param-reassign
  config.headers.Authorization = `Bearer ${token}`;
  config.headers.projectType = projectType;
  config.headers.user = removeVietnameseTones(user.full_name);
  return config;
});

export default instance;
