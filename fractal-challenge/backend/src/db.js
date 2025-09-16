import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const connectionString =
  process.env.DB_URL ||
  process.env.DATABASE_URL ||
  process.env.CLEARDB_DATABASE_URL;

const parseConnectionString = (urlString) => {
  try {
    const url = new URL(urlString);
    const sslParam =
      url.searchParams.get("ssl") ||
      url.searchParams.get("sslmode") ||
      url.searchParams.get("ssl-mode");
    const wantsSsl =
      typeof sslParam === "string" &&
      ["1", "true", "require", "required", "verify_ca", "verify_identity", "verify_full"].includes(
        sslParam.toLowerCase()
      );

    return {
      host: url.hostname,
      port: parsePositiveInt(url.port, 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ...(wantsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  } catch (error) {
    throw new Error(
      "No se pudo interpretar la cadena de conexión definida en DB_URL/DATABASE_URL"
    );
  }
};

const connectionConfig = connectionString
  ? parseConnectionString(connectionString)
  : {
      host: process.env.DB_HOST || "localhost",
      port: parsePositiveInt(process.env.DB_PORT, 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "fractal_db",
    };

const shouldUseSsl = (process.env.DB_SSL || "").toLowerCase() === "true";

const poolConfig = {
  waitForConnections: true,
  connectionLimit: parsePositiveInt(process.env.DB_POOL_LIMIT, 10),
  ...connectionConfig,
};

if (shouldUseSsl && !poolConfig.ssl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const db = await mysql.createPool(poolConfig);
