import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '050034',
      database: process.env.DB_NAME || 'ks',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    // 测试连接
    const connection = await pool.getConnection()
    console.log('✅ MySQL数据库连接成功')
    connection.release()

    // 初始化数据表
    await createTables()
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    throw error
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('数据库连接池未初始化')
  }
  return pool
}

async function createTables() {
  const connection = await getPool().getConnection()
  
  try {
    // 用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 天气记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS weather_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        location VARCHAR(100) NOT NULL,
        temperature DECIMAL(5,2),
        weather_type VARCHAR(50),
        humidity INT,
        wind_speed DECIMAL(5,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_date_location (date, location)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 穿搭建议表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS outfit_suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        weather_id INT,
        suggestion_text TEXT NOT NULL,
        items JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (weather_id) REFERENCES weather_records(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 历史搭配表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS outfit_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE NOT NULL,
        outfit_data JSON NOT NULL,
        weather_info JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 衣物表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clothing_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('✅ 数据表初始化完成')
  } catch (error) {
    console.error('❌ 创建数据表失败:', error)
    throw error
  } finally {
    connection.release()
  }
}

