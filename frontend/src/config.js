
const config = {
    development: {
        apiUrl: 'http://localhost:5000/api'
    },
    production: {
        apiUrl: 'http://localhost:5000/api'  // Temporarily changed for testing
    }
};


const environment = process.env.NODE_ENV || 'development';


export default config[environment];