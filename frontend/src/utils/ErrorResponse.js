export const returnResponse = (error) => {
  console.error(error.response);

  return {
    message: error.response?.data?.message || error.message || "Server Error",
    status: error.response?.status || 500,
  };
};
