-- Create database if not exists (in docker it is already created by environment, but good practice)
CREATE DATABASE IF NOT EXISTS booking_db;
USE booking_db;

-- Table for Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    location VARCHAR(50) DEFAULT 'Main Hall'
);

-- Table for Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    guests_count INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE
);

-- Seed Restaurant Tables
INSERT INTO restaurant_tables (table_number, capacity, status, location) VALUES
('T-01', 2, 'available', 'Main Hall'),
('T-02', 2, 'reserved', 'Main Hall'),
('T-03', 4, 'available', 'Main Hall'),
('T-04', 4, 'occupied', 'Window Side'),
('T-05', 6, 'available', 'VIP Room'),
('T-06', 8, 'available', 'Garden Area'),
('T-07', 4, 'available', 'Garden Area'),
('T-08', 2, 'available', 'Bar Counter');

-- Seed Bookings
INSERT INTO bookings (table_id, customer_name, customer_phone, customer_email, guests_count, booking_date, booking_time, status) VALUES
(2, 'Somchai Jaidee', '0812345678', 'somchai@email.com', 2, CURDATE(), '18:00:00', 'confirmed'),
(4, 'Somsri Rakdee', '0898765432', 'somsri@email.com', 4, CURDATE(), '12:30:00', 'confirmed');
