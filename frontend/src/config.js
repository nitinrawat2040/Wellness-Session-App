
const config = {
    development: {
        apiUrl: 'http://localhost:5000/api'
    },
    production: {
        apiUrl: 'https://wellness-session-manager.onrender.com/api'
    }
};


const environment = process.env.NODE_ENV || 'development';


export default config[environment];