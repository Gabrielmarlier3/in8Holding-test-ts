import 'dotenv/config';

export const checkEnvVariables = () => {
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT'];

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error(`A variável de ambiente ${envVar} não está definida. Verifique o arquivo .env`);
        }
    });
};
