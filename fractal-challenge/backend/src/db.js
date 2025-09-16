import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pickEnv = (...keys) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      const value = process.env[key];
      if (typeof value === "string" && value.trim() === "") {
        continue;
      }
      return value;
    }
  }
  return undefined;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const readBooleanEnv = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
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
      host: pickEnv("DB_HOST", "DATABASE_HOST") || "localhost",
      port: parsePositiveInt(pickEnv("DB_PORT", "DATABASE_PORT"), 3306),
      user: pickEnv("DB_USER", "DB_USERNAME") || "root",
      password: pickEnv("DB_PASS", "DB_PASSWORD") || "",
      database: pickEnv("DB_NAME", "DB_DATABASE") || "fractal_db",
    };

const hostForInference = (connectionConfig.host || "").toLowerCase();
const inferredSslHosts = [".proxy.rlwy.net", ".railway.app"];
const shouldForceSslByHost = inferredSslHosts.some((suffix) =>
  hostForInference.endsWith(suffix)
);

const shouldUseSsl = readBooleanEnv(process.env.DB_SSL, false);
const shouldPrepareDatabase = readBooleanEnv(process.env.DB_PREPARE, true);

if ((shouldUseSsl || shouldForceSslByHost) && !connectionConfig.ssl) {
  connectionConfig.ssl = { rejectUnauthorized: false };
  if (shouldForceSslByHost && !shouldUseSsl) {
    console.info(
      "🔐 Se habilitó SSL automáticamente por coincidir con un host de Railway"
    );
  }
}

const ensureDatabaseExists = async (config) => {
  const databaseName = config.database;
  if (!databaseName) {
    return;
  }

  try {
    const connection = await mysql.createConnection(config);
    await connection.query("SELECT 1");
    await connection.end();
  } catch (error) {
    if (error?.code !== "ER_BAD_DB_ERROR") {
      throw error;
    }

    const { database, ...adminConfig } = config;
    const adminConnection = await mysql.createConnection(adminConfig);
    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await adminConnection.end();

    console.info(`🛠️  Base de datos "${databaseName}" creada automáticamente.`);
  }
};

const ensureSchema = async (pool) => {
  const tables = [
    {
      name: "orders",
      createStatement: `CREATE TABLE IF NOT EXISTS orders (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    },
    {
      name: "products",
      createStatement: `CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    },
    {
      name: "order_products",
      createStatement: `CREATE TABLE IF NOT EXISTS order_products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        qty INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT order_products_order_fk FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT order_products_product_fk FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    },
  ];

  for (const { name, createStatement } of tables) {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [name]);
    if (rows.length === 0) {
      await pool.query(createStatement);
      console.info(`🛠️  Tabla "${name}" creada automáticamente.`);
    }
  }
};

if (shouldPrepareDatabase) {
  try {
    await ensureDatabaseExists(connectionConfig);
  } catch (error) {
    console.error("❌ No se pudo preparar la base de datos:", error.message);
    throw error;
  }
}

const poolConfig = {
  waitForConnections: true,
  connectionLimit: parsePositiveInt(process.env.DB_POOL_LIMIT, 10),
  ...connectionConfig,
};

export const db = await mysql.createPool(poolConfig);

if (shouldPrepareDatabase) {
  try {
    await ensureSchema(db);
  } catch (error) {
    console.error("❌ No se pudo crear el esquema MySQL:", error.message);
    throw error;
  }
}
