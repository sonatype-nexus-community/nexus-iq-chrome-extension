const checkAllPermissions = async () => {
  return new Promise((resolve, reject) => {
    chrome.permissions.getAll((results) => {
      console.log("checkAllPermissions", results);
      resolve(results);
    });
  });
};

export { checkAllPermissions };
