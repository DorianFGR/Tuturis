function isLoggedIn() {
    return fetch('http://localhost:2009/api/isLoggedIn', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
        .then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const text = await r.text();
            return JSON.parse(text);
        })
        .then((data) => {
            if (data.result === true) {
                return {
                    token: data.token,
                    userId: data.userId,
                    username: data.username
                };
            } else {
                console.warn('You are not logged in : ', data.error);
                window.location.replace('/login');
                throw new Error('Not logged in');
            }
        })
        .catch((err) => {
            console.error('Request Error:', err);
            throw err;
        });
}

isLoggedIn().catch(() => {

});
