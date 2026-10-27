import axios from '../../../core/api/axios';

export const getOnlineClasses = async () => {
  const res = await axios.get('/learning/online-classes');
  return res.data.data;
};

export const createOnlineClass = async (data: any) => {
  const res = await axios.post('/learning/online-classes', data);
  return res.data.data;
};

export const getProjects = async () => {
  const res = await axios.get('/learning/projects');
  return res.data.data;
};

export const createProject = async (data: any) => {
  const res = await axios.post('/learning/projects', data);
  return res.data.data;
};
