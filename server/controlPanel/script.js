function isLoggedIn() {
    fetch('http://localhost:2009/api/isLoggedIn', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
        .then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const text = await r.text();
            return JSON.parse(text);
        })
        .then((data) => {
            let token;
            if (data.result === true) {
                return token = data.token;
            } else {
                console.warn('Non connecté:', data.error);
                // window.location.replace('/login');
            }
        })
        .catch((err) => {
            console.error('Request Error:', err);
        });
}

isLoggedIn(); // Calling function at the loading of the page to check if the user is logged in