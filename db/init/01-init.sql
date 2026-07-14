-- ============================================================
-- Canteen Table Booking System — Database Initialization Script
-- Version : Phase 2
-- Engine  : MySQL 8 (InnoDB, utf8mb4_unicode_ci)
-- ============================================================
-- Table creation order respects FK dependencies:
--   Master Data first → Transaction tables → Log/History tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_db;


-- ────────────────────────────────────────────────────────────
-- SECTION 1: MASTER DATA TABLES
-- ────────────────────────────────────────────────────────────

-- 1. roles — lookup table for user roles (student, staff, cleaner, inspector, admin, executive)
CREATE TABLE IF NOT EXISTS roles (
    id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(50)     NOT NULL UNIQUE,
    description VARCHAR(255)    NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. canteen_zones — logical zone grouping for tables (supports staff-only restriction)
CREATE TABLE IF NOT EXISTS canteen_zones (
    id           INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    zone_name    VARCHAR(50)    NOT NULL UNIQUE,
    is_staff_only TINYINT       NOT NULL DEFAULT 0,
    created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. users — all system actors (students, staff, cleaners, inspectors, admins, executives)
CREATE TABLE IF NOT EXISTS users (
    id             INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)    NOT NULL UNIQUE,
    password_hash  VARCHAR(255)   NOT NULL,
    email          VARCHAR(100)   NOT NULL UNIQUE,
    first_name     VARCHAR(100)   NOT NULL,
    last_name      VARCHAR(100)   NOT NULL,
    student_id     VARCHAR(50)    NULL UNIQUE,               -- NULL for non-student roles
    role_id        INT UNSIGNED   NOT NULL,
    penalty_points INT            NOT NULL DEFAULT 100,       -- starts at 100; drops when rules broken
    is_blacklisted TINYINT        NOT NULL DEFAULT 0,         -- 1 = banned from booking
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. tables — physical canteen tables with layout coordinates for the 2D Seat Map UI
CREATE TABLE IF NOT EXISTS `tables` (
    id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    table_number  VARCHAR(10)    NOT NULL UNIQUE,
    zone_id       INT UNSIGNED   NOT NULL,
    layout_x      INT            NOT NULL DEFAULT 0,          -- grid column (1-based)
    layout_y      INT            NOT NULL DEFAULT 0,          -- grid row    (1-based)
    qr_code_hash  VARCHAR(255)   NOT NULL UNIQUE,             -- hash printed on physical QR sticker
    status        ENUM(
                      'available',
                      'pending_checkin',
                      'occupied',
                      'need_cleaning',
                      'cleaning',
                      'maintenance'
                  ) NOT NULL DEFAULT 'available',
    FOREIGN KEY (zone_id) REFERENCES canteen_zones(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. complaint_types — categories of table-related complaints with default penalty deductions
CREATE TABLE IF NOT EXISTS complaint_types (
    id                    INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    type_name             VARCHAR(50)   NOT NULL UNIQUE,
    default_penalty_points INT          NOT NULL DEFAULT 20
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. system_settings — key-value store for runtime configuration (grace period, GPS radius, etc.)
-- Created here (before transaction tables) so Phase 3+ services can read settings at startup
CREATE TABLE IF NOT EXISTS system_settings (
    id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(50)    NOT NULL UNIQUE,
    setting_value VARCHAR(255)   NOT NULL,
    description   VARCHAR(255)   NULL,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────
-- SECTION 2: TRANSACTION TABLES
-- ────────────────────────────────────────────────────────────

-- 6. bookings — core table tracking every table reservation lifecycle
CREATE TABLE IF NOT EXISTS bookings (
    id               INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED   NOT NULL,
    table_id         INT UNSIGNED   NOT NULL,
    booked_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grace_expired_at TIMESTAMP      NOT NULL,                 -- booked_at + grace_period_minutes
    checked_in_at    TIMESTAMP      NULL,                     -- NULL until student scans QR
    checked_out_at   TIMESTAMP      NULL,                     -- NULL until checkout / expiry
    expected_end_at  TIMESTAMP      NULL,                     -- checked_in_at + max_booking_duration
    status           ENUM(
                         'pending',
                         'active',
                         'completed',
                         'expired',
                         'cancelled'
                     ) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id)  REFERENCES users(id)    ON DELETE RESTRICT,
    FOREIGN KEY (table_id) REFERENCES `tables`(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. complaints — table-related complaints submitted via web, phone, or central API
CREATE TABLE IF NOT EXISTS complaints (
    id                 INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    source             ENUM('web', 'phone', 'central_api') NOT NULL DEFAULT 'web',
    reporter_user_id   INT UNSIGNED   NULL,                   -- NULL = anonymous report (PDPA)
    receiver_admin_id  INT UNSIGNED   NULL,                   -- admin who logged phone complaints
    table_id           INT UNSIGNED   NOT NULL,
    complaint_type_id  INT UNSIGNED   NOT NULL,
    evidence_image_path VARCHAR(255)  NULL,                   -- path to uploaded image (local/cloud)
    description        TEXT           NOT NULL,
    status             ENUM(
                           'pending_review',
                           'awaiting_info',
                           'investigating',
                           'resolved',
                           'rejected'
                       ) NOT NULL DEFAULT 'pending_review',
    created_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at        TIMESTAMP      NULL,
    FOREIGN KEY (reporter_user_id)  REFERENCES users(id)           ON DELETE SET NULL,
    FOREIGN KEY (receiver_admin_id) REFERENCES users(id)           ON DELETE SET NULL,
    FOREIGN KEY (table_id)          REFERENCES `tables`(id)        ON DELETE RESTRICT,
    FOREIGN KEY (complaint_type_id) REFERENCES complaint_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. blacklists — records of users whose booking privileges are suspended
CREATE TABLE IF NOT EXISTS blacklists (
    id                    INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    user_id               INT UNSIGNED   NOT NULL,
    banned_at             TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    banned_until          TIMESTAMP      NOT NULL,             -- auto: banned_at + blacklist_duration_days
    reason                VARCHAR(255)   NOT NULL,
    created_by_admin_id   INT UNSIGNED   NOT NULL,             -- admin or inspector who issued the ban
    is_active             TINYINT        NOT NULL DEFAULT 1,   -- 0 = ban expired/lifted
    FOREIGN KEY (user_id)             REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_admin_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────
-- SECTION 3: LOG / AUDIT TRAIL TABLES
-- ────────────────────────────────────────────────────────────

-- 9. booking_status_history — full audit trail for every booking status transition
CREATE TABLE IF NOT EXISTS booking_status_history (
    id                 BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    booking_id         INT UNSIGNED     NOT NULL,
    old_status         ENUM('pending', 'active', 'completed', 'expired', 'cancelled') NULL,
    new_status         ENUM('pending', 'active', 'completed', 'expired', 'cancelled') NOT NULL,
    changed_at         TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INT UNSIGNED     NULL,                 -- NULL = changed by Cron/System
    FOREIGN KEY (booking_id)         REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. complaint_status_history — audit trail for inspector actions on each complaint
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id                 BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    complaint_id       INT UNSIGNED     NOT NULL,
    old_status         ENUM('pending_review', 'awaiting_info', 'investigating', 'resolved', 'rejected') NULL,
    new_status         ENUM('pending_review', 'awaiting_info', 'investigating', 'resolved', 'rejected') NOT NULL,
    remarks            TEXT             NULL,                  -- inspector notes / decision rationale
    changed_at         TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INT UNSIGNED     NOT NULL,             -- inspector or admin who acted
    FOREIGN KEY (complaint_id)       REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)     ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. penalty_logs — transparent record of every penalty point change (deduct / restore)
CREATE TABLE IF NOT EXISTS penalty_logs (
    id                 INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    user_id            INT UNSIGNED   NOT NULL,
    booking_id         INT UNSIGNED   NULL,                   -- linked booking (if applicable)
    complaint_id       INT UNSIGNED   NULL,                   -- linked complaint (if applicable)
    points_changed     INT            NOT NULL,               -- negative = deduction, positive = restore
    action_type        ENUM('deduct', 'restore') NOT NULL,
    reason             VARCHAR(255)   NOT NULL,
    created_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INT UNSIGNED   NULL,                   -- NULL = system/cron automated action
    FOREIGN KEY (user_id)            REFERENCES users(id)      ON DELETE RESTRICT,
    FOREIGN KEY (booking_id)         REFERENCES bookings(id)   ON DELETE SET NULL,
    FOREIGN KEY (complaint_id)       REFERENCES complaints(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. table_cleaning_logs — tracks cleaner performance and table turnaround time
CREATE TABLE IF NOT EXISTS table_cleaning_logs (
    id               INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    table_id         INT UNSIGNED   NOT NULL,
    cleaner_user_id  INT UNSIGNED   NOT NULL,
    started_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- status → cleaning
    completed_at     TIMESTAMP      NULL,                                  -- status → available
    FOREIGN KEY (table_id)        REFERENCES `tables`(id) ON DELETE RESTRICT,
    FOREIGN KEY (cleaner_user_id) REFERENCES users(id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────
-- SECTION 4: PERFORMANCE INDEXES
-- ────────────────────────────────────────────────────────────

-- Speed up Seat Map queries: filter tables by status within a zone
CREATE INDEX idx_tables_status_zone       ON `tables`(status, zone_id);

-- Speed up single-active-booking constraint check before each new booking
CREATE INDEX idx_bookings_user_status     ON bookings(user_id, status);

-- Speed up Auto-Release Cron Job scanning for expired pending bookings
CREATE INDEX idx_bookings_grace_status    ON bookings(grace_expired_at, status);


-- ────────────────────────────────────────────────────────────
-- SECTION 5: SEED DATA (DML)
-- ────────────────────────────────────────────────────────────

-- 5.1 Seed roles (6 roles, fixed IDs for FK references in application layer)
INSERT INTO roles (id, role_name, description) VALUES
(1, 'student',   'Student user who can book tables and report complaints'),
(2, 'staff',     'Faculty or staff user who can book staff-only zone tables'),
(3, 'cleaner',   'Canteen cleaner who marks tables as clean or need cleaning'),
(4, 'inspector', 'Student council or inspector who handles complaints and penalty points'),
(5, 'admin',     'System administrator who manages settings, zones, tables and users'),
(6, 'executive', 'School executive who views dashboards and occupancy reports');

-- 5.2 Seed system_settings (runtime configuration read by backend services)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('grace_period_minutes',        '10',          'Minutes user has to check-in after booking before auto-release'),
('max_booking_duration_minutes','30',          'Maximum seat occupancy duration in minutes after check-in'),
('blacklist_duration_days',     '7',           'Days a blacklisted user cannot book tables'),
('min_points_to_book',          '50',          'Minimum penalty points required to place a booking'),
('gps_radius_meters',           '50',          'Maximum allowed distance (meters) from canteen center for GPS check-in'),
('canteen_lat',                 '13.736717',   'Latitude of canteen center point used for GPS check-in validation'),
('canteen_lng',                 '100.523186',  'Longitude of canteen center point used for GPS check-in validation');

-- 5.3 Seed canteen_zones
INSERT INTO canteen_zones (id, zone_name, is_staff_only) VALUES
(1, 'Zone A (General)',   0),
(2, 'Zone B (Quiet Zone)',0),
(3, 'Staff Only Area',    1);

-- 5.4 Seed users (all passwords: 'password123')
-- bcrypt hash (cost=10): $2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG
INSERT INTO users (id, username, password_hash, email, first_name, last_name, student_id, role_id, penalty_points, is_blacklisted) VALUES
(1, 'admin',      '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'admin@canteen.ac.th',      'Somchai',  'Admin',    NULL,       5, 100, 0),
(2, 'student1',   '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'student1@canteen.ac.th',   'Somsak',   'Jaidee',   'STD69001', 1, 100, 0),
(3, 'student2',   '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'student2@canteen.ac.th',   'Somsri',   'Rakdee',   'STD69002', 1,  40, 1),
(4, 'teacher1',   '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'teacher1@canteen.ac.th',   'Anong',    'Kru',      NULL,       2, 100, 0),
(5, 'cleaner1',   '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'cleaner1@canteen.ac.th',   'Prapas',   'Cleaner',  NULL,       3, 100, 0),
(6, 'inspector1', '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'inspector1@canteen.ac.th', 'Chaiwat',  'Inspector',NULL,       4, 100, 0),
(7, 'executive1', '$2a$10$UXnZ2vVl6.4G4K/rW4u2ueZ6j.aWwN8rQe27c9Z7Oq23TjU9H15xG', 'exec1@canteen.ac.th',      'Director', 'Prasert',  NULL,       6, 100, 0);

-- 5.5 Seed tables (8 tables across 3 zones)
INSERT INTO `tables` (id, table_number, zone_id, layout_x, layout_y, qr_code_hash, status) VALUES
(1, 'T-01', 1, 1, 1, '4a8a08f09d37b73795649038408b5f33', 'available'),
(2, 'T-02', 1, 2, 1, 'a718283f0d7e6c5b4a3901b2c3d4e5f6', 'available'),
(3, 'T-03', 1, 3, 1, 'c5b4a3901b2c3d4e5f6a718283f0d7e6', 'available'),
(4, 'T-04', 1, 1, 2, 'd7e6c5b4a3901b2c3d4e5f6a718283f0', 'available'),
(5, 'T-05', 2, 1, 1, 'e5f6a718283f0d7e6c5b4a3901b2c3d4', 'available'),
(6, 'T-06', 2, 2, 1, 'f6a718283f0d7e6c5b4a3901b2c3d4e5', 'available'),
(7, 'T-07', 3, 1, 1, '718283f0d7e6c5b4a3901b2c3d4e5f6a', 'available'),
(8, 'T-08', 3, 2, 1, '8283f0d7e6c5b4a3901b2c3d4e5f6a71', 'need_cleaning');

-- 5.6 Seed complaint_types
INSERT INTO complaint_types (id, type_name, default_penalty_points) VALUES
(1, 'table_hogging', 20),
(2, 'overstay', 10),
(3, 'table_damage', 50),
(4, 'hygiene', 15);

-- 5.7 Seed bookings
INSERT INTO bookings (id, user_id, table_id, booked_at, grace_expired_at, checked_in_at, checked_out_at, expected_end_at, status) VALUES
(1, 2, 1, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 50 MINUTE, NOW() - INTERVAL 55 MINUTE, NOW() - INTERVAL 25 MINUTE, NOW() - INTERVAL 25 MINUTE, 'completed'),
(2, 2, 2, NOW() - INTERVAL 20 MINUTE, NOW() - INTERVAL 10 MINUTE, NULL, NULL, NULL, 'expired');

-- 5.8 Seed penalty_logs (Fixed negative value)
INSERT INTO penalty_logs (id, user_id, booking_id, complaint_id, points_changed, action_type, reason) VALUES
(1, 2, 2, NULL, -5, 'deduct', 'Auto-released: booking #2 expired without check-in (grace period exceeded)');
