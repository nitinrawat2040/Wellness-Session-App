
const config = {
    development: {
        apiUrl: 'http://localhost:5000/api'
    },
    production: {
        apiUrl: process.env.REACT_APP_API_URL || 'https://internship-projects-ksab.onrender.com/api'
    }
};


const environment = process.env.NODE_ENV || 'development';


export default config[environment];