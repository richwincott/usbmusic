const Http = () => {
  const apiUrl = 'http://localhost:3100/';

  return {
    get: async (url) => {
      const res = await fetch(apiUrl + url);
      return await res.json();
    },
    post: async (url, payload) => {
      const res = await fetch(apiUrl + url, payload);
      return await res.json();
    }
  }
}

export const http = Http();