import axios from 'axios';
export const optimizeBlocks = async (payload) => {
  const response = await axios.post('http://localhost:8000/api/optimize-blocks', payload);
  return response.data;
};