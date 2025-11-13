### [Board: Sprint 2 (Tuần 2) - Lõi Query & Bảo mật Multi-Tenant](https://trello.com/invite/b/69157fd61028c01ba9d80b7d/ATTIe333821ae6f23188256000b595d6bf9f03F56589/dự-an-dbaas-sprint-2)

**Mục tiêu Sprint 2:** Hoàn thành luồng "Viewer" (Xem schema, chạy `SELECT`, xem kết quả). Triển khai cơ chế "Schema-per-Tenant" và các biện pháp bảo mật/hiệu năng (cách ly user MySQL, đặt timeout).

#### Epic 1: [Backend] ⚙️ (Core DB Service - Pool Manager)

* `[BE/Core]` Thiết kế và triển khai "Pool Manager" (Quản lý Pool) trong `AppState` của Axum (vd: dùng `DashMap<TenantId, sqlx::MySqlPool>`).
* `[BE/Core]` Tích hợp thư viện crypto (vd: `aes-gcm`) để mã hóa/giải mã mật khẩu CSDL của tenant.
* `[BE/DB]` Viết hàm (ví dụ: `get_tenant_pool`) để:
    1.  Kiểm tra xem pool của tenant có trong `DashMap` không.
    2.  Nếu không, truy vấn `management_db.DatabaseInstances` để lấy credentials.
    3.  Giải mã mật khẩu.
    4.  Tạo `sqlx::Pool` mới và lưu vào `DashMap`.
    5.  Trả về `Pool`.

#### Epic 2: [Backend] 🚀 (Schema-per-Tenant - "Create Instance")

* `[BE/DB]` Tạo API `POST /api/v1/instances` (Create DB Instance).
* `[BE/DB]` Logic `POST /instances`:
    1.  Lấy `tenant_id` từ JWT.
    2.  Tạo tên schema mới (vd: `tenant_1_sandbox`).
    3.  Tạo tên user/password MySQL mới (vd: `tenant_1_user`, `random_password`).
    4.  Thực thi `CREATE DATABASE tenant_1_sandbox;` (dùng user admin của Axum).
    5.  Thực thi `CREATE USER 'tenant_1_user'@'%' IDENTIFIED BY '...';`.
    6.  Thực thi `GRANT ALL PRIVILEGES ON tenant_1_sandbox.* TO 'tenant_1_user'@'%';`.
    7.  Mã hóa `random_password` và lưu thông tin vào bảng `DatabaseInstances`.

#### Epic 3: [Backend] 🛡️ (Query Service - SELECT & Bảo mật)

* `[BE/Query]` Xây dựng `Query Service` (dưới dạng `axum::Router`).
* `[BE/Query]` Tạo API `POST /api/v1/query/select` (Execute SELECT Queries).
* `[BE/Query]` Logic `POST /query/select`:
    1.  Lấy `tenant_id` từ JWT.
    2.  Lấy `sqlx::Pool` của tenant (dùng Epic 1).
    3.  **(Bảo mật)** Phân tích (parse) query, đảm bảo nó *chỉ* là `SELECT`. Trả về lỗi 403 nếu là `DROP`, `INSERT`, `UPDATE`...
    4.  **Sử dụng `Pool` của tenant** (không phải `Pool` admin) để thực thi truy vấn.
* `[BE/Query]` Trả về kết quả (tên cột + dữ liệu hàng) dưới dạng JSON.

#### Epic 4: [Backend] ⏱️ (Hiệu năng & Logging)

* `[BE/Perf]` **(Hiệu năng)** Tích hợp `tokio::time::timeout` vào `POST /query/select`. Tự động hủy và trả về lỗi 408 nếu query chạy quá 30 giây.
* `[BE/Perf]` **(Hiệu năng)** (Lớp 2) Khi lấy kết nối từ pool (Epic 3), chạy lệnh `SET SESSION MAX_EXECUTION_TIME=30000;` để MySQL tự hủy query.
* `[BE/Log]` Tích hợp `AuditLogs`: Ghi lại hành động "User X executed SELECT query" vào bảng `AuditLogs`.
* `[BE/Log]` Tích hợp `QueryHistory`: Ghi lại toàn bộ text của query, `user_id`, và `execution_time` (thời gian thực thi) vào bảng `QueryHistory`.

