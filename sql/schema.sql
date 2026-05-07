-- ===========================================
-- 게시판 DB 스키마
-- 사용법: mysql -u root -p < schema.sql
-- ===========================================

CREATE DATABASE IF NOT EXISTS study_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE study_db;

-- -------------------------------------------
-- 게시글 테이블 (json-server topics 대체)
-- -------------------------------------------
DROP TABLE IF EXISTS topics;

CREATE TABLE topics (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    body        TEXT         NOT NULL,
    author      VARCHAR(50)  NOT NULL DEFAULT '익명',
    date        DATE         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- 학습 로그 테이블 (기존 study_logs 유지)
-- -------------------------------------------
DROP TABLE IF EXISTS study_logs;
CREATE TABLE study_logs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    category   VARCHAR(100) NOT NULL DEFAULT 'ETC',
    content    TEXT NOT NULL,
    code       TEXT,
    image_url  VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 샘플
INSERT INTO study_logs (title, category, content) VALUES
('Next.js Route Handler 학습', 'Next.js', 'GET, POST, PATCH, DELETE 라우트를 app/api 하위에 만드는 방법을 익혔다.'),
('MySQL JOIN 정리',           'MySQL',   'INNER JOIN, LEFT JOIN, RIGHT JOIN의 차이점을 표로 정리했다.'),
('CSS Grid 3열 레이아웃',     'CSS',     'grid-template-columns: repeat(3, 1fr); 만으로도 3열 카드 그리드가 만들어진다.');

-- -------------------------------------------
-- 샘플 데이터
-- -------------------------------------------
INSERT INTO topics (title, body, author, date) VALUES
('첫 번째 게시글', '안녕하세요. 첫 글입니다.', '김다은', CURDATE()),
('두 번째 게시글', 'MySQL 연결 테스트 글입니다.', '익명',  CURDATE());
