import os
import mysql.connector
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    try:
        # Connect to MySQL server
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', '')
        )
        
        cursor = conn.cursor()
        
        # Create database if not exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {os.getenv('MYSQL_DB', 'college_chatbot')}")
        print(f"Database '{os.getenv('MYSQL_DB', 'college_chatbot')}' created successfully or already exists.")
        
        # Use the database
        cursor.execute(f"USE {os.getenv('MYSQL_DB', 'college_chatbot')}")
        
        # Create conversations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            intent VARCHAR(100),
            confidence FLOAT
        )
        """)
        print("Table 'conversations' created successfully or already exists.")
        
        # Create feedback table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT,
            rating TINYINT NOT NULL,
            comments TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
        )
        """)
        print("Table 'feedback' created successfully or already exists.")
        
        # Create users table (for future authentication)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('student', 'staff', 'admin') DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL
        )
        """)
        print("Table 'users' created successfully or already exists.")
        
        # Create courses table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            duration_years INT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Table 'courses' created successfully or already exists.")
        
        # Insert sample course data if not exists
        cursor.execute("SELECT COUNT(*) FROM courses")
        if cursor.fetchone()[0] == 0:
            sample_courses = [
                ('CSE', 'Computer Science and Engineering', 4, 'B.Tech in Computer Science and Engineering'),
                ('ECE', 'Electronics and Communication Engineering', 4, 'B.Tech in Electronics and Communication Engineering'),
                ('MECH', 'Mechanical Engineering', 4, 'B.Tech in Mechanical Engineering'),
                ('CIVIL', 'Civil Engineering', 4, 'B.Tech in Civil Engineering'),
                ('EEE', 'Electrical and Electronics Engineering', 4, 'B.Tech in Electrical and Electronics Engineering')
            ]
            
            cursor.executemany("""
                INSERT INTO courses (code, name, duration_years, description)
                VALUES (%s, %s, %s, %s)
            """, sample_courses)
            print("Inserted sample course data.")
        
        conn.commit()
        print("Database initialization completed successfully!")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("MySQL connection is closed.")

if __name__ == "__main__":
    create_database()