#### Epic 5: [Frontend] 🖥️ (Main Layout & DB Explorer)

* `[FE/Core]` Cập nhật `MainLayout` (từ Sprint 1): Thêm cấu trúc Sidebar (bên trái) và khu vực Content (bên phải).
* `[BE/DB]` Tạo API `GET /api/v1/db/schema` (Browse Database Objects).
    * *Task phụ (BE):* Logic `GET /schema` phải dùng `Pool` của tenant (Epic 1) để chạy `SHOW TABLES;` và `SHOW COLUMNS FROM ...;`.
* `[FE/Explorer]` Xây dựng Giao diện `DB Explorer` (Module).
* `[FE/Explorer]` Tích hợp API `GET /db/schema` và hiển thị dưới dạng Tree-view (cây thư mục).

#### Epic 6: [Frontend] ⌨️ (Query Editor Module)

* `[FE/Query]` Xây dựng Giao diện `Query Editor` (Module).
* `[FE/Query]` Tích hợp thư viện code editor (vd: Monaco, CodeMirror) vào component.
* `[FE/Query]` Cấu hình SQL syntax highlighting cho editor.
* `[FE/Query]` Tạo nút "Run" và state (Zustand) để lưu trữ nội dung query, kết quả (data), hoặc lỗi (error).
* `[FE/Query]` Tích hợp API: Nút "Run" gọi `POST /api/v1/query/select` với nội dung text từ editor.

#### Epic 7: [Frontend] 📊 (Table Viewer Module)

* `[FE/Table]` Xây dựng Giao diện `Table Viewer` (Module).
* `[FE/Table]` Tạo component Bảng (Grid-based) (vd: dùng `react-table` hoặc `<table>` HTML).
* `[FE/Table]` Component này sẽ đọc state (kết quả hoặc lỗi) từ `Query Editor` (Epic 6).
* `[FE/Table]` Hiển thị kết quả (View Table Data) hoặc thông báo lỗi (vd: "Query timed out", "Syntax error...").

#### Epic 8: [Frontend] 🚀 (DB Instance UI)

* `[FE/DB]` Xây dựng Giao diện `Instance Management`: Tạo một trang mới (vd: `/instances`).
* `[FE/DB]` Tạo UI cho `Create DB Instance` (có thể là một nút "Tạo Sandbox DB Mới").
* `[FE/DB]` Tích hợp API `POST /api/v1/instances` (Epic 2).
* `[FE/DB]` (Task phụ) Tạo API `GET /api/v1/instances` và hiển thị danh sách các instance đã tạo (đọc từ bảng `DatabaseInstances`).

#### Epic 9: [Testing] 🧪 (Kiểm thử Thủ công)

* `[Test]` Viết Kịch bản Kiểm thử (Test Case) cho luồng "Viewer": Login -> Create Instance (Schema) -> Browse Schema -> Run SELECT -> View Results.
* `[Test/Security]` **(Rất quan trọng)** Test bảo mật:
    1.  Đăng nhập với `tenant_A`.
    2.  Trong Query Editor, thử chạy `SELECT * FROM management_db.Users;`.
    3.  **Mong đợi:** Query phải thất bại (lỗi 403 hoặc lỗi CSDL "permission denied").
* `[Test/Perf]` **(Rất quan trọng)** Test hiệu năng:
    1.  Tạo một bảng lớn.
    2.  Chạy một `SELECT` tốn thời gian (vd: `SELECT SLEEP(40);`).
    3.  **Mong đợi:** Frontend phải nhận được lỗi "Query timed out" sau 30 giây.

#### Epic 10: [DevOps] 🚚 (Cập nhật Deploy)

* `[DevOps/BE]` Cập nhật file `.env` trên EC2 với các biến môi trường mới (vd: `ENCRYPTION_KEY` cho credentials).
* `[DevOps/BE-Manual]` Cập nhật script `deploy_backend.sh` để đảm bảo nó build và restart `axum` service mượt mà.
* `[DevOps/FE-Manual]` Cập nhật script `deploy_frontend.sh` (nếu có thay đổi cấu hình build).