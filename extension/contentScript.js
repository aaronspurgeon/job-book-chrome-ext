chrome.runtime.onMessage.addListener(request => {
  if (request.type === "getUrl") {
    chrome.storage.local.get('token', function (result) {
      if (result.token === undefined) {
        return chrome.runtime.sendMessage({ type: "getToken" })
      }
      const accessToken = result.token
      const data = { jobTitle: request.title, url: request.url };

      fetch('http://localhost:8080/users/addJob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          if (data.message === "Job Post Created") {
            return chrome.runtime.sendMessage({ type: "jobSaveSuccess" })
          }

          if (data === "Jwt is expired") {
            return chrome.runtime.sendMessage({ type: "getToken" })
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          chrome.runtime.sendMessage({ type: "Error" })
        });
    });
  }

  if (request.type === "getTokenFromStorage") {
    // need to add our actual deployed link here
    if (window.location.href === "http://localhost:3000/dashboard") {
      return setToken()
    }
  }
})


const setToken = () => {
  const token = localStorage.getItem('token')
  return chrome.storage.local.set({ token })
}


